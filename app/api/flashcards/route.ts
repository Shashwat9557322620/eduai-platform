import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.Gemini_Api_Key;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing in environment variables" }, { status: 500 });
    }

    const prompt = `You are an AI tutor. Extract key concepts from this text and create flashcards. 
    If the text is just a greeting, a name, or very short, make a simple fun flashcard out of it.
    Return ONLY a valid JSON array containing objects. Each object must have exactly two keys: "front" and "back".
    Do NOT include markdown formatting like \`\`\`json.
    Text: ${text}`;

    // ✅ SDK nahi, seedha REST — gemini-2.5-flash-lite free tier mein available
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
    let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!rawText) throw new Error("No response from Gemini");

    // JSON safaai
    rawText = rawText.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

    const flashcards = JSON.parse(rawText);
    return NextResponse.json({ flashcards });

  } catch (error: any) {
    console.error("Flashcard Error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse data" }, { status: 500 });
  }
}