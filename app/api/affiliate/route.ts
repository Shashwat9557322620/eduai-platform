import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, platform, audience, niche, reason } = body;

    if (!name || !email || !platform || !audience) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('affiliate_applications').insert({
      name,
      email,
      platform,
      audience_size: audience,
      niche: niche || null,
      reason: reason || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[Affiliate Insert Error]', error);
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Affiliate Error]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
