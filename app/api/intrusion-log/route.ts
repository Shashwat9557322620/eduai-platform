import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { rateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { ip_address, path, event_type, severity, user_agent } = body;

    if (!ip_address || !event_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const payload = {
      ip_address: ip_address,
      path: path || '/unknown',
      event_type: event_type,
      severity: severity || 'low',
      user_agent: user_agent || null,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('hacker_intrusions').insert([payload]);

    if (error) {
      console.error('Intrusion log insert error:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Intrusion log error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
