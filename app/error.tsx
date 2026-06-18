"use client";

import { useEffect } from 'react';

/**
 * Global error boundary for the entire application.
 * Catches unhandled errors at the route level with a branded fallback UI.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#020203', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            {/* Glitch 404-style icon */}
            <div style={{
              fontSize: 80,
              fontWeight: 900,
              background: 'linear-gradient(135deg, #f87171, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 16,
              lineHeight: 1,
            }}>
              !!
            </div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}>
              Something went wrong
            </h1>
            <p style={{
              color: '#71717a',
              fontSize: 15,
              lineHeight: 1.6,
              marginBottom: 32,
            }}>
              An unexpected error occurred. Our team has been notified.
              {error.digest && (
                <span style={{ display: 'block', marginTop: 8, fontSize: 12, color: '#52525b', fontFamily: 'monospace' }}>
                  Error ID: {error.digest}
                </span>
              )}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => reset()}
                style={{
                  padding: '12px 28px',
                  borderRadius: 12,
                  background: '#fff',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  padding: '12px 28px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
