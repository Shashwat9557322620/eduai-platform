import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { rateLimit } from '@/lib/rateLimit';
import { flashcardSchema } from '@/lib/validation';
import { validateCredits, commitCreditDeduction, logTokenUsage, logUsageEvent } from '@/lib/credits';
import { calculateCreditCost } from '@/lib/tokenBillingEngine';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let userId: string | null = null;
  let body: { text?: string; userId?: string } | null = null;
  const clonedReq = req.clone();

  try {
    const { userId: authUserId } = await auth();
    body = await req.json();
    userId = body?.userId || null;
    const validation = flashcardSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }
    const { text, images } = validation.data;

    const effectiveUserId = authUserId || userId;
    const userGeminiKey = req.headers.get('x-user-gemini-key');
    const isCustomKey = !!userGeminiKey;

    if (!isCustomKey) {
      const creditCheck = await validateCredits(effectiveUserId, 0.05, ip);
      if (!creditCheck.ok) {
        return NextResponse.json({ error: creditCheck.error || 'CREDIT_LIMIT_EXCEEDED' }, { status: 403 });
      }
    }

    const apiKey = userGeminiKey || process.env.Gemini_Api_Key;
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing in .env.local" }, { status: 500 });
    }

    const prompt = `You are an expert educator creating high-quality flashcards that maximize learning retention.

    CRITICAL RULES:
    - Return ONLY a valid JSON array. No markdown, no explanations.
    - Each card must have exactly "front" and "back" keys.
    - Generate 8-15 cards depending on content depth.
    - Front: Clear, specific question or concept (not vague)
    - Back: Concise but complete answer with key details

    CARD CREATION PRINCIPLES:
    1. Front cards should be specific questions, not statements
    2. Back answers should include key formulas, definitions, or steps
    3. Mix question types: definitions, comparisons, applications, "what if" scenarios
    4. Include real-world examples when possible
    5. Make connections between concepts explicit

    If the text is very short (like a greeting), create a simple, engaging flashcard from it.
    If the text is empty or nonsensical, return [{"front": "Ready to learn?", "back": "Paste some content and I'll create flashcards for you!"}]

    Text to create flashcards from: ${text || 'See attached documents'}`;

    const promptParts: any[] = [{ text: prompt }];
    if (images && images.length > 0) {
      for (const img of images) {
        promptParts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data,
          }
        });
      }
    }

    const modelName = 'gemini-2.5-flash';
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: promptParts }]
        })
      }
    );

    if (!geminiResponse.ok) {
      if (geminiResponse.status === 429) {
        return NextResponse.json({ error: "Servers are experiencing high traffic right now. Please try again in 15 seconds." }, { status: 429 });
      }
      const errData = await geminiResponse.json();
      throw new Error(errData.error?.message || "Gemini API failed");
    }

    const geminiData = await geminiResponse.json();
    let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!rawText) throw new Error("No response from Gemini");

    rawText = rawText.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

    let flashcards;
    try {
      flashcards = JSON.parse(rawText);
    } catch {
      const lines = rawText.split('\n').filter((l: string) => l.trim());
      flashcards = lines.slice(0, 10).map((line: string, i: number) => ({
        front: line.replace(/^\d+[.):\s]+/, '').slice(0, 100) || `Concept ${i + 1}`,
        back: lines[i + 1]?.replace(/^\d+[.):\s]+/, '').slice(0, 200) || 'See notes',
      }));
    }

    // Phase 5 & 3: Token Accounting & Safe Deduction
    if (effectiveUserId && !isCustomKey) {
      const usageMetadata = geminiData.usageMetadata;
      const requestId = crypto.randomUUID();
      const actualCost = calculateCreditCost(modelName, usageMetadata);
      
      await commitCreditDeduction(effectiveUserId, actualCost, 'flashcards', requestId);
      await logTokenUsage(effectiveUserId, 'flashcards', modelName, usageMetadata, actualCost, requestId);
      await logUsageEvent(effectiveUserId, 'flashcards', { text: text?.slice(0, 100) }, { success: true }, actualCost);
    }

    return NextResponse.json({ flashcards });

  } catch (error: unknown) {
    console.error("Flashcard Error:", error);
    
    // Log failure
    const idToLog = userId || ip || 'anonymous';
    await logUsageEvent(idToLog, 'flashcards', { text: body?.text?.slice(0, 100) }, { error: String(error) }, 0, 'failed', String(error));
    
    // Instead of parsing the raw JSON request body as flashcards, return a clear error.
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to generate flashcards. Please try again or rephrase your text." }, { status: 500 });
  }
}
