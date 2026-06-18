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

    const effectiveUserId = authUserId || userId;

    if (effectiveUserId) {
      const creditCheck = await checkAndDeductCredit(effectiveUserId);
      if (!creditCheck.ok) {
        return NextResponse.json({ error: creditCheck.error || 'Credit limit exceeded' }, { status: 403 });
      }
    }

    const apiKey = process.env.Gemini_Api_Key;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const prompt = `You are an elite Tech Career Coach and Hiring Manager with 15+ years of experience.

    Analyze the skill gap for: "${role}"
    Candidate's current skills/resume: "${skills}"

    Create a comprehensive career analysis in Markdown format:

    ## Overall Match Score
    Give a percentage (0-100%) with brief justification.

    ## What You Have (Strengths)
    - List specific skills that directly apply to this role
    - Highlight any competitive advantages

    ## Critical Gaps
    - Missing technical skills (ranked by importance)
    - Missing soft skills
    - Missing tools/frameworks
    - Missing certifications (if relevant)

    ## 90-Day Acceleration Plan
    Break into 3 phases:
    - **Week 1-4:** Foundation building (what to learn first)
    - **Week 5-8:** Practical application (projects to build)
    - **Week 9-12:** Advanced topics and portfolio pieces

    ## Recommended Resources
    - Specific courses, books, or projects
    - Free vs paid options
    - Time estimates for each

    ## Portfolio Projects
    - 2-3 project ideas that demonstrate the required skills
    - Why each project matters for this specific role

    Use concrete examples. Be specific about technologies and methodologies.`;

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
