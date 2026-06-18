"use client";
import { useEffect, useState } from 'react';

interface PWABadgeProps {
  count?: number;
  show?: boolean;
}

export default function PWABadge({ count = 0, show = true }: PWABadgeProps) {
  const [badgeSupported, setBadgeSupported] = useState(false);

  useEffect(() => {
    // Check if Badge API is supported
    if ('setAppBadge' in navigator || 'setExperimentalAppBadge' in navigator) {
      setBadgeSupported(true);
    }
  }, []);

  useEffect(() => {
    if (!badgeSupported || !show) return;

    const updateBadge = async () => {
      try {
        if ('setAppBadge' in navigator) {
          if (count > 0) {
            await (navigator as any).setAppBadge(count);
          } else {
            await (navigator as any).clearAppBadge();
          }
        } else if ('setExperimentalAppBadge' in navigator) {
          if (count > 0) {
            await (navigator as any).setExperimentalAppBadge(count);
          } else {
            await (navigator as any).clearExperimentalAppBadge();
          }
        }

        // Also send message to service worker
        if (navigator.serviceWorker?.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SET_BADGE',
            count: count,
          });
        }
      } catch (err) {
        console.error('Badge update failed:', err);
      }
    };

    updateBadge();
  }, [count, badgeSupported, show]);

  // This component doesn't render anything visible
  // It just manages the app badge
  return null;
}