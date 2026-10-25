/**
 * EduAI Monitoring — Web Vitals + Error Tracking + Performance Metrics
 * Lightweight client-side monitoring without external dependencies.
 */

// ── Types ─────────────────────────────────────────────────
export interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  timestamp: number;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  component?: string;
  url: string;
  line?: number;
  column?: number;
  timestamp: number;
  userAgent: string;
  userId?: string;
}

// ── Web Vitals Thresholds ──────────────────────────────────
const VITAL_THRESHOLDS: Record<string, [number, number]> = {
  LCP: [2500, 4000],   // Largest Contentful Paint
  FID: [100, 300],     // First Input Delay
  CLS: [0.1, 0.25],   // Cumulative Layout Shift
  INP: [200, 500],     // Interaction to Next Paint
  TTFB: [800, 1800],   // Time to First Byte
  FCP: [1800, 3000],   // First Contentful Paint
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = VITAL_THRESHOLDS[name];
  if (!thresholds) return 'good';
  if (value <= thresholds[0]) return 'good';
  if (value <= thresholds[1]) return 'needs-improvement';
  return 'poor';
}

// ── Event Bus ──────────────────────────────────────────────
type MonitorCallback = (metric: VitalMetric) => void;
const listeners: MonitorCallback[] = [];

export function onVital(callback: MonitorCallback): () => void {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

function reportVital(name: string, value: number, delta: number, id: string) {
  const metric: VitalMetric = {
    name,
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    rating: getRating(name, value),
    delta: Math.round(delta),
    id,
    timestamp: Date.now(),
  };
  listeners.forEach((cb) => cb(metric));
  // Log to console in development
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    const color = metric.rating === 'good' ? '#34d399' : metric.rating === 'needs-improvement' ? '#fbbf24' : '#f87171';
    console.log(`%c[Vital] ${name}: ${metric.value} (${metric.rating})`, `color: ${color}; font-weight: bold`);
  }
}

// ── Web Vitals Observer ────────────────────────────────────
export function initWebVitals() {
  if (typeof window === 'undefined') return;

  // Performance Observer for LCP, FCP, TTFB, CLS, INP
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const entryAny = entry as PerformanceEntry & { processingStart?: number; value?: number; hadRecentInput?: boolean; name?: string };

        if (entry.name === 'largest-contentful-paint') {
          reportVital('LCP', entry.startTime, 0, `lcp-${Math.random()}`);
        }
        if (entry.name === 'first-contentful-paint') {
          reportVital('FCP', entry.startTime, 0, `fcp-${Math.random()}`);
        }
        if (entry.entryType === 'paint' && entry.name === 'first-byte') {
          reportVital('TTFB', entry.startTime, 0, `ttfb-${Math.random()}`);
        }
        if (entry.entryType === 'layout-shift' && !entryAny.hadRecentInput) {
          reportVital('CLS', entryAny.value || 0, 0, `cls-${Math.random()}`);
        }
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    observer.observe({ type: 'first-contentful-paint', buffered: true });
    observer.observe({ type: 'paint', buffered: true });
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch {
    // PerformanceObserver not fully supported
  }

  // FID via first-input
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const firstInput = list.getEntries()[0];
      if (firstInput) {
        const fid = (firstInput as PerformanceEventTiming).processingStart - firstInput.startTime;
        reportVital('FID', fid, 0, `fid-${Math.random()}`);
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch {
    // Not supported
  }

  // INP via event-timing
  try {
    const inpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      let maxDuration = 0;
      for (const entry of entries) {
        const duration = (entry as PerformanceEventTiming).duration;
        if (duration > maxDuration) maxDuration = duration;
      }
      if (maxDuration > 0) {
        reportVital('INP', maxDuration, 0, `inp-${Math.random()}`);
      }
    });
    inpObserver.observe({ type: 'event', buffered: true });
  } catch {
    // Not supported
  }
}

// ── Error Tracking ─────────────────────────────────────────
const errorBuffer: ErrorReport[] = [];
let userId: string | undefined;

export function setMonitoringUserId(id: string) {
  userId = id;
}

function reportError(error: ErrorReport) {
  errorBuffer.push(error);
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.error('[Monitor] Error:', error.message, error.stack);
  }
  // Flush to server periodically
  if (errorBuffer.length >= 5) flushErrors();
}

async function flushErrors() {
  if (errorBuffer.length === 0) return;
  const batch = errorBuffer.splice(0);
  try {
    await fetch('/api/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'client-errors', errors: batch }),
    });
  } catch {
    // Silently fail — don't break the app
  }
}

export function initErrorTracking() {
  if (typeof window === 'undefined') return;

  // Global error handler
  window.addEventListener('error', (event) => {
    reportError({
      message: event.message || 'Unknown error',
      stack: event.error?.stack,
      url: event.filename || window.location.href,
      line: event.lineno,
      column: event.colno,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      userId,
    });
  });

  // Unhandled promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    reportError({
      message: reason?.message || reason?.toString() || 'Unhandled rejection',
      stack: reason?.stack,
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      userId,
    });
  });

  // Flush errors every 30 seconds
  setInterval(flushErrors, 30000);

  // Flush on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushErrors();
  });
}

// ── Performance Metrics ────────────────────────────────────
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log(`%c[Perf] ${name}: ${duration.toFixed(2)}ms`, 'color: #22d3ee; font-weight: bold');
  }
  return duration;
}

export function mark(name: string) {
  if (typeof performance !== 'undefined') {
    performance.mark(name);
  }
}

export function measure(name: string, startMark: string, endMark?: string) {
  if (typeof performance !== 'undefined') {
    try {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name);
      return entries.length > 0 ? entries[entries.length - 1].duration : 0;
    } catch {
      return 0;
    }
  }
  return 0;
}
