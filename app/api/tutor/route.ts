import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { rateLimit } from '@/lib/rateLimit';
import { checkAndDeductCredit, logUserHistory } from '@/lib/credits';
import { headers } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

    if (authUserId) {
      const creditCheck = await checkAndDeductCredit(authUserId);
      if (!creditCheck.ok) {
        return NextResponse.json({ error: creditCheck.error || 'CREDIT_LIMIT_EXCEEDED' }, { status: 403 });
      }
    }

    const apiKey = process.env.Gemini_Api_Key;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key missing' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      systemInstruction: `You are EduAI Tutor — an elite, highly interactive, and visionary AI study companion.
Your goal is to make learning incredibly engaging, deeply understandable, and visually stunning.
Your teaching style:
- ALWAYS break complex answers into clear, numbered "Step-by-Step" sections.
- Use highly engaging formatting: bolding for keywords, emojis for visual anchors, and bullet points for lists.
- Use blockquotes (> ) heavily for "💡 Core Concept" or "🔥 Pro Tip" callouts so they render beautifully.
- If solving math/science, explain the *why* before the *how*.
- End every explanation with a "🧠 Quick Knowledge Check" (a single, thought-provoking question to test their understanding).
- NEVER output a giant wall of text. Use spacing and structure to keep it cinematic.
- IMPORTANT: When solving math or physics problems, wrap ALL mathematical expressions, equations, and steps in LaTeX syntax. Use $$...$$ for block equations and $...$ for inline math.
- If the user provides an image/PDF of a problem, solve it explicitly step-by-step using LaTeX.

${subject ? `Focus area: ${subject}` : 'General academic tutoring'}

Keep responses concise but thorough. Use analogies from everyday life to explain abstract concepts.`,
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

          // Log history after stream completes
          if (authUserId) {
            try {
              await logUserHistory(authUserId, 'tutor', JSON.stringify({ 
                message: message ? message.slice(0, 200) : "Uploaded file", 
                subject: subject || 'general' 
              }));
            } catch { /* noop */ }
          }
        } catch (e) {
          console.error("Stream Error:", e);
          controller.error(e);
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
    console.error('Tutor API error:', err);
    if (err.message && err.message.includes('429 Too Many Requests')) {
      return NextResponse.json({ error: 'Gemini API Quota Exceeded. Please try again later or check your API key billing.' }, { status: 429 });
    }
    return NextResponse.json({ error: err.message || 'Internal server error', stack: err.stack }, { status: 500 });
  }
}