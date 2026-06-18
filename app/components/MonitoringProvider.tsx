"use client";

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { initWebVitals, initErrorTracking, onVital, setMonitoringUserId } from '@/lib/monitoring';

/**
 * MonitoringProvider — wires up lib/monitoring.ts on the client.
 * Initializes Web Vitals via PerformanceObserver and error tracking.
 * Reports LCP to Google Analytics for performance monitoring.
 * Associates errors with the authenticated user when available.
 */
export default function MonitoringProvider() {
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) {
      setMonitoringUserId(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    initErrorTracking();
    initWebVitals();
    const unsubscribe = onVital((metric) => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: metric.name,
          value: metric.value,
          non_interaction: true,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return null;
}
