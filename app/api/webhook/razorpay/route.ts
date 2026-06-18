import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Webhook replay protection
const processedWebhooks = new Set<string>();

// Allowed plans for cross-checking
const ALLOWED_PLANS: Record<string, { credits: number }> = {
  'Starter Core': { credits: 150 },
  'Scholar Protocol': { credits: 500 },
  'Apex Overlord': { credits: 99999 },
};

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    if (webhookSecret) {
      const signature = req.headers.get('x-razorpay-signature');
      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
      }

      const expectedSign = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      // Constant-time comparison to prevent timing attacks
      const trusted = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSign));
      if (!trusted) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(body);

    // Idempotency check
    const eventId = event.payload?.payment?.entity?.id;
    if (eventId && processedWebhooks.has(eventId)) {
      return NextResponse.json({ message: 'Already processed' });
    }
    if (eventId) processedWebhooks.add(eventId);

    // Only process payment.captured events
    if (event.event !== 'payment.captured') {
      return NextResponse.json({ message: 'Ignored event type' });
    }

    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;
    const paymentId = payment.id;
    const amount = payment.amount; // in paise
    const notes = payment.notes || {};

    // Validate against our allowed plans
    const planName = notes.plan_name || '';
    const plan = ALLOWED_PLANS[planName];
    if (!plan) {
      console.error(`Unknown plan: ${planName}`);
      return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });
    }

    // Verify amount matches expected plan price
    const expectedAmount = planName === 'Starter Core' ? 19900 :
      planName === 'Scholar Protocol' ? 49900 :
      planName === 'Apex Overlord' ? 99900 : 0;

    if (amount < expectedAmount) {
      console.error(`Amount mismatch for ${planName}: got ${amount}, expected ${expectedAmount}`);
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    const userId = notes.user_id;

    // Update or create payment record using admin client
    await supabaseAdmin.from('payments').upsert({
      order_id: orderId,
      payment_id: paymentId,
      user_id: userId,
      amount: amount / 100, // convert paise to rupees
      currency: payment.currency,
      status: 'captured',
      plan_name: planName,
      credits_purchased: plan.credits,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'order_id' });

    // Add credits to user using admin client
    if (userId) {
      const { data: existing } = await supabaseAdmin
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .single();

      const currentCredits = existing?.credits || 0;
      const newCredits = currentCredits + plan.credits;

      await supabaseAdmin
        .from('user_credits')
        .upsert({
          user_id: userId,
          credits: newCredits,
          plan_name: planName === 'Apex Overlord' ? 'Apex Overlord' : planName,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      // Log the credit addition
      console.log(`✅ Added ${plan.credits} credits to user ${userId}. New balance: ${newCredits}`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: unknown) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Webhook error' }, { status: 500 });
  }
}
