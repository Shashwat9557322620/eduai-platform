import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { newsletterSchema } from '@/lib/validation';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 20, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const result = newsletterSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }
    const { email } = result.data;

    // Log to Supabase newsletter table
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const res = await fetch(`${supabaseUrl}/rest/v1/newsletter_subscribers`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        email,
        subscribed_at: new Date().toISOString(),
        source: 'blog',
      })
    });

    if (!res.ok && res.status !== 409) {
      const errData = await res.text();
      console.error('Newsletter subscription error:', errData);
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (error: unknown) {
    console.error('Newsletter API error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to subscribe" }, { status: 500 });
  }
}
