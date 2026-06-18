import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { rateLimit } from '@/lib/rateLimit';
import { generateSchema } from '@/lib/validation';
import { checkAndDeductCredit, logUserHistory } from '@/lib/credits';
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
    syllabus = validation.data.syllabus;
    days = validation.data.days || validation.data.targetDays || null;
    userId = validation.data.userId || null;

    if (userId && authUserId && userId !== authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const effectiveUserId = authUserId || userId;

    if (effectiveUserId) {
      const creditCheck = await checkAndDeductCredit(effectiveUserId);
      if (!creditCheck.ok) {
        return NextResponse.json({ error: creditCheck.error || 'CREDIT_LIMIT_EXCEEDED' }, { status: 403 });
      }
    }

    const apiKey = process.env.Gemini_Api_Key;
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing in .env.local" }, { status: 500 });
    }

    const prompt = `You are an elite AI Curriculum Strategist and Learning Architect. Create an optimized ${days}-day study plan that maximizes retention and minimizes burnout.

    CRITICAL: Return ONLY a valid JSON array. No markdown, no explanations, no text before/after. Start with [ and end with ].

    Each day object must have this EXACT structure:
    {
      "day": 1,
      "title": "Catchy, motivating title for the day",
      "description": "2-3 sentence overview of what the student will master today. Be specific about outcomes.",
      "timetable": [
        { "time": "09:00 AM - 11:00 AM", "slotTitle": "Deep Focus Session", "details": "What specific topics and why they matter." },
        { "time": "11:15 AM - 12:30 PM", "slotTitle": "Active Recall", "details": "Practice problems and self-testing approach." },
        { "time": "02:00 PM - 04:00 PM", "slotTitle": "Applied Practice", "details": "Real-world application and problem-solving." },
        { "time": "04:15 PM - 05:30 PM", "slotTitle": "Review & Synthesis", "details": "Connect today's concepts and preview tomorrow." }
      ]
    }

    Guidelines:
    - Front-load the most difficult topics early when motivation is highest
    - Include deliberate breaks and recovery time
    - Each day should build logically on the previous
    - Make descriptions outcome-focused ("By end of day, you'll be able to...")
    - Vary the slot titles to keep things interesting
    
    Syllabus to structure: ${syllabus}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!geminiResponse.ok) {
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

    return NextResponse.json({ protocol });

  } catch (error: unknown) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to generate AI plan." }, { status: 500 });
  } finally {
    if (userId) {
      logUserHistory(userId, 'optimizer', `syllabus: ${String(syllabus || '').slice(0, 100)}, days: ${days}`);
    }
  }
}
