import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate a short unique referral code from userId
function generateCode(userId: string): string {
  const hash = userId.slice(-6).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  return `EDU-${hash}`;
}

// GET: fetch user's referral code + stats
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const code = generateCode(userId);

    // Upsert the referral code for this user
    await supabaseAdmin.from('referrals').upsert({
      referrer_id: userId,
      code,
      created_at: new Date().toISOString(),
    }, { onConflict: 'referrer_id' });

    // Count successful referrals (people who signed up with this code and paid)
    const { count: totalReferrals } = await supabaseAdmin
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('code', code)
      .not('referred_user_id', 'is', null);

    const { count: convertedReferrals } = await supabaseAdmin
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('code', code)
      .eq('converted', true);

    const creditsEarned = (convertedReferrals || 0) * 50;

    return NextResponse.json({
      code,
      referralUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://eduai.vercel.app'}/?ref=${code}`,
      totalReferrals: totalReferrals || 0,
      convertedReferrals: convertedReferrals || 0,
      creditsEarned,
    });
  } catch (err) {
    console.error('[Referral GET Error]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST: apply a referral code when a new user signs up
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 });

    // Check if code exists
    const { data: referral } = await supabaseAdmin
      .from('referrals')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (!referral) return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    if (referral.referrer_id === userId) return NextResponse.json({ error: 'Cannot use own code' }, { status: 400 });

    // Give new user 25 bonus credits
    const { data: userCredits } = await supabaseAdmin
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (userCredits) {
      await supabaseAdmin.from('user_credits')
        .update({ credits: userCredits.credits + 25 })
        .eq('user_id', userId);
    }

    // Record referral relationship
    await supabaseAdmin.from('referrals').insert({
      referrer_id: referral.referrer_id,
      referred_user_id: userId,
      code: code.toUpperCase(),
      converted: false,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, bonusCredits: 25 });
  } catch (err) {
    console.error('[Referral POST Error]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
