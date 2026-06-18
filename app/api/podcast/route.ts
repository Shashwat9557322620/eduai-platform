import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkAndDeductCredit, logUserHistory } from '@/lib/credits';
import { rateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { syllabus, days } = await req.json();
    
    const creditCheck = await checkAndDeductCredit(userId);
    if (!creditCheck.ok) return NextResponse.json({ error: creditCheck.error }, { status: 403 });
    
    const prompt = `Convert this ${days}-day study plan into an engaging podcast script. 
    Include: intro, daily breakdown with key concepts, study tips, and outro.
    Make it conversational and motivating. Syllabus: ${syllabus}`;
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.Gemini_Api_Key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    
    const data = await geminiResponse.json();
    const script = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    await logUserHistory(userId, 'podcast', `days: ${days}`, 1);
    
    return NextResponse.json({ script, audioUrl: null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
