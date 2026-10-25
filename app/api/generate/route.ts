import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { rateLimit } from '@/lib/rateLimit';
import { generateSchema } from '@/lib/validation';
import { validateCredits, commitCreditDeduction, logTokenUsage, logUsageEvent } from '@/lib/credits';
import { calculateCreditCost } from '@/lib/tokenBillingEngine';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 5, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let userId: string | null = null;
  let syllabus: string | null = null;
  let days: string | null = null;
  
  try {
    const { userId: authUserId } = await auth();
    const body = await req.json();
    const validation = generateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }
    syllabus = validation.data.syllabus || null;
    const images = validation.data.images;
    days = validation.data.days || validation.data.targetDays || null;
    userId = validation.data.userId || null;

    if (userId && authUserId && userId !== authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const effectiveUserId = authUserId || userId;
    const userGeminiKey = req.headers.get('x-user-gemini-key');
    const isCustomKey = !!userGeminiKey;

    if (!isCustomKey && Number(days) > 60) {
      return NextResponse.json({ error: "Free Tier Limit: Max 60 days. Please add your own Gemini API Key in Settings for unlimited access." }, { status: 403 });
    }

    if (!isCustomKey) {
      const creditCheck = await validateCredits(effectiveUserId, 0.1, ip);
      if (!creditCheck.ok) {
        return NextResponse.json({ error: creditCheck.error || 'CREDIT_LIMIT_EXCEEDED' }, { status: 403 });
      }
    }

    const apiKey = userGeminiKey || process.env.Gemini_Api_Key;
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing in .env.local" }, { status: 500 });
    }

    const prompt = `You are an elite AI Curriculum Strategist and Learning Architect. Create an optimized ${days}-day study plan that maximizes retention and minimizes burnout.

    CRITICAL INSTRUCTIONS FOR JSON:
    1. Return ONLY a valid JSON array. No markdown.
    2. NEVER use double quotes (") inside your text strings. Use single quotes (') instead to prevent parsing errors.
    3. Keep all descriptions strictly under 150 characters. Be extremely concise.
    4. Generate EXACTLY ${days} days.

    Each day object must have this EXACT structure:
    {
      "day": 1,
      "title": "Motivating title",
      "description": "Very short 1-sentence overview.",
      "timetable": [
        { "time": "09:00 AM - 11:00 AM", "slotTitle": "Deep Focus", "details": "Specific topics" },
        { "time": "11:15 AM - 12:30 PM", "slotTitle": "Active Recall", "details": "Practice" }
      ]
    }

    Guidelines:
    - Front-load difficult topics early
    - Include breaks
    
    Syllabus to structure: ${syllabus || 'See attached documents'}`;

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

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: promptParts }],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 8192
          }
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
    const planText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!planText) {
      throw new Error("No response from Gemini");
    }

    let cleanText = planText.trim();
    const firstBracket = cleanText.indexOf('[');
    const lastBracket = cleanText.lastIndexOf(']');
    
    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanText = cleanText.substring(firstBracket, lastBracket + 1);
    } else {
      throw new Error("AI ne JSON array format nahi diya.");
    }

    const protocol = JSON.parse(cleanText);

    // Phase 5 & Phase 3: Token Accounting and Safe Deduction
    if (effectiveUserId && !isCustomKey) {
      const usageMetadata = geminiData.usageMetadata;
      const modelName = 'gemini-2.5-flash';
      const requestId = crypto.randomUUID();
      const actualCost = calculateCreditCost(modelName, usageMetadata);
      
      await commitCreditDeduction(effectiveUserId, actualCost, 'optimizer', requestId);
      await logTokenUsage(effectiveUserId, 'optimizer', modelName, usageMetadata, actualCost, requestId);
      await logUsageEvent(effectiveUserId, 'optimizer', { syllabus: syllabus?.slice(0, 100), days }, { success: true }, actualCost);
    }

    return NextResponse.json({ protocol });

  } catch (error: unknown) {
    const { logger } = await import('@/lib/logger');
    logger.error("Gemini API Error:", error);
    const effectiveUserId = userId; // Fallback tracking for failed req
    if (effectiveUserId) {
      await logUsageEvent(effectiveUserId, 'optimizer', { syllabus: syllabus?.slice(0, 100), days }, { error: String(error) }, 0, 'failed', String(error));
    }
    return NextResponse.json({ error: "Failed to generate AI plan securely." }, { status: 500 });
  }
}
