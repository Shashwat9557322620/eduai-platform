import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { rateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 30, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    // Verify admin auth
    const authorized = await verifyAdminAuth(req);
    if (!authorized) return unauthorizedResponse();
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json([]);
  }
}
