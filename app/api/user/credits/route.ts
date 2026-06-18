import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabaseClient';
import { rateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 30, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ credits: 0, plan_name: 'Guest' });
    }

    const { data, error } = await supabase
      .from('user_credits')
      .select('credits, plan_name')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Create initial record
      await supabase
        .from('user_credits')
        .insert({ user_id: userId, credits: 30, plan_name: 'Free Trial' });
      return NextResponse.json({ credits: 30, plan_name: 'Free Trial' });
    }

    return NextResponse.json({ credits: data.credits || 0, plan_name: data.plan_name || 'Free Trial' });
  } catch (error) {
    console.error('Credits fetch error:', error);
    return NextResponse.json({ credits: 0, plan_name: 'Free Trial' });
  }
}
