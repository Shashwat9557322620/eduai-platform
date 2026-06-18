import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { rateLimit } from '@/lib/rateLimit';
import { refundSchema } from '@/lib/validation';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const result = refundSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }
    const { user_id, user_email, order_id, amount, reason } = result.data;

    const { data, error } = await supabase.from('refund_requests').insert({
      user_id: user_id || null,
      user_email,
      order_id: order_id || null,
      amount: amount || 0,
      reason,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      refund: data,
      message: 'Refund request submitted successfully. You will be notified via email.'
    });
  } catch (error) {
    console.error('Refund request error:', error);
    return NextResponse.json({ error: 'Failed to submit refund request' }, { status: 500 });
  }
}
