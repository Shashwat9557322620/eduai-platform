import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('❌ CLERK_WEBHOOK_SECRET missing hai .env.local mein!');
    return new Response('Error', { status: 400 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Clerk Headers missing hain!');
    return new Response('Error: Missing svix headers', { status: 400 });
  }

  // 🔥 FIX: req.json() ki jagah req.text() use karna zaroori hai signature ke liye
  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('❌ Signature Verification Failed:', err);
    return new Response('Error verifying webhook', { status: 400 });
  }

  // Agar yahan tak aaya, matlab Clerk ka message 100% sahi se receive ho gaya
  if (evt.type === 'user.created') {
    const { id } = evt.data;
    console.log(`🎉 NAYA USER AAYA HAI! ID: ${id}`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/user_credits`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: id,
          credits: 50,
          plan_name: 'Free Trial'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ SUPABASE REJECTED IT. Reason:", errorText);
      } else {
        console.log("✅ DATA SUPABASE MEIN CHALA GAYA!");
      }
    } catch (error) {
      console.error("❌ Fetch fail ho gaya:", error);
    }
  }

  return NextResponse.json({ message: 'Webhook Processed' }, { status: 200 });
}