import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: affiliate } = await supabaseAdmin
      .from('affiliates')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!affiliate) {
      return NextResponse.json({ isAffiliate: false });
    }

    const { data: conversions } = await supabaseAdmin
      .from('affiliate_conversions')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      isAffiliate: true,
      affiliate,
      conversions: conversions || []
    });
  } catch (error: any) {
    if (error?.code === 'PGRST116') {
       // Supabase 'single()' error when no rows returned, safely ignore
       return NextResponse.json({ isAffiliate: false });
    }
    console.error('Affiliate API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    let { affiliateCode } = body;
    affiliateCode = affiliateCode?.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!affiliateCode || affiliateCode.length < 3) {
      return NextResponse.json({ error: 'Code must be at least 3 alphanumeric characters' }, { status: 400 });
    }

    // Check if code is taken
    const { data: existing } = await supabaseAdmin
      .from('affiliates')
      .select('id')
      .eq('affiliate_code', affiliateCode)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'This code is already taken' }, { status: 400 });
    }

    const { data: newAffiliate, error } = await supabaseAdmin
      .from('affiliates')
      .insert({
        user_id: userId,
        affiliate_code: affiliateCode,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to create affiliate account' }, { status: 500 });
    }

    return NextResponse.json({ success: true, affiliate: newAffiliate });
  } catch (error) {
    console.error('Affiliate create error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
