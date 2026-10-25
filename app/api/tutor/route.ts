import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { rateLimit } from '@/lib/rateLimit';
import { validateCredits, commitCreditDeduction, logTokenUsage, logUsageEvent } from '@/lib/credits';
import { calculateCreditCost } from '@/lib/tokenBillingEngine';
import { headers } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/lib/logger';

export const maxDuration = 60; // Allow longer streaming

export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 30, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { userId: authUserId } = await auth();
    const body = await req.json();
    const { message, subject, history, files } = body;

    if (!message && (!files || files.length === 0)) {
      return NextResponse.json({ error: 'Message or file is required' }, { status: 400 });
    }

    // PHASE 5: Safe Credit Deduction - Validate before execution
    const creditCheck = await validateCredits(authUserId, 0.05, ip);
    if (!creditCheck.ok) {
      return NextResponse.json({ error: creditCheck.error || 'CREDIT_LIMIT_EXCEEDED' }, { status: 403 });
    }

    const apiKey = process.env.Gemini_Api_Key;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key missing' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = 'gemini-2.5-flash-lite';
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: `You are EduAI Tutor — an elite, highly interactive, and visionary AI study companion.
Your goal is to make learning incredibly engaging, deeply understandable, and visually stunning.
Your teaching style:
- ALWAYS break complex answers into clear, numbered "Step-by-Step" sections.
- Use highly engaging formatting: aggressive use of Markdown headers (##, ###), bolding for keywords, emojis for visual anchors, and bullet points for lists.
- ALWAYS use tables where comparisons or data can be structured.
- Use blockquotes (> ) heavily for "💡 Core Concept" or "🔥 Pro Tip" callouts so they render beautifully.
- If solving math/science, explain the *why* before the *how*.
- End every explanation with a "🧠 Quick Knowledge Check" (a single, thought-provoking question to test their understanding).
- NEVER output a giant wall of text. Break paragraphs every 2-3 sentences. Use spacing and structure to keep it cinematic and scannable.
- IMPORTANT: When solving math or physics problems, wrap ALL mathematical expressions, equations, and steps in LaTeX syntax. Use $$...$$ for block equations and $...$ for inline math.
- If the user provides an image/PDF of a problem, solve it explicitly step-by-step using LaTeX.

${subject ? `Focus area: ${subject}` : 'General academic tutoring'}

Keep responses concise but extremely well-structured and premium.`,
    });

    const conversationHistory = (history || []).slice(-10).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Handle files (images/pdfs)
    const currentParts: any[] = [];
    if (message) currentParts.push({ text: message });
    
    if (files && files.length > 0) {
      for (const file of files) {
        // file should have mimeType and base64Data
        if (file.mimeType && file.base64Data) {
          currentParts.push({
            inlineData: {
              data: file.base64Data,
              mimeType: file.mimeType
            }
          });
        }
      }
    }

    const contents = [
      ...conversationHistory,
      { role: 'user', parts: currentParts },
    ];

    const result = await model.generateContentStream({
      contents,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
        topP: 0.95,
      },
    });

    // Create a readable stream for SSE or raw streaming
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullReply = "";
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullReply += chunkText;
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
          controller.close();

          // After stream completes successfully, process billing and logging
          if (authUserId) {
            try {
              const response = await result.response;
              const usageMetadata = response.usageMetadata;
              const requestId = crypto.randomUUID();
              
              // Calculate token cost
              const actualCost = calculateCreditCost(modelName, usageMetadata);
              
              // Atomically deduct exactly the token cost
              await commitCreditDeduction(authUserId, actualCost, 'tutor', requestId);
              
              // Log detailed token usage
              await logTokenUsage(authUserId, 'tutor', modelName, usageMetadata, actualCost, requestId);
              
              // Log generic usage
              await logUsageEvent(authUserId, 'tutor', { subject, historyLength: history?.length }, { success: true }, actualCost);

            } catch (billingErr) {
               logger.error("Billing post-processing error (Tutor):", billingErr);
            }
          }
        } catch (e: any) {
          logger.error("Stream Error:", e);
          controller.error(e);
          // Do NOT deduct credits if the stream threw an error (Phase 5 - Safe Deduction)
          if (authUserId) {
            await logUsageEvent(authUserId, 'tutor', { subject }, { error: String(e) }, 0, 'failed', String(e));
          }
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-transform',
      },
    });

  } catch (err: any) {
    logger.error('Tutor API error:', err);
    if (err.message && (err.message.includes('429 Too Many Requests') || err.message.includes('429'))) {
      return NextResponse.json({ error: 'Servers are experiencing high traffic right now. Please try again in 15 seconds.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Failed to process request safely' }, { status: 500 });
  }
}