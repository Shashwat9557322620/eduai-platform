import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      orderId, 
      paymentId, 
      signature, 
      status, 
      userId, 
      userEmail, 
      planName, 
      amount, 
      errorDescription
    } = body;

    // Verify signature if it's a success and we have keys (and not mock)
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (status === 'success' && keySecret && signature && !body.isMock) {
      const expectedSign = crypto
        .createHmac('sha256', keySecret)
        .update(orderId + '|' + paymentId)
        .digest('hex');

      if (expectedSign !== signature) {
        console.error("Signature mismatch!", { expectedSign, signature, orderId, paymentId });
        return NextResponse.json({ error: 'Invalid signature', details: 'Signature mismatch' }, { status: 400 });
      }
    }

    if (status === 'success') {
      // NOTE: We DO NOT ADD CREDITS HERE ANYMORE! (Phase 6 - Payment System Hardening)
      // Webhook is the only source of truth.
      // We just update the payment status to 'captured' if the webhook hasn't processed it yet, 
      // but without touching credits.

      const { error: dbError } = await supabaseAdmin.from('payments').upsert({
        order_id: orderId,
        payment_id: paymentId,
        user_id: userId,
        amount: amount, 
        currency: 'INR',
        status: 'captured_pending_webhook', // Webhook will make it 'captured' and add credits
        plan_name: planName,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'order_id' });

      if (dbError) {
        console.error("DB Error on payments upsert:", dbError);
      }

      // 🔴 ONLY FOR DEV MOCK BYPASS: Since Razorpay webhooks don't fire for mock tests, we manually add credits here.
      if (body.isMock && userId) {
        const { data, error } = await supabaseAdmin.rpc('atomic_add_credits', {
          p_user_id: userId,
          p_amount: body.credits || 0,
          p_plan_name: planName,
          p_reference_id: paymentId
        });
        if (error) console.error("Mock Credit Addition Failed:", error);
      }
    }

    // Send Professional Email using Resend
    if (userEmail) {
      try {
        const isSuccess = status === 'success';
        const title = isSuccess ? 'Payment Processing...' : 'Payment Failed';
        const color = isSuccess ? '#10b981' : '#ef4444'; // Green or Red
        const icon = isSuccess ? '⏳' : '❌';

        await resend.emails.send({
          from: 'EduAI <onboarding@resend.dev>',
          to: userEmail,
          subject: isSuccess ? `Invoice: Upgrade to ${planName}` : `Action Required: Payment Failed`,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #020203; padding: 40px 20px;">
              <div style="max-width: 520px; margin: 0 auto; background: #0a0a0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 40px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
                  <h1 style="color: #fff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
                    ${title}
                  </h1>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">
                    ${isSuccess 
                      ? 'Your payment was received. Your account will be upgraded momentarily once the transaction fully clears.' 
                      : 'Unfortunately, we could not process your payment. Details are below.'}
                  </p>
                </div>

                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                  
                  <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                    <span style="color: #6b7280; font-size: 13px;">Order ID</span>
                    <strong style="color: #fff; font-size: 13px; font-family: monospace;">${orderId || 'N/A'}</strong>
                  </div>
                  
                  ${paymentId ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                    <span style="color: #6b7280; font-size: 13px;">Transaction ID</span>
                    <strong style="color: #fff; font-size: 13px; font-family: monospace;">${paymentId}</strong>
                  </div>
                  ` : ''}

                  <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                    <span style="color: #6b7280; font-size: 13px;">Plan</span>
                    <strong style="color: #fff; font-size: 13px;">${planName}</strong>
                  </div>

                  <div style="display: flex; justify-content: space-between; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <span style="color: #6b7280; font-size: 13px;">Amount Paid</span>
                    <strong style="color: ${color}; font-size: 16px;">₹${amount}</strong>
                  </div>

                  ${!isSuccess && errorDescription ? `
                  <div style="margin-top: 16px; padding: 12px; background: rgba(239,68,68,0.1); border-radius: 8px; color: #ef4444; font-size: 12px;">
                    <strong>Reason:</strong> ${errorDescription}
                  </div>
                  ` : ''}
                </div>

                <div style="text-align: center;">
                  ${isSuccess ? `
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
                     style="display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #a855f7, #9333ea); border-radius: 12px; color: #fff; text-decoration: none; font-size: 14px; font-weight: 700;">
                    Go to Dashboard →
                  </a>
                  ` : `
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing" 
                     style="display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #ef4444, #dc2626); border-radius: 12px; color: #fff; text-decoration: none; font-size: 14px; font-weight: 700;">
                    Try Again
                  </a>
                  `}
                </div>
              </div>
            </body>
            </html>
          `,
        });
      } catch (emailErr: any) {
        console.error('Email send failed (non-blocking):', emailErr.message);
        return NextResponse.json({ success: true, warning: 'DB updated but Email failed to send.', emailError: emailErr.message });
      }
    }

    return NextResponse.json({ success: true, message: 'Processed successfully' });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
