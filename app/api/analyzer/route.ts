import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { rateLimit } from '@/lib/rateLimit';
import { analyzeSchema } from '@/lib/validation';
import { checkAndDeductCredit, logUserHistory } from '@/lib/credits';
import { headers } from 'next/headers';

// Helper to log usage history to Supabase


export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let userId: string | null = null;
  let body: Record<string, unknown> | null = null;
  try {
    const { userId: authUserId } = await auth();
    body = await req.json() as Record<string, unknown> | null;
    userId = (body?.userId as string) || null;

    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const validation = analyzeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }
    const { role, skills } = validation.data;

    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creditCheck = await checkAndDeductCredit(authUserId);
    if (!creditCheck.ok) {
      return NextResponse.json({ error: creditCheck.error || 'Credit limit exceeded' }, { status: 403 });
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

  } catch (error: unknown) {
    console.error("Analyzer Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to analyze skills" }, { status: 500 });
  } finally {
    if (userId && body) {
      logUserHistory(userId, 'analyzer', `role: ${String(body?.role || '').slice(0, 50)}, skills: ${String(body?.skills || '').slice(0, 50)}`);
    }
  }
}
