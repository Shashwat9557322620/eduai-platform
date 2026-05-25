import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const syllabus = body.syllabus;
    const days = body.days || body.targetDays;
    const userId = body.userId;

    if (!syllabus || !days) {
      return NextResponse.json({ error: "Syllabus and Target Days are required." }, { status: 400 });
    }

    if (userId) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const response = await fetch(`${supabaseUrl}/rest/v1/user_credits?user_id=eq.${userId}`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      });
      const data = await response.json();
      const userRecord = data[0];
      if (userRecord && userRecord.credits <= 0) {
        return NextResponse.json({ error: "CREDIT_LIMIT_EXCEEDED: No credits left. Please upgrade." }, { status: 403 });
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

    // ✅ TERA EXACT SAME FETCH CODE (NO CHANGES HERE) ✅
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

    // 🔥 THE FIX: BULLETPROOF JSON EXTRACTOR 🔥
    // Ye AI ke kachre ko ignore karke sirf array extract karega
    let cleanText = planText.trim();
    const firstBracket = cleanText.indexOf('[');
    const lastBracket = cleanText.lastIndexOf(']');
    
    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanText = cleanText.substring(firstBracket, lastBracket + 1);
    } else {
      throw new Error("AI ne JSON array format nahi diya.");
    }

    const protocol = JSON.parse(cleanText);

    if (userId) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      await fetch(`${supabaseUrl}/rest/v1/user_credits?user_id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ updated_at: new Date() })
      });
    }

    return NextResponse.json({ protocol });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate AI plan." }, { status: 500 });
  }
}