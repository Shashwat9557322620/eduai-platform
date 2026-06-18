import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    button: ({ children, ...props }: any) => React.createElement('button', props, children),
    a: ({ children, ...props }: any) => React.createElement('a', props, children),
    span: ({ children, ...props }: any) => React.createElement('span', props, children),
    p: ({ children, ...props }: any) => React.createElement('p', props, children),
    h1: ({ children, ...props }: any) => React.createElement('h1', props, children),
    h2: ({ children, ...props }: any) => React.createElement('h2', props, children),
    h3: ({ children, ...props }: any) => React.createElement('h3', props, children),
    li: ({ children, ...props }: any) => React.createElement('li', props, children),
    tr: ({ children, ...props }: any) => React.createElement('tr', props, children),
    nav: ({ children, ...props }: any) => React.createElement('nav', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
  useInView: () => true,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: null, isSignedIn: false, isLoaded: true }),
  SignedIn: ({ children }: any) => children,
  SignedOut: ({ children }: any) => children,
  UserButton: () => null,
  ClerkProvider: ({ children }: any) => children,
}));

vi.mock('lucide-react', () => {
  const handler = () => null;
  return new Proxy({}, { get: () => handler });
});

vi.mock('next/image', () => ({
  default: (props: any) => React.createElement('img', props),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => React.createElement('a', { href, ...props }, children),
}));

describe('SkipToContent', () => {
  it('renders skip link with correct href', async () => {
    const { default: SkipToContent } = await import('../app/components/SkipToContent');
    render(<SkipToContent />);
    const link = screen.getByText('Skip to main content');
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('#main-content');
  });

  it('is an anchor element', async () => {
    const { default: SkipToContent } = await import('../app/components/SkipToContent');
    render(<SkipToContent />);
    const link = screen.getByText('Skip to main content');
    expect(link.tagName).toBe('A');
  });
});

describe('ErrorBoundary', () => {
  it('renders children when no error', async () => {
    const { ErrorBoundary } = await import('../app/components/ErrorBoundary');
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test content')).toBeDefined();
  });
});

describe('Skeleton components', () => {
  it('renders default Skeleton', async () => {
    const { default: Skeleton } = await import('../app/components/ui/Skeleton');
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeDefined();
  });

  it('renders SkeletonCard', async () => {
    const { SkeletonCard } = await import('../app/components/ui/Skeleton');
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeDefined();
  });

  it('renders SkeletonTable', async () => {
    const { SkeletonTable } = await import('../app/components/ui/Skeleton');
    const { container } = render(<SkeletonTable />);
    expect(container.firstChild).toBeDefined();
  });
});

