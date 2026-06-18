import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import nodemailer from 'nodemailer';
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
    const authorized = await verifyAdminAuth(req);
    if (!authorized) return unauthorizedResponse();
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json({ tickets: data || [] });
  } catch (error) {
    console.error('Tickets fetch error:', error);
    return NextResponse.json({ tickets: [] });
  }
}

export async function PATCH(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 30, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const authorized = await verifyAdminAuth(req);
    if (!authorized) return unauthorizedResponse();

    const { ticketId, status, adminResponse } = await req.json();

    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };
    if (adminResponse) updateData.admin_response = adminResponse;

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;

    // Send email notification if status changed and we have a response
    if (status && ticket?.user_email && (adminResponse || status === 'resolved')) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"EduAI Support" <noreply@eduai.com>',
          to: ticket.user_email,
          subject: `Support Ticket #${ticket.tracking_id} - Status Updated`,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #020203; padding: 40px 20px;">
              <div style="max-width: 520px; margin: 0 auto; background: #0a0a0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 40px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="font-size: 48px; margin-bottom: 10px;">📬</div>
                  <h1 style="color: #fff; font-size: 24px; font-weight: 800; margin: 0;">Ticket Updated</h1>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">
                    Ticket #${ticket.tracking_id}
                  </p>
                </div>
                <div style="background: rgba(6,182,212,0.05); border: 1px solid rgba(6,182,212,0.15); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                  <p style="color: #22d3ee; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Status: ${status?.toUpperCase()}</p>
                  ${adminResponse ? `<p style="color: #d1d5db; font-size: 14px; line-height: 1.6; margin: 0;">${adminResponse}</p>` : ''}
                </div>
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/support?track=${ticket.tracking_id}" 
                     style="display: inline-block; padding: 12px 24px; background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2); border-radius: 10px; color: #22d3ee; text-decoration: none; font-size: 13px; font-weight: 600;">
                    Track Your Request →
                  </a>
                </div>
                <div style="text-align: center; padding-top: 24px; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.05);">
                  <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} EduAI</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
      } catch (emailErr) {
        console.error('Email send failed:', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ticket update error:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}
