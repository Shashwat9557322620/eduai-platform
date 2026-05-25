import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, creditAmount, price } = body;

    // Razorpay amount humesha Paise mein leta hai (Rs 199 = 19900 paise)
    const options = {
      amount: price * 100, 
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
    };

    // Asli order create kar rahe hain
    const order = await razorpay.orders.create(options);

    return NextResponse.json({ 
      orderId: order.id, 
      amount: options.amount, 
      currency: "INR",
      credits: creditAmount
    });

  } catch (error: any) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ error: "Payment Order Failed" }, { status: 500 });
  }
}