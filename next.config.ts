import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://*.google-analytics.com https://*.razorpay.com https://*.clerk.dev https://*.clerk.accounts.dev",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.accounts.dev",
      "img-src 'self' data: blob: https://*.supabase.co https://*.google-analytics.com https://*.clerk.accounts.dev https://img.clerk.com https://*.razorpay.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src *",
      "frame-src *",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action *",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const baseConfig: NextConfig = {
  experimental: {
    // optimizeCss: true, // disabled because it strips CSS in development
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ hostname: "**.supabase.co" }],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/api/(.*)",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(baseConfig);
