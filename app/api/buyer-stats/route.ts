import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Payment/Revenue Stats
    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select('amount, created_at')
      .eq('status', 'captured');

    let totalRevenue = 0;
    let dailyRevenue = 0;
    
    (payments || []).forEach(p => {
       const amt = Number(p.amount) || 0;
       totalRevenue += amt;
       if (new Date(p.created_at) >= new Date(oneDayAgo)) {
           dailyRevenue += amt;
       }
    });

    // 2. Token Usage / Cost Stats
    const { data: tokens } = await supabaseAdmin
      .from('token_usage')
      .select('estimated_cost, total_tokens, feature_name, created_at');

    let totalCost = 0;
    let dailyCost = 0;
    let totalTokens = 0;
    const featureCounts: Record<string, number> = {};

    (tokens || []).forEach(t => {
       const cost = Number(t.estimated_cost) || 0;
       totalCost += cost;
       totalTokens += Number(t.total_tokens) || 0;
       featureCounts[t.feature_name] = (featureCounts[t.feature_name] || 0) + 1;
       
       if (new Date(t.created_at) >= new Date(oneDayAgo)) {
           dailyCost += cost;
       }
    });

    const topFeatures = Object.entries(featureCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // 3. User Errors (Webhook Failures, Refund count, Error Rates)
    const { count: refundCount } = await supabaseAdmin
      .from('refund_events')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      metrics: {
        totalRevenue: Math.floor(totalRevenue),
        dailyRevenue: Math.floor(dailyRevenue),
        totalCost: totalCost.toFixed(4),
        dailyCost: dailyCost.toFixed(4),
        totalTokens,
        margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1) : 0,
        profit: (totalRevenue - totalCost).toFixed(2),
        totalRefunds: refundCount || 0,
        topFeatures
      }
    });
  } catch (err) {
    console.error('[Buyer Stats Error]', err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
