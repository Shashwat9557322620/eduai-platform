'use client';

// Anonymous usage gates using localStorage
// Free users (non-logged-in) get limited daily usage

const STORAGE_KEYS = {
  DAILY_USAGE: 'eduai_daily_usage',
  FIRST_VISIT: 'eduai_first_visit',
  ONBOARDING_DONE: 'eduai_onboarding_done',
};

// Daily limits for anonymous users
const DAILY_LIMITS: Record<string, number> = {
  optimizer: 2,
  flashcards: 3,
  analyzer: 2,
};

// Daily limits for logged-in free users
const FREE_USER_LIMITS: Record<string, number> = {
  optimizer: 5,
  flashcards: 10,
  analyzer: 5,
};

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getUsage(): Record<string, { date: string; counts: Record<string, number> }> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DAILY_USAGE);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

function saveUsage(usage: Record<string, { date: string; counts: Record<string, number> }>) {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_USAGE, JSON.stringify(usage));
  } catch {}
}

export function checkUsageLimit(tool: string, isLoggedIn: boolean): { allowed: boolean; remaining: number } {
  const today = getTodayKey();
  const usage = getUsage();
  const limits = isLoggedIn ? FREE_USER_LIMITS : DAILY_LIMITS;
  const limit = limits[tool] || 3;

  if (!usage[today]) {
    usage[today] = { date: today, counts: {} };
  }

  const currentCount = usage[today].counts[tool] || 0;
  const remaining = Math.max(0, limit - currentCount);

  return {
    allowed: currentCount < limit,
    remaining,
  };
}

export function incrementUsage(tool: string) {
  const today = getTodayKey();
  const usage = getUsage();

  if (!usage[today]) {
    usage[today] = { date: today, counts: {} };
  }

  usage[today].counts[tool] = (usage[today].counts[tool] || 0) + 1;
  saveUsage(usage);
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

// Onboarding helpers
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
