import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 5, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { password } = await req.json();
    
    // Support both plain text and hash-based password
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    
    // Direct comparison with plain text password
    if (adminPassword && password === adminPassword) {
      return NextResponse.json({ success: true });
    }
    
    // Fallback to hash comparison
    if (adminPasswordHash) {
      const valid = await bcrypt.compare(password, adminPasswordHash);
      if (valid) {
        return NextResponse.json({ success: true });
      }
    }
    
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
