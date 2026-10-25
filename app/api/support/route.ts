import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
import { randomBytes } from 'crypto';
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
import { rateLimit } from '@/lib/rateLimit';
import { supportSchema } from '@/lib/validation';
import { headers } from 'next/headers';

function generateTrackingId(): string {
  return 'EDU-' + randomBytes(4).toString('hex').toUpperCase();
}

export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const result = supportSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }
    const { email, subject, message } = result.data;

    const trackingId = generateTrackingId();

    const { data, error } = await supabaseAdmin.from('support_tickets').insert({
      name: 'User',
      email: email,
      type: 'general',
      user_email: email,
      subject: subject || 'No Subject',
      message,
      status: 'open',
      tracking_id: trackingId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single();

    if (error) {
      console.error('Support ticket insert error:', error);
      return NextResponse.json({ error: 'Database Error: ' + error.message + ' (Hint: Did you run the SQL script?)' }, { status: 500 });
    }

    // Send email with tracking ID
    try {
      await resend.emails.send({
        from: 'EduAI <onboarding@resend.dev>',
        to: email,
        subject: `Support Ticket Created - #${trackingId}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #020203; padding: 40px 20px;">
            <div style="max-width: 520px; margin: 0 auto; background: #0a0a0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 48px; margin-bottom: 10px;">🎫</div>
                <h1 style="color: #fff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
                  Ticket Created!
                </h1>
                <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">Your support request has been received.</p>
              </div>

              <div style="background: rgba(6,182,212,0.05); border: 1px solid rgba(6,182,212,0.15); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="color: #6b7280; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Your Tracking ID</p>
                <div style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: 900; color: #22d3ee; letter-spacing: 4px; background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.15); border-radius: 10px; padding: 16px; margin: 12px 0;">
                  ${trackingId}
                </div>
                <p style="color: #4b5563; font-size: 13px; margin: 12px 0 0 0;">
                  Use this ID to track your request status online.
                </p>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/support?track=${trackingId}" 
                   style="display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #06b6d4, #6366f1); border-radius: 12px; color: #fff; text-decoration: none; font-size: 14px; font-weight: 700;">
                  Track Your Request →
                </a>
              </div>

              <div style="text-align: center; padding-top: 24px; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.05);">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} EduAI</p>
                <p style="color: #4b5563; font-size: 11px; margin: 4px 0 0 0;">We typically respond within 24 hours.</p>
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
      ticket: data,
      tracking_id: trackingId,
      message: `Support ticket created! Your tracking ID is: ${trackingId}`
    });
  } catch (error: any) {
    console.error('Support ticket creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create ticket' }, { status: 500 });
  }
}
