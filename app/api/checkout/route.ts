import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth } from '@clerk/nextjs/server';
import { rateLimit } from '@/lib/rateLimit';
import { headers, cookies } from 'next/headers';

// Allowed plan configurations — server-side only, cannot be manipulated by client
const ALLOWED_PLANS = [
  { name: 'Starter', creditAmount: 150, validPrices: [99, 69, 199] },
  { name: 'Scholar Pro', creditAmount: 500, validPrices: [299, 199, 499] },
  { name: 'Apex Overlord', creditAmount: 99999, validPrices: [799, 599, 999] },
];

export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, creditAmount, price, billingCycle, planId } = body;

    if (userId !== authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Server-side price validation — match against allowed plans
    const matchedPlan = ALLOWED_PLANS.find(
      p => p.validPrices.includes(price) && p.creditAmount === creditAmount
    );

    if (!matchedPlan) {
      return NextResponse.json({ error: "Invalid plan selected. Price mismatch detected." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const cookieStore = await cookies();
    const affiliateCode = cookieStore.get('eduai_ref')?.value || '';

    let orderId = `mock_order_${Date.now()}`;
    let subscriptionId = null;

    // Razorpay amount in paise (Rs 199 = 19900 paise)
    const options = {
      amount: price * 100, 
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
      notes: {
        plan_name: matchedPlan.name,
        user_id: authUserId,
        affiliate_code: affiliateCode,
      }
    };

    if (keyId && keySecret) {
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      
      // Determine if we should create a subscription or a one-time order
      let rzpPlanId = '';
      if (billingCycle === 'monthly' || billingCycle === 'annual') {
        const envKey = `RAZORPAY_PLAN_${planId?.toUpperCase()}_${billingCycle?.toUpperCase()}`;
        rzpPlanId = process.env[envKey] || '';
      }

      if (rzpPlanId) {
        // Create Subscription
        const subOptions = {
          plan_id: rzpPlanId,
          total_count: billingCycle === 'annual' ? 10 : 120, // max billing cycles
          customer_notify: 1 as 1,
          notes: options.notes
        };
        const subscriptionResult = await razorpay.subscriptions.create(subOptions);
        const subscription = await Promise.resolve(subscriptionResult);
        subscriptionId = (subscription as { id: string }).id;
        orderId = (subscription as { id: string }).id; // Fallback mapping for consistency
      } else {
        // Create One-Time Order
        const order = await razorpay.orders.create(options);
        orderId = order.id;
      }
    } else {
      console.warn("⚠️ Razorpay keys missing: Using DEV bypass mode.");
      if (billingCycle === 'monthly' || billingCycle === 'annual') {
         subscriptionId = `mock_sub_${Date.now()}`;
      }
    }

    return NextResponse.json({ 
      orderId,
      subscriptionId, 
      amount: options.amount, 
      currency: "INR",
      credits: matchedPlan.creditAmount,
      planName: matchedPlan.name,
      isMock: !keyId, // flag to tell frontend to bypass UI
    });

  } catch (error: any) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ error: "Payment Order Failed" }, { status: 500 });
  }
}
