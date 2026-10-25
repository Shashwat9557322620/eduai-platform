import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { rateLimit } from '@/lib/rateLimit';
import { analyzeSchema } from '@/lib/validation';
import { validateCredits, commitCreditDeduction, logTokenUsage, logUsageEvent } from '@/lib/credits';
import { calculateCreditCost } from '@/lib/tokenBillingEngine';
import { headers } from 'next/headers';

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

    const validation = analyzeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }
    const { role, skills, images } = validation.data;

    const effectiveUserId = authUserId || userId;
    const userGeminiKey = req.headers.get('x-user-gemini-key');
    const isCustomKey = !!userGeminiKey;

    if (!isCustomKey) {
      // Phase 5: Safe Deduction
      const creditCheck = await validateCredits(effectiveUserId || null, 0.05, ip);
      if (!creditCheck.ok) {
        return NextResponse.json({ error: creditCheck.error || 'CREDIT_LIMIT_EXCEEDED' }, { status: 403 });
      }
    }

    const apiKey = userGeminiKey || process.env.Gemini_Api_Key;
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing in .env.local" }, { status: 500 });
    }

    const prompt = `You are an elite Tech Career Coach and Hiring Manager with 15+ years of experience.

    Analyze the skill gap for: "${role}"
    Candidate's current skills/resume: "${skills || 'See attached documents'}"

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

    const modelName = 'gemini-2.5-flash-lite';
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: promptParts }]
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
    const analysis = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysis) throw new Error("No response from Gemini");

    // Phase 5 & 3: Token Accounting & Safe Deduction
    if (effectiveUserId && !isCustomKey) {
      const usageMetadata = geminiData.usageMetadata;
      const requestId = crypto.randomUUID();
      const actualCost = calculateCreditCost(modelName, usageMetadata);
      
      await commitCreditDeduction(effectiveUserId, actualCost, 'analyzer', requestId);
      await logTokenUsage(effectiveUserId, 'analyzer', modelName, usageMetadata, actualCost, requestId);
      await logUsageEvent(effectiveUserId, 'analyzer', { role, skills: skills?.slice(0, 100) }, { success: true }, actualCost);
    }

    return NextResponse.json({ analysis });

  } catch (error: unknown) {
    const { logger } = await import('@/lib/logger');
    logger.error("Analyzer Error:", error);
    const idToLog = userId || ip || 'anonymous';
    if (body) {
      await logUsageEvent(idToLog, 'analyzer', { role: body?.role, skills: String(body?.skills || '').slice(0, 100) }, { error: String(error) }, 0, 'failed', String(error));
    }
    return NextResponse.json({ error: "Failed to analyze safely" }, { status: 500 });
  }
}
