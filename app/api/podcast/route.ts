import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { validateCredits, commitCreditDeduction, logTokenUsage, logUsageEvent } from '@/lib/credits';
import { calculateCreditCost } from '@/lib/tokenBillingEngine';
import { rateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: any = {};
  
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    body = await req.json();
    const { syllabus, days } = body;
    
    // Phase 5: Safe deduction - validate first
    const creditCheck = await validateCredits(userId || null, 0.05, ip);
    if (!creditCheck.ok) return NextResponse.json({ error: creditCheck.error }, { status: 403 });
    
    const prompt = `Convert this ${days}-day study plan into an engaging podcast script. 
    Include: intro, daily breakdown with key concepts, study tips, and outro.
    Make it conversational and motivating. Syllabus: ${syllabus}`;
    
    const modelName = 'gemini-2.5-flash-lite';
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.Gemini_Api_Key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    
    if (!geminiResponse.ok) {
       throw new Error(`Gemini API failed with status ${geminiResponse.status}`);
    }
    
    const data = await geminiResponse.json();
    const script = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!script) {
       throw new Error("No script generated from Gemini");
    }

    // Phase 5 & 3: Token Accounting & Safe Deduction
    const usageMetadata = data.usageMetadata;
    const requestId = crypto.randomUUID();
    const actualCost = calculateCreditCost(modelName, usageMetadata);
    
    await commitCreditDeduction(userId, actualCost, 'podcast', requestId);
    await logTokenUsage(userId, 'podcast', modelName, usageMetadata, actualCost, requestId);
    await logUsageEvent(userId, 'podcast', { days, syllabus: String(syllabus).slice(0, 50) }, { success: true }, actualCost);
    
    return NextResponse.json({ script, audioUrl: null });
  } catch (error: any) {
    const { userId } = await auth();
    if (userId) {
       await logUsageEvent(userId, 'podcast', { days: body?.days }, { error: error.message }, 0, 'failed', error.message);
    }
    return NextResponse.json({ error: "Failed to generate podcast safely" }, { status: 500 });
  }
}
