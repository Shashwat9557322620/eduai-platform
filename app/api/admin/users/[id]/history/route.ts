import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { rateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 30, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const authorized = await verifyAdminAuth(req);
    if (!authorized) return unauthorizedResponse();

    const { id } = await params;

    const { data, error } = await supabase
      .from('user_history')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ history: data || [] });
  } catch (error) {
    console.error('Admin user history fetch error:', error);
    return NextResponse.json({ history: [] });
  }
}
