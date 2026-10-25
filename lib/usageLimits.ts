import { LRUCache } from 'lru-cache';

// Phase 9: Server-side Usage Limits & Fair Usage
// We use LRUCache to hold quotas in-memory. For a distributed system, this would be Redis.

const anonymousQuotaCache = new LRUCache<string, number>({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

const fairUsageQuotaCache = new LRUCache<string, number>({
  max: 5000,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

// Daily limits for anonymous users (by IP)
const ANONYMOUS_DAILY_LIMIT = 5; // Total requests per day across all tools

// Fair usage limits for "Unlimited" plans (Apex Overlord)
const UNLIMITED_PLAN_DAILY_TOKEN_CAP = 500000; // 500k tokens per day

/**
 * Checks and decrements anonymous daily quota.
 * Returns true if allowed, false if limit exceeded.
 */
export function checkAnonymousQuota(ip: string): boolean {
  const current = anonymousQuotaCache.get(ip) || 0;
  if (current >= ANONYMOUS_DAILY_LIMIT) {
    return false;
  }
  anonymousQuotaCache.set(ip, current + 1);
  return true;
}

/**
 * Checks if a user on an unlimited plan has exceeded their daily fair usage token cap.
 * If not, it adds the estimated tokens to their daily usage.
 */
export function checkFairUsageQuota(userId: string, estimatedTokens: number): boolean {
  const currentTokens = fairUsageQuotaCache.get(userId) || 0;
  if (currentTokens + estimatedTokens > UNLIMITED_PLAN_DAILY_TOKEN_CAP) {
    return false;
  }
  fairUsageQuotaCache.set(userId, currentTokens + estimatedTokens);
  return true;
}

// Client-side helpers (we retain these stubs so frontend doesn't break, 
// but actual enforcement happens on the server APIs now).
export function checkUsageLimit(tool: string, isLoggedIn: boolean): { allowed: boolean; remaining: number } {
  return { allowed: true, remaining: 999 }; // Dummy for client. Server will reject if limit reached.
}

export function incrementUsage(tool: string) {
  // No-op on client side. Server handles logging now.
}

export function getDailyResetTime(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diffMs = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

// Onboarding helpers (these are safe for localStorage as they just control UI flow)
const STORAGE_KEYS = {
  FIRST_VISIT: 'eduai_first_visit',
  ONBOARDING_DONE: 'eduai_onboarding_done',
};

export function isOnboardingDone(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE) === 'true';
  } catch {
    return true;
  }
}

export function setOnboardingDone() {
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
  } catch {}
}

export function isFirstVisit(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.FIRST_VISIT) === null;
  } catch {
    return false;
  }
}

export function markVisited() {
  try {
    localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, 'true');
  } catch {}
}
