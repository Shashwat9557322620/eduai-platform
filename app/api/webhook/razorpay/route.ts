import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_PLANS: Record<string, { credits: number; validPrices: number[] }> = {
  'Starter': { credits: 150, validPrices: [99, 69, 199] },
  'Scholar Pro': { credits: 500, validPrices: [299, 199, 499] },
  'Apex Overlord': { credits: 99999, validPrices: [799, 599, 999] },
};

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      const signature = req.headers.get('x-razorpay-signature');
      if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

      const expectedSign = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      const trusted = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSign));
      if (!trusted) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventId = event.payload?.payment?.entity?.id || event.id; // Could be subscription event

    // 1. Idempotency Check (DB backed)
    if (eventId) {
      const { data: existingEvent } = await supabaseAdmin
        .from('payment_events')
        .select('id')
        .eq('event_id', eventId)
        .single();
      
      if (existingEvent) {
        return NextResponse.json({ message: 'Already processed' });
      }

      await supabaseAdmin.from('payment_events').insert({
        event_id: eventId,
        event_type: event.event,
        payload: event
      });
    }

    // 2. Handle Subscriptions
    if (event.event.startsWith('subscription.')) {
        const sub = event.payload.subscription.entity;
        
        await supabaseAdmin.from('subscription_history').upsert({
            subscription_id: sub.id,
            user_id: sub.notes?.user_id || 'unknown',
            plan_name: sub.notes?.plan_name || 'unknown',
            status: sub.status, // active, completed, cancelled, halted
            current_start: sub.current_start ? new Date(sub.current_start * 1000).toISOString() : null,
            current_end: sub.current_end ? new Date(sub.current_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString()
        }, { onConflict: 'subscription_id' });
        
        // Let subscription events pass through (we might need to add credits on subscription.charged)
        if (event.event !== 'subscription.charged') {
           return NextResponse.json({ status: 'ok' });
        }
    }

    // 3. Process Payment/Subscription Captured
    if (event.event === 'payment.captured' || event.event === 'subscription.charged') {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;
        const paymentId = payment.id;
        const amount = payment.amount; 
        const notes = payment.notes || {};
        const userId = notes.user_id;

        const planName = notes.plan_name || '';
        const plan = ALLOWED_PLANS[planName];
        if (!plan) return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });

        const amountInRupees = amount / 100;
        if (!plan.validPrices.includes(amountInRupees)) {
          return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
        }

        // Update Payment Record
        await supabaseAdmin.from('payments').upsert({
          order_id: orderId || paymentId,
          payment_id: paymentId,
          user_id: userId,
          amount: amountInRupees,
          currency: payment.currency,
          status: 'captured',
          plan_name: planName,
          credits_purchased: plan.credits,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'order_id' });

        // Atomic Credit Addition
        if (userId) {
          const { data, error } = await supabaseAdmin.rpc('atomic_add_credits', {
            p_user_id: userId,
            p_amount: plan.credits,
            p_plan_name: planName === 'Apex Overlord' ? 'Apex Overlord' : planName,
            p_reference_id: paymentId
          });

          if (error) {
              console.error("Failed to atomically add credits:", error);
          } else {
              console.log(`✅ Atomically added ${plan.credits} credits to user ${userId}. New balance: ${data?.remaining}`);
          }
        }

        // Affiliate processing
        const affiliateCode = notes.affiliate_code;
        if (affiliateCode && userId) {
          try {
            const { data: affiliate } = await supabaseAdmin
              .from('affiliates')
              .select('*')
              .eq('affiliate_code', affiliateCode)
              .single();

            if (affiliate) {
              const commission = amountInRupees * Number(affiliate.commission_rate || 0.30);
              await supabaseAdmin.from('affiliate_conversions').insert({
                affiliate_id: affiliate.id,
                order_id: orderId || paymentId,
                buyer_user_id: userId,
                amount: amountInRupees,
                commission: commission
              });
              await supabaseAdmin.from('affiliates').update({
                balance: Number(affiliate.balance || 0) + commission,
                total_earned: Number(affiliate.total_earned || 0) + commission
              }).eq('id', affiliate.id);
            }
          } catch (e) {
            console.error("Affiliate tracking error:", e);
          }
        }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: unknown) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Webhook error' }, { status: 500 });
  }
}
