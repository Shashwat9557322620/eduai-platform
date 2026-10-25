import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { rateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 30, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const trackingId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!trackingId) {
      return NextResponse.json({ error: 'Tracking ID is required' }, { status: 400 });
    }

    if (trackingId.startsWith('REF-')) {
      let query = supabase
        .from('refund_requests')
        .select('id, tracking_id, reason, status, admin_note, created_at, updated_at, user_email')
        .eq('tracking_id', trackingId);
      
      if (email) {
        query = query.eq('user_email', email);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        return NextResponse.json({ error: 'Refund request not found or invalid email' }, { status: 404 });
      }

      return NextResponse.json({ 
        ticket: {
          id: data.id,
          tracking_id: data.tracking_id,
          subject: 'Refund Request',
          message: data.reason,
          status: data.status,
          admin_response: data.admin_note,
          created_at: data.created_at,
          updated_at: data.updated_at,
          user_email: data.user_email
        }
      });
    } else {
      let query = supabase
        .from('support_tickets')
        .select('id, tracking_id, subject, message, status, admin_response, created_at, updated_at, user_email')
        .eq('tracking_id', trackingId);

      if (email) {
        query = query.eq('user_email', email);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        return NextResponse.json({ error: 'Ticket not found or invalid email' }, { status: 404 });
      }

      return NextResponse.json({ ticket: data });
    }
  } catch (error) {
    console.error('Support track error:', error);
    return NextResponse.json({ error: 'Failed to fetch tracking details' }, { status: 500 });
  }
}