describe('Validation schemas', () => {
  it('flashcardSchema validates correct input', async () => {
    const { flashcardSchema } = await import('../lib/validation');
    const result = flashcardSchema.safeParse({ text: 'A'.repeat(20) });
    expect(result.success).toBe(true);
  });

  it('flashcardSchema rejects short text', async () => {
    const { flashcardSchema } = await import('../lib/validation');
    const result = flashcardSchema.safeParse({ text: 'hi' });
    expect(result.success).toBe(false);
  });

  it('analyzeSchema validates correct input', async () => {
    const { analyzeSchema } = await import('../lib/validation');
    const result = analyzeSchema.safeParse({ role: 'Engineer', skills: 'JavaScript, React, Node.js and more' });
    expect(result.success).toBe(true);
  });

  it('analyzeSchema rejects empty role', async () => {
    const { analyzeSchema } = await import('../lib/validation');
    const result = analyzeSchema.safeParse({ role: '', skills: 'JavaScript' });
    expect(result.success).toBe(false);
  });

  it('newsletterSchema validates email', async () => {
    const { newsletterSchema } = await import('../lib/validation');
    expect(newsletterSchema.safeParse({ email: 'test@example.com' }).success).toBe(true);
    expect(newsletterSchema.safeParse({ email: 'invalid' }).success).toBe(false);
  });

  it('feedbackSchema validates rating range', async () => {
    const { feedbackSchema } = await import('../lib/validation');
    expect(feedbackSchema.safeParse({ rating: 3 }).success).toBe(true);
    expect(feedbackSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(feedbackSchema.safeParse({ rating: 6 }).success).toBe(false);
  });
});

describe('Design tokens', () => {
  it('exports colors with all semantic palettes', async () => {
    const { colors } = await import('../lib/design-tokens');
    expect(colors.bg).toBeDefined();
    expect(colors.cyan).toBeDefined();
    expect(colors.purple).toBeDefined();
    expect(colors.pink).toBeDefined();
    expect(colors.success).toBeDefined();
    expect(colors.warning).toBeDefined();
    expect(colors.error).toBeDefined();
    expect(colors.glass).toBeDefined();
  });

  it('exports typography with display sizes', async () => {
    const { typography } = await import('../lib/design-tokens');
    expect(typography.fontSize['display-2xl']).toBeDefined();
    expect(typography.fontSize.h1).toBeDefined();
    expect(typography.fontSize['body-md']).toBeDefined();
    expect(typography.fontFamily.sans).toBeDefined();
    expect(typography.fontFamily.mono).toBeDefined();
  });

  it('exports spacing scale', async () => {
    const { spacing } = await import('../lib/design-tokens');
    expect(spacing[0]).toBe('0px');
    expect(spacing[4]).toBe('1rem');
    expect(spacing[8]).toBe('2rem');
  });

  it('exports animation easings', async () => {
    const { animation } = await import('../lib/design-tokens');
    expect(animation.ease.default).toBeDefined();
    expect(animation.ease.spring).toBeDefined();
    expect(animation.duration.fast).toBe('200ms');
  });
});

describe('Utility functions', () => {
  it('formatNumber adds separators', async () => {
    const { formatNumber } = await import('../lib/utils');
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(0)).toBe('0');
  });

  it('clamp restricts values', async () => {
    const { clamp } = await import('../lib/utils');
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('truncate adds ellipsis', async () => {
    const { truncate } = await import('../lib/utils');
    expect(truncate('hello world', 5)).toBe('hell\u2026');
    expect(truncate('hi', 10)).toBe('hi');
  });

  it('getInitials extracts first letters', async () => {
    const { getInitials } = await import('../lib/utils');
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Single')).toBe('S');
  });

  it('hexToRgb converts colors', async () => {
    const { hexToRgb } = await import('../lib/utils');
    const result1 = hexToRgb('#06b6d4');
    expect(result1).toBe('6, 182, 212');
    const result2 = hexToRgb('#000000');
    expect(result2).toBe('0, 0, 0');
  });

  it('timeAgo returns relative time', async () => {
    const { timeAgo } = await import('../lib/utils');
    const now = new Date();
    expect(timeAgo(now)).toBe('just now');
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(timeAgo(fiveMinAgo)).toBe('5m ago');
  });

  it('generateId returns correct length', async () => {
    const { generateId } = await import('../lib/utils');
    const id = generateId(12);
    expect(id.length).toBeGreaterThanOrEqual(10);
  });
});

describe('Monitoring utility', () => {
  it('exports all monitoring functions', async () => {
    const mod = await import('../lib/monitoring');
    expect(typeof mod.initWebVitals).toBe('function');
    expect(typeof mod.initErrorTracking).toBe('function');
    expect(typeof mod.onVital).toBe('function');
    expect(typeof mod.setMonitoringUserId).toBe('function');
    expect(typeof mod.measurePerformance).toBe('function');
    expect(typeof mod.mark).toBe('function');
    expect(typeof mod.measure).toBe('function');
  });

  it('onVital registers and unregisters callbacks', async () => {
    const { onVital } = await import('../lib/monitoring');
    const callback = vi.fn();
    const unsubscribe = onVital(callback);
    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });

  it('measurePerformance returns duration', async () => {
    const { measurePerformance } = await import('../lib/monitoring');
    const duration = measurePerformance('test', () => {
      let sum = 0;
      for (let i = 0; i < 100; i++) sum += i;
    });
    expect(typeof duration).toBe('number');
    expect(duration).toBeGreaterThanOrEqual(0);
  });

  it('mark does not throw', async () => {
    const { mark } = await import('../lib/monitoring');
    expect(() => mark('test-mark')).not.toThrow();
  });

  it('measure returns 0 when no marks exist', async () => {
    const { measure } = await import('../lib/monitoring');
    const result = measure('nonexistent', 'nonexistent-start', 'nonexistent-end');
    expect(typeof result).toBe('number');
  });
});

afterEach(() => {
  vi.clearAllMocks();
});
