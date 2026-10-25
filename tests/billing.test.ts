import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateCreditCost } from '../lib/tokenBillingEngine';
import { rateLimit } from '../lib/rateLimit';
import { checkAnonymousQuota, checkFairUsageQuota } from '../lib/usageLimits';

// Phase 16: Automated Testing Suite
// Ensures that billing math, token tracking, and rate limits do not break.

describe('Token Billing Engine (Phase 3 & 4)', () => {
  it('should charge 0.1 per 1k prompt tokens for gemini-2.5-flash', () => {
    const usage = {
      promptTokenCount: 1000,
      candidatesTokenCount: 0,
      totalTokenCount: 1000
    };
    const cost = calculateCreditCost('gemini-2.5-flash', usage);
    expect(cost).toBe(0.1);
  });

  it('should charge 0.15 per 1k completion tokens for gemini-2.5-flash-lite', () => {
    const usage = {
      promptTokenCount: 0,
      candidatesTokenCount: 1000,
      totalTokenCount: 1000
    };
    const cost = calculateCreditCost('gemini-2.5-flash-lite', usage);
    expect(cost).toBe(0.15);
  });

  it('should round up to minimum 0.01 credits', () => {
    const usage = {
      promptTokenCount: 1,
      candidatesTokenCount: 1,
      totalTokenCount: 2
    };
    const cost = calculateCreditCost('gemini-2.5-flash', usage);
    expect(cost).toBe(0.01);
  });
});

describe('Anonymous Limits & Rate Limits (Phase 9 & 8)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should block IPs after 5 anonymous requests', () => {
    const ip = '192.168.1.1';
    for (let i = 0; i < 5; i++) {
      expect(checkAnonymousQuota(ip)).toBe(true);
    }
    // 6th request should fail
    expect(checkAnonymousQuota(ip)).toBe(false);
  });

  it('should block unlimited users after 500k tokens per day', () => {
    const userId = 'user_abc';
    // Consume 499k tokens
    expect(checkFairUsageQuota(userId, 499000)).toBe(true);
    // Consume another 2k (total 501k) -> should block
    expect(checkFairUsageQuota(userId, 2000)).toBe(false);
  });
});
