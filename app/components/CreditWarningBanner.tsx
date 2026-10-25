"use client";
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ArrowRight } from 'lucide-react';

// Pages where we show the banner (all tool pages)
const TOOL_PATHS = ['/optimizer', '/flashcards', '/analyzer', '/tutor', '/podcast', '/dashboard'];
// Pages to skip the banner on
const SKIP_PATHS = ['/billing', '/sign-in', '/sign-up', '/'];

export default function CreditWarningBanner() {
  const { user, isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const isToolPage = TOOL_PATHS.some(p => pathname?.startsWith(p));
  const isSkipPage = SKIP_PATHS.some(p => pathname === p);

  useEffect(() => {
    if (!isSignedIn || !isLoaded || isSkipPage) return;
    fetch('/api/user/credits')
      .then(r => r.json())
      .then(d => setCredits(d.credits ?? null))
      .catch(() => {});
  }, [isSignedIn, isLoaded, pathname, isSkipPage]);

  // Auto redirect when credits = 0 and they try to use a tool
  useEffect(() => {
    if (credits === 0 && isToolPage) {
      router.push('/billing?reason=no_credits');
    }
  }, [credits, isToolPage, router]);

  // Reset dismissed on page change
  useEffect(() => setDismissed(false), [pathname]);

  if (!isSignedIn || !isLoaded || credits === null || isSkipPage || !isToolPage) return null;

  // ─ LOW credits warning (≤ 5 but > 0)
  const isLow = credits > 0 && credits <= 5;
  const isCritical = credits > 0 && credits <= 2;

  if (!isLow || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -60 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-[72px] left-0 right-0 z-[99] flex justify-center px-4 pointer-events-none"
      >
        <div
          className="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl max-w-xl w-full"
          style={{
            backgroundColor: isCritical ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.1)',
            borderColor: isCritical ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.35)',
            backdropFilter: 'blur(20px)',
            boxShadow: isCritical
              ? '0 0 40px rgba(239,68,68,0.15)'
              : '0 0 40px rgba(245,158,11,0.1)',
          }}
        >
          {/* Pulse icon */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: isCritical ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.15)' }}
          >
            <Zap
              className="w-4 h-4"
              style={{ color: isCritical ? '#ef4444' : '#f59e0b' }}
            />
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">
              {isCritical
                ? `⚠️ Only ${credits} credit${credits === 1 ? '' : 's'} left — running on empty!`
                : `⚡ ${credits} credits remaining — don't get cut off`
              }
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Upgrade now to keep your AI study engine running
            </p>
          </div>

          {/* Upgrade CTA */}
          <button
            onClick={() => router.push('/billing')}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: isCritical
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: isCritical ? '0 0 15px rgba(239,68,68,0.3)' : '0 0 15px rgba(245,158,11,0.3)',
            }}
          >
            Upgrade
            <ArrowRight className="w-3 h-3" />
          </button>

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
