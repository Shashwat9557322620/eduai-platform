import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { rateLimit } from '@/lib/rateLimit';
import { feedbackSchema } from '@/lib/validation';
import { headers } from 'next/headers';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 20, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const result = feedbackSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }
    const { userId, rating, message } = result.data;

    const { error } = await supabase.from('feedbacks').insert({
      user_id: userId || 'anonymous',
      rating: rating || 0,
      message: message || '',
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    // Send Thank You Email if user is known
    if (userId && userId !== 'anonymous') {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const userEmail = user.emailAddresses[0]?.emailAddress;

        if (userEmail) {
          await resend.emails.send({
            from: 'EduAI <onboarding@resend.dev>',
            to: userEmail,
            subject: 'Thank You For Your Feedback! 🌟',
            html: `
              <!DOCTYPE html>
              <html>
              <head><meta charset="utf-8"></head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #020203; padding: 40px 20px;">
                <div style="max-width: 520px; margin: 0 auto; background: #0a0a0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 40px; text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 10px;">🌟</div>
                  <h1 style="color: #fff; font-size: 24px; font-weight: 800; margin: 0;">We received your feedback!</h1>
                  <p style="color: #9ca3af; font-size: 15px; margin-top: 16px; line-height: 1.6;">
                    Thank you so much for taking the time to rate us <strong>${rating}/5 stars</strong>! 
                    Every piece of feedback helps us improve the EduAI platform for students around the world.
                  </p>
                  ${message ? `
                  <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; margin: 24px 0;">
                    <p style="color: #d1d5db; font-size: 13px; font-style: italic; margin: 0;">"${message}"</p>
                  </div>
                  ` : ''}
                  <div style="padding-top: 24px; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.05);">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} EduAI. All rights reserved.</p>
                  </div>
                </div>
              </body>
              </html>
            `,
          });
        }
      } catch (emailErr) {
        console.error('Feedback email send failed (non-blocking):', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
