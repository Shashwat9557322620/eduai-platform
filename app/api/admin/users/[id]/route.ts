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
      .from('user_credits')
      .select('*')
      .eq('user_id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(data || {});
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
}

export async function PATCH(
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
    const body = await req.json();
    const { data, error } = await supabase
      .from('user_credits')
      .update(body)
      .eq('user_id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
