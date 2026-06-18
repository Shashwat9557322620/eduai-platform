import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 60, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

/**
 * POST /api/health — Receive client-side error reports from monitoring.
 * Used by the error tracking flush in layout.tsx sendBeacon calls.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.type === 'client-errors' && Array.isArray(body.errors)) {
      // Log client errors to console for now; integrate with external service later
      for (const err of body.errors) {
        console.error('[ClientError]', err.message, err.url, err.line, err.column);
      }
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: true });
  }
}
