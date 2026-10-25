'use server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

import { checkAnonymousQuota, checkFairUsageQuota } from './usageLimits';

/**
 * Validates if the user has enough credits to proceed with the request.
 * Does NOT deduct anything.
 */
export async function validateCredits(userId: string | null, estimatedCost: number = 1, ip: string = 'unknown'): Promise<{ ok: boolean; error?: string; remaining?: number }> {
  try {
    if (!userId) {
      // Anonymous user
      if (!checkAnonymousQuota(ip)) {
         return { ok: false, error: 'Free tier limit reached. Please sign in to continue.' };
      }
      return { ok: true, remaining: 0 };
    }

    const { data: user, error: fetchError } = await supabaseAdmin
      .from('user_credits')
      .select('credits, plan_name')
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !user) return { ok: false, error: 'User not found' };
    
    // Apex Overlord check - unlimited credits logically
    if (user.plan_name === 'Apex Overlord') {
       // Check fair usage token cap (assume estimated cost maps roughly to tokens, e.g. 1 credit = 10k tokens)
       if (!checkFairUsageQuota(userId, estimatedCost * 10000)) {
         return { ok: false, error: 'Daily Fair Usage Limit Exceeded. Please try again tomorrow.' };
       }
       return { ok: true, remaining: user.credits };
    }

    if (user.credits < estimatedCost) return { ok: false, error: 'CREDIT_LIMIT_EXCEEDED' };
    
    return { ok: true, remaining: user.credits };
  } catch {
    return { ok: false, error: 'Validation failed' };
  }
}

/**
 * Atomically deducts credits after a successful request.
 */
export async function commitCreditDeduction(
  userId: string, 
  actualCost: number, 
  featureName: string, 
  requestId: string
): Promise<{ ok: boolean; error?: string; remaining?: number }> {
  try {
    const { data, error } = await supabaseAdmin.rpc('atomic_deduct_credits', {
      p_user_id: userId,
      p_amount: actualCost,
      p_feature_name: featureName,
      p_reference_id: requestId
    });

    if (error || !data?.ok) {
      console.error("[Credit Deduction Error]:", error || data?.error);
      return { ok: false, error: data?.error || 'Deduction failed' };
    }

    return { ok: true, remaining: data.remaining };
  } catch (err) {
    console.error("[Credit Deduction Exception]:", err);
    return { ok: false, error: 'Exception during deduction' };
  }
}

/**
 * Logs token usage directly from Gemini responses.
 */
export async function logTokenUsage(
  userId: string, 
  featureName: string, 
  modelName: string, 
  usageMetadata: any, 
  estimatedCost: number,
  requestId: string
) {
  try {
    await supabaseAdmin.from('token_usage').insert({
      user_id: userId,
      request_id: requestId,
      feature_name: featureName,
      model_name: modelName,
      prompt_tokens: usageMetadata?.promptTokenCount || 0,
      completion_tokens: usageMetadata?.candidatesTokenCount || 0,
      total_tokens: usageMetadata?.totalTokenCount || 0,
      estimated_cost: estimatedCost
    });
  } catch (err) {
    console.error("[Token Usage Log Exception]:", err);
  }
}

/**
 * Standard usage logger for input/output payloads (the new usage_logs table)
 */
export async function logUsageEvent(
  userId: string, 
  featureName: string, 
  requestPayload: any, 
  responsePayload: any, 
  creditsUsed: number,
  status: 'success' | 'failed' = 'success',
  errorMessage?: string
) {
  try {
    await supabaseAdmin.from('usage_logs').insert({
      user_id: userId,
      feature_name: featureName,
      request_payload: requestPayload,
      response_payload: responsePayload,
      credits_used: creditsUsed,
      status: status,
      error_message: errorMessage
    });
  } catch (err) {
    console.error("[Usage Log Exception]:", err);
  }
}

// Keeping the old one for backward compatibility if needed in some places, 
// but we will gradually remove it.
export async function logUserHistory(userId: string, toolName: string, input: string, creditsUsed = 1) {
  try {
    await supabaseAdmin.from('user_history').insert({
      user_id: userId,
      action: toolName,
      prompt: input.slice(0, 500),
      credits_used: creditsUsed
    });
  } catch (err) {
    console.error("[Supabase Exception in user_history]:", err);
  }
}

// Deprecated: Remove after refactoring all routes
export async function checkAndDeductCredit(userId: string): Promise<{ ok: boolean; error?: string; remaining?: number }> {
  return commitCreditDeduction(userId, 1, 'legacy_deduction', crypto.randomUUID());
}
