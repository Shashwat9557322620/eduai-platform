import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rateLimit';
import { refundSchema } from '@/lib/validation';
import { headers } from 'next/headers';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateTrackingId(): string {
  return 'REF-' + randomBytes(4).toString('hex').toUpperCase();
}

export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const result = refundSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }
    const { user_id, user_email, order_id, amount, reason } = result.data;

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID is required to process refund.' }, { status: 400 });
    }

    // --- STRICT ELIGIBILITY CHECK ---
    
    // 1. Verify Payment Exists
    const { data: payment } = await supabaseAdmin.from('payments').select('*').eq('order_id', order_id).single();
    if (!payment) {
      return NextResponse.json({ error: 'Invalid Order ID. We could not find this purchase.' }, { status: 400 });
    }

    // 2. 7-Day Policy Check
    const purchaseDate = new Date(payment.created_at);
    const now = new Date();
    const diffDays = (now.getTime() - purchaseDate.getTime()) / (1000 * 3600 * 24);
    if (diffDays > 7) {
      return NextResponse.json({ error: 'Refunds are only valid within 7 days of purchase.' }, { status: 400 });
    }

    // 3. Usage Check (Reject if they used > 50 credits since purchase)
    if (user_id) {
      const { count } = await supabaseAdmin.from('user_history')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user_id)
          .gte('created_at', payment.created_at);
      
      if (count && count > 50) {
        return NextResponse.json({ error: 'You have consumed more than the allowed limit (10%) for a refund.' }, { status: 400 });
      }
    }

    const trackingId = generateTrackingId();

    const { data, error } = await supabaseAdmin.from('refund_requests').insert({
      user_id: user_id || null,
      user_email,
      order_id,
      amount: amount || payment.amount || 0,
      reason,
      status: 'pending',
      tracking_id: trackingId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single();

    if (error) throw error;

    // --- SEND EMAIL NOTIFICATION ---
    try {

      await resend.emails.send({
        from: 'EduAI <onboarding@resend.dev>',
        to: user_email,
        subject: `Refund Request Submitted - #${trackingId}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #020203; padding: 40px 20px;">
            <div style="max-width: 520px; margin: 0 auto; background: #0a0a0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 48px; margin-bottom: 10px;">💸</div>
                <h1 style="color: #fff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
                  Refund Request Received
                </h1>
                <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">Your request has passed preliminary eligibility checks and is now under review.</p>
              </div>

              <div style="background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.15); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="color: #6b7280; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Your Tracking ID</p>
                <div style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: 900; color: #34d399; letter-spacing: 4px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.15); border-radius: 10px; padding: 16px; margin: 12px 0;">
                  ${trackingId}
                </div>
                <p style="color: #4b5563; font-size: 13px; margin: 12px 0 0 0;">
                  Use this ID to track your refund status online.
                </p>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/support?track=${trackingId}" 
                   style="display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #10b981, #059669); border-radius: 12px; color: #fff; text-decoration: none; font-size: 14px; font-weight: 700;">
                  Track Refund Status →
                </a>
              </div>

              <div style="text-align: center; padding-top: 24px; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.05);">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} EduAI</p>
                <p style="color: #4b5563; font-size: 11px; margin: 4px 0 0 0;">Refund processing usually takes 5-7 business days if approved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (emailErr) {
      console.error('Email send failed (non-blocking):', emailErr);
    }

    return NextResponse.json({ 
      success: true, 
      refund: data,
      tracking_id: trackingId,
      message: 'Refund request submitted and approved for review. Check your email for tracking.'
    });
  } catch (error) {
    console.error('Refund request error:', error);
    return NextResponse.json({ error: 'Failed to submit refund request' }, { status: 500 });
  }
}
