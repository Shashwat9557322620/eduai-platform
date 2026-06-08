import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth } from '@clerk/nextjs/server';
import { rateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';

// Allowed plan configurations — server-side only, cannot be manipulated by client
const ALLOWED_PLANS = [
  { name: 'Starter Core', creditAmount: 150, price: 199 },
  { name: 'Scholar Protocol', creditAmount: 500, price: 499 },
  { name: 'Apex Overlord', creditAmount: 99999, price: 999 },
];

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

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
    const { userId, creditAmount, price } = body;

    if (userId !== authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Server-side price validation — match against allowed plans
    const matchedPlan = ALLOWED_PLANS.find(
      p => p.price === price && p.creditAmount === creditAmount
    );

    if (!matchedPlan) {
      return NextResponse.json({ error: "Invalid plan selected. Price mismatch detected." }, { status: 400 });
    }

    // Razorpay amount in paise (Rs 199 = 19900 paise)
    const options = {
      amount: matchedPlan.price * 100, 
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
    };

    // Create actual Razorpay order
    const order = await razorpay.orders.create(options);

    return NextResponse.json({ 
      orderId: order.id, 
      amount: options.amount, 
      currency: "INR",
      credits: matchedPlan.creditAmount,
      planName: matchedPlan.name,
    });

  } catch (error: any) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ error: "Payment Order Failed" }, { status: 500 });
  }
}