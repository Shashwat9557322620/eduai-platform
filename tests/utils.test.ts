import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('cn utility', () => {
  it('merges class names', () => {
    const result = cn('text-white', 'bg-black');
    expect(result).toContain('text-white');
    expect(result).toContain('bg-black');
  });

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'extra');
    expect(result).toContain('base');
    expect(result).not.toContain('hidden');
    expect(result).toContain('extra');
  });

  it('deduplicates conflicting classes', () => {
    const result = cn('p-4', 'p-8');
    // tailwind-merge should keep only p-8
    expect(result).toContain('p-8');
    expect(result).not.toContain('p-4');
  });
});

describe('sanitize utilities', () => {
  it('stripHtml removes tags', async () => {
    const { stripHtml } = await import('../lib/sanitize');
    expect(stripHtml('<p>Hello</p>')).toBe('Hello');
    expect(stripHtml('No tags here')).toBe('No tags here');
    expect(stripHtml('<script>alert(1)</script>test')).toBe('alert(1)test');
  });

  it('sanitizeInput trims and limits length', async () => {
    const { sanitizeInput } = await import('../lib/sanitize');
    expect(sanitizeInput('  hello  ')).toBe('hello');
    expect(sanitizeInput('a'.repeat(20000), 100)).toHaveLength(100);
  });

  it('isCleanInput rejects XSS patterns', async () => {
    const { isCleanInput } = await import('../lib/sanitize');
    expect(isCleanInput('Hello world')).toBe(true);
    expect(isCleanInput('<script>alert(1)</script>')).toBe(false);
    expect(isCleanInput('javascript:void(0)')).toBe(false);
    expect(isCleanInput('onload=alert(1)')).toBe(false);
  });

  it('escapeAttr escapes special characters', async () => {
    const { escapeAttr } = await import('../lib/sanitize');
    expect(escapeAttr('"hello"')).toBe('&quot;hello&quot;');
    expect(escapeAttr('<div>')).toBe('&lt;div&gt;');
    expect(escapeAttr("it's")).toBe('it&#x27;s');
  });
});

describe('rate limiting', () => {
  it('allows requests under limit', async () => {
    const { rateLimit } = await import('../lib/rateLimit');
    expect(rateLimit('test-ip-1', 10, 60000)).toBe(true);
  });

  it('blocks requests over limit', async () => {
    const { rateLimit } = await import('../lib/rateLimit');
    const ip = 'test-ip-limit-' + Date.now();
    for (let i = 0; i < 5; i++) rateLimit(ip, 5, 60000);
    expect(rateLimit(ip, 5, 60000)).toBe(false);
  });
});
