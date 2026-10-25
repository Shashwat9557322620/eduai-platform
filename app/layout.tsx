import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';
import Providers from './Providers';
import { ToastProvider } from './components/Toast';
import SkipToContent from './components/SkipToContent';
import PWABadge from './components/PWABadge';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import MonitoringProvider from './components/MonitoringProvider';
import NavigationProgress from './components/NavigationProgress';
import SmoothScroll from './components/SmoothScroll';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-playfair',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: "EduAI | AI Study Arsenal",
    template: "%s | EduAI",
  },
  description: "Next-gen AI tools for students — Curriculum Optimizer, Neural Flashcards, and Skill Gap Analyzer powered by advanced AI. Boost your grades and career.",
  keywords: ["AI", "study", "education", "flashcards", "curriculum", "skill gap", "learning", "edtech", "AI study tools", "student productivity", "career growth"],
  authors: [{ name: "EduAI" }],
  creator: "EduAI",
  metadataBase: new URL("https://eduai.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "EduAI | AI Study Arsenal",
    description: "Next-gen AI tools for students — Curriculum Optimizer, Neural Flashcards, and Skill Gap Analyzer.",
    type: "website",
    siteName: "EduAI",
    url: "https://eduai.vercel.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EduAI - AI Study Arsenal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EduAI | AI Study Arsenal",
    description: "Next-gen AI tools for students — Curriculum Optimizer, Neural Flashcards, and Skill Gap Analyzer.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#020203",
  width: "device-width",
  initialScale: 1,
};

import CursorSystem from './components/CursorSystem';
import CreditWarningBanner from './components/CreditWarningBanner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#020203" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="EduAI" />
          <link rel="apple-touch-icon" href="/icon-192.png" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="application-name" content="EduAI" />
          <meta name="msapplication-TileColor" content="#020203" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "EduAI",
                applicationCategory: "EducationalApplication",
                operatingSystem: "Web",
                description: "Next-gen AI tools for students — Curriculum Optimizer, Neural Flashcards, and Skill Gap Analyzer.",
                url: "https://eduai.vercel.app",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "INR",
                },
              }),
            }}
          />
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </head>
        <body suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable} font-sans antialiased bg-[#020203] text-white selection:bg-cyan-500/30`}>
          <NavigationProgress />
          <SkipToContent />
          <Providers>
            <ToastProvider>
              <CursorSystem />
              <CreditWarningBanner />
              <main id="main-content" role="main" aria-label="Main content">
                <SmoothScroll>
                  {children}
                </SmoothScroll>
              </main>
              <PWAInstallPrompt />
              <PWABadge count={0} show={true} />
              <MonitoringProvider />
            </ToastProvider>
          </Providers>
          {/* Service Worker Registration */}
          <Script id="sw-register" strategy="afterInteractive">
            {`
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', async function() {
                  try {
                    var reg = await navigator.serviceWorker.register('/sw.js');
                    if (process.env.NODE_ENV === 'development') console.log('[SW] Registered:', reg.scope);
                    
                    // Check for updates periodically
                    setInterval(function() { reg.update(); }, 60 * 60 * 1000);
                    
                    // Handle SW updates
                    reg.addEventListener('updatefound', function() {
                      var newWorker = reg.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', function() {
                          if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                            window.dispatchEvent(new Event('sw-updated'));
                          }
                        });
                      }
                    });
                  } catch (err) {
                    if (process.env.NODE_ENV === 'development') console.log('[SW] Registration failed:', err);
                  }
                });
                
                // Handle SW messages
                navigator.serviceWorker.addEventListener('message', function(event) {
                  if (event.data.type === 'SW_UPDATED') {
                    window.dispatchEvent(new Event('sw-updated'));
                  }
                  if (event.data.type === 'PERIODIC_SYNC') {
                    window.dispatchEvent(new CustomEvent('sw-periodic-sync', { detail: event.data }));
                  }
                  if (event.data.type === 'NOTIFICATION_CLICKED') {
                    window.location.href = event.data.url;
                  }
                });
              }
            `}
          </Script>
        </body>
      </html>
    </ClerkProvider>
  );
}
