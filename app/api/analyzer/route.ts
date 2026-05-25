import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { role, skills } = await req.json();
    if (!role || !skills) {
      return NextResponse.json({ error: "Job role and current skills are required" }, { status: 400 });
    }

    const apiKey = process.env.Gemini_Api_Key;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const prompt = `You are an elite Tech Career Coach & Recruiter.
    Analyze the skill gap for a candidate targeting the role of "${role}".
    Their current skills/resume text: "${skills}".
    
    Provide a premium, highly detailed career roadmap in Markdown format. Include:
    1. Match Percentage (Give a prominent metric/percentage).
    2. Missing Core Skills (What they lack for this role).
    3. Missing Soft Skills/Tooling.
    4. Actionable 30-60-90 Day Learning Path to bridge this gap.
    Use professional markdown headers and clean bullet points.`;

    // ✅ SDK nahi, REST API — gemini-2.5-flash-lite free + working
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
    const analysis = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysis) throw new Error("No response from Gemini");

    return NextResponse.json({ analysis });

  } catch (error: any) {
    console.error("Analyzer Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze skills" }, { status: 500 });
  }
}