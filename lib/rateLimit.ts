import { LRUCache } from 'lru-cache';

const rateLimitCache = new LRUCache<string, number[]>({
  max: 500,
  ttl: 1000 * 60 * 60,
});

export function rateLimit(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const timestamps = rateLimitCache.get(ip) || [];
  const windowStart = now - windowMs;
  const recent = timestamps.filter(t => t > windowStart);
  
  if (recent.length >= limit) return false;
  
  recent.push(now);
  rateLimitCache.set(ip, recent);
  return true;
}
