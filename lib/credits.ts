'use server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function checkAndDeductCredit(userId: string): Promise<{ ok: boolean; error?: string; remaining?: number }> {
  try {
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !user) return { ok: false, error: 'User not found' };
    if (user.credits <= 0) return { ok: false, error: 'CREDIT_LIMIT_EXCEEDED' };
    
    const newCredits = user.credits - 1;
    const { error: updateError } = await supabaseAdmin
      .from('user_credits')
      .update({ credits: newCredits, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    
    if (updateError) return { ok: false, error: 'Update failed' };
    return { ok: true, remaining: newCredits };
  } catch {
    return { ok: true };
  }
}

export async function logUserHistory(userId: string, toolName: string, input: string, creditsUsed = 1) {
  try {
    await supabaseAdmin.from('user_history').insert({
      user_id: userId,
      tool_name: toolName,
      input: input.slice(0, 500),
      credits_used: creditsUsed,
      created_at: new Date().toISOString(),
    });
  } catch {}
}
