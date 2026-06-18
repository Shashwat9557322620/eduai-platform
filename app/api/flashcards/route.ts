import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { rateLimit } from '@/lib/rateLimit';
import { flashcardSchema } from '@/lib/validation';
import { headers } from 'next/headers';

async function logUserHistory(userId: string, toolName: string, input: any, creditsUsed: number = 1) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    await fetch(`${supabaseUrl}/rest/v1/user_history`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        tool_name: toolName,
        input: typeof input === 'string' ? input : JSON.stringify(input),
        credits_used: creditsUsed,
        created_at: new Date().toISOString()
      })
    });
  } catch (e) {
    console.error('History log error:', e);
  }
}

async function checkAndDeductCredit(userId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const response = await fetch(`${supabaseUrl}/rest/v1/user_credits?user_id=eq.${userId}&select=credits`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const data = await response.json();
    const userRecord = data[0];
    if (!userRecord || userRecord.credits <= 0) {
      return { ok: false, error: "CREDIT_LIMIT_EXCEEDED: No credits left. Please upgrade." };
    }
    const currentCredits = userRecord.credits ?? 0;
    const newCredits = Math.max(0, currentCredits - 1);
    await fetch(`${supabaseUrl}/rest/v1/user_credits?user_id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ credits: newCredits, updated_at: new Date().toISOString() })
    });
    return { ok: true };
  } catch (e) {
    console.error('Credit check error:', e);
    return { ok: true };
  }
}

export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let userId: string | null = null;
  let body: { text?: string; userId?: string } | null = null;

  // Clone request so we can fall back to text() if JSON parse fails
  const clonedReq = req.clone();

  try {
    const { userId: authUserId } = await auth();
    body = await req.json();
    userId = body?.userId || null;
    const validation = flashcardSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }
    const { text } = validation.data;

    const effectiveUserId = authUserId || userId;

    if (!effectiveUserId) {
      // Allow basic usage without auth for demo purposes
    }

    if (effectiveUserId) {
      const creditCheck = await checkAndDeductCredit(effectiveUserId);
      if (!creditCheck.ok) {
        return NextResponse.json({ error: creditCheck.error }, { status: 403 });
      }
    }

    const apiKey = process.env.Gemini_Api_Key;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing in environment variables" }, { status: 500 });
    }

    const prompt = `You are an expert educator creating high-quality flashcards that maximize learning retention.

    CRITICAL RULES:
    - Return ONLY a valid JSON array. No markdown, no explanations.
    - Each card must have exactly "front" and "back" keys.
    - Generate 8-15 cards depending on content depth.
    - Front: Clear, specific question or concept (not vague)
    - Back: Concise but complete answer with key details

    CARD CREATION PRINCIPLES:
    1. Front cards should be specific questions, not statements
    2. Back answers should include key formulas, definitions, or steps
    3. Mix question types: definitions, comparisons, applications, "what if" scenarios
    4. Include real-world examples when possible
    5. Make connections between concepts explicit

    If the text is very short (like a greeting), create a simple, engaging flashcard from it.
    If the text is empty or nonsensical, return [{"front": "Ready to learn?", "back": "Paste some content and I'll create flashcards for you!"}]

    Text to create flashcards from: ${text}`;

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

    rawText = rawText.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

    let flashcards;
    try {
      flashcards = JSON.parse(rawText);
    } catch {
      // Fallback: split text into simple flashcards
      const lines = rawText.split('\n').filter((l: string) => l.trim());
      flashcards = lines.slice(0, 10).map((line: string, i: number) => ({
        front: line.replace(/^\d+[.):\s]+/, '').slice(0, 100) || `Concept ${i + 1}`,
        back: lines[i + 1]?.replace(/^\d+[.):\s]+/, '').slice(0, 200) || 'See notes',
      }));
    }
    return NextResponse.json({ flashcards });

  } catch (error: unknown) {
    console.error("Flashcard Error:", error);
    // Fallback: Generate flashcards from text splitting
    try {
      const text = await clonedReq.text();
      const cards = text.split('\n\n').map((block, i) => ({
        id: i,
        front: block.split('\n')[0] || `Card ${i+1}`,
        back: block.split('\n').slice(1).join('\n') || 'No content'
      }));
      return NextResponse.json({ flashcards: cards });
    } catch {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to parse data" }, { status: 500 });
    }
  } finally {
    if (userId && body) {
      logUserHistory(userId, 'flashcards', `text: ${String(body?.text || '').slice(0, 100)}`);
    }
  }
}
