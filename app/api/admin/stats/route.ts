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
    // Fetch stats from Supabase tables
    const [usersRes, creditsRes, paymentsRes, ticketsRes] = await Promise.all([
      supabase.from('user_credits').select('*'),
      supabase.from('user_credits').select('credits'),
      supabase.from('payments').select('*'),
      supabase.from('support_tickets').select('*').eq('status', 'open'),
    ]);

    const users = usersRes.data || [];
    const credits = creditsRes.data || [];
    const payments = paymentsRes.data || [];
    const openTickets = ticketsRes.data || [];

    const totalUsers = users.length;
    const activeCredits = credits.reduce((sum: number, u: any) => sum + (u.credits || 0), 0);
    const totalRevenue = payments
      .filter((p: any) => p.status === 'completed')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    return NextResponse.json({
      totalUsers,
      activeCredits,
      totalRevenue,
      openTickets: openTickets.length,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ totalUsers: 0, activeCredits: 0, totalRevenue: 0, openTickets: 0 });
  }
}
