"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

/**
 * PWA Install Prompt with aria-live for screen reader announcements.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('eduai_pwa_dismissed');
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setIsVisible(false);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    sessionStorage.setItem('eduai_pwa_dismissed', '1');
  }, []);

  if (!deferredPrompt) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[800]"
          role="status"
          aria-live="polite"
          aria-label="Install EduAI app"
        >
          <div className="relative bg-[#0a0a0f] border border-white/10 rounded-2xl p-5 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white mb-1">Install EduAI</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Add to your home screen for quick access and offline support.</p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-gray-100 transition-all disabled:opacity-50"
                  >
                    {isInstalling ? 'Installing...' : 'Install'}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Not now
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Dismiss install prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
