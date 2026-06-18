import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { rateLimit } from '@/lib/rateLimit';
import { feedbackSchema } from '@/lib/validation';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 20, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const result = feedbackSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }
    const { userId, rating, message } = result.data;

    const { error } = await supabase.from('feedbacks').insert({
      user_id: userId || 'anonymous',
      rating: rating || 0,
      message: message || '',
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
