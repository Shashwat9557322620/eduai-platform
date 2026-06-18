import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { auth, clerkClient } from '@clerk/nextjs/server';
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user email from Clerk SDK
    let email = '';
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      email = user.emailAddresses[0]?.emailAddress || '';
    } catch {
      return NextResponse.json({ refunds: [] });
    }
    if (!email) {
      return NextResponse.json({ refunds: [] });
    }

    const { data, error } = await supabase
      .from('refund_requests')
      .select('id, order_id, amount, reason, status, admin_note, created_at, updated_at')
      .eq('user_email', email)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json({ refunds: data || [] });
  } catch (error) {
    console.error('User refunds error:', error);
    return NextResponse.json({ refunds: [] });
  }
}
