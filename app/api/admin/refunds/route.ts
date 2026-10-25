import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { rateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET: Fetch all refund requests
export async function GET(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 30, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const authorized = await verifyAdminAuth(req);
    if (!authorized) return unauthorizedResponse();
    const { data, error } = await supabase
      .from('refund_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ refunds: data || [] });
  } catch (error) {
    console.error('Refunds fetch error:', error);
    return NextResponse.json({ refunds: [] });
  }
}

// PATCH: Approve or deny a refund request
export async function PATCH(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 30, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const authorized = await verifyAdminAuth(req);
    if (!authorized) return unauthorizedResponse();

    const { refundId, status, adminNote } = await req.json();

    if (!refundId || !status || !['approved', 'denied'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Update the refund request
    const { data: refund, error: updateError } = await supabase
      .from('refund_requests')
      .update({ 
        status, 
        admin_note: adminNote || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', refundId)
      .select()
      .single();

    if (updateError) throw updateError;

    const isApproved = status === 'approved';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #020203; padding: 40px 20px;">
        <div style="max-width: 520px; margin: 0 auto; background: #0a0a0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px; margin-bottom: 10px;">
              ${isApproved ? '✅' : 'ℹ️'}
            </div>
            <h1 style="color: #fff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
              Refund ${isApproved ? 'Approved' : 'Update'}
            </h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">EduAI Support</p>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="color: #d1d5db; font-size: 15px; line-height: 1.7; margin: 0;">
              ${isApproved 
                ? 'Your refund request has been <strong style="color: #22d3ee;">approved</strong>. The amount will be credited to your original payment method within 5-7 business days.'
                : 'Your refund request has been <strong style="color: #f59e0b;">reviewed</strong>. Please read the admin note below for details.'
              }
            </p>
          </div>

          ${adminNote ? `
          <div style="background: rgba(251,191,36,0.05); border: 1px solid rgba(251,191,36,0.15); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #fbbf24; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Admin Note</p>
            <p style="color: #d1d5db; font-size: 14px; line-height: 1.6; margin: 0;">${adminNote}</p>
          </div>
          ` : ''}

          <div style="text-align: center; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.05);">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} EduAI. All rights reserved.</p>
            <p style="color: #4b5563; font-size: 11px; margin: 4px 0 0 0;">This is an automated notification. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const resendResponse = await resend.emails.send({
        from: 'EduAI <onboarding@resend.dev>',
        to: refund.user_email,
        subject: `Refund Request ${isApproved ? 'Approved ✅' : 'Update'} - EduAI`,
        html: emailHtml,
      });
      console.log('Resend Response:', resendResponse);
    } catch (emailErr) {
      console.error('Email send failed (non-blocking):', emailErr);
    }

    return NextResponse.json({ success: true, refund });
  } catch (error) {
    console.error('Refund update error:', error);
    return NextResponse.json({ error: 'Failed to update refund' }, { status: 500 });
  }
}
