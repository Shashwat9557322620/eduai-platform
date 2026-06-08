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

    if (!authUserId || (userId && userId !== authUserId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (authUserId) {
      const creditCheck = await checkAndDeductCredit(authUserId);
      if (!creditCheck.ok) {
        return NextResponse.json({ error: creditCheck.error || 'CREDIT_LIMIT_EXCEEDED' }, { status: 403 });
      }
    }

    const apiKey = process.env.Gemini_Api_Key;
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing in .env.local" }, { status: 500 });
    }

    const prompt = `Act as an expert AI Curriculum Strategist. Break down this syllabus into a highly structured ${days}-day study plan. 
    You MUST return ONLY a valid JSON array of objects. DO NOT output any conversational text. Start directly with '[' and end with ']'.
    
    Each object inside the array must match this exact structure:
    {
      "day": 1,
      "title": "Short punchy day title",
      "description": "Brief summary of the day.",
      "timetable": [
        { "time": "09:00 AM - 11:00 AM", "slotTitle": "Concept Mapping", "details": "Core formulas and definitions." },
        { "time": "02:00 PM - 04:00 PM", "slotTitle": "Practice Drill", "details": "Solve numericals and key reactions." }
      ]
    }
    
    Syllabus data to structure: ${syllabus}`;

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
