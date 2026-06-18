// ===== CLIENT-SIDE HELPERS =====
export function getStoredAdminPassword(): string {
  const hash = localStorage.getItem('admin_token_hash');
  if (!hash) return '';
  try {
    return atob(hash).split(':')[0] || '';
  } catch {
    return '';
  }
}

export function setAdminPassword(password: string): void {
  const salt = Date.now().toString(36);
  const hash = btoa(password + ':' + salt);
  localStorage.setItem('admin_token_hash', hash);
  localStorage.setItem('admin_expiry', (Date.now() + 4 * 60 * 60 * 1000).toString());
}

export function clearAdminAuth(): void {
  localStorage.removeItem('admin_token_hash');
  localStorage.removeItem('admin_expiry');
}

export function isAdminSessionValid(): boolean {
  const expiry = localStorage.getItem('admin_expiry');
  return !!expiry && parseInt(expiry) > Date.now();
}

export function hashToken(pwd: string): string {
  const salt = Date.now().toString(36);
  return btoa(pwd + ':' + salt);
}

// ===== SERVER-SIDE (PURANA — API routes ke liye) =====
import { NextResponse } from 'next/server';

export async function verifyAdminAuth(req: Request): Promise<boolean> {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) return false;

    // Check x-admin-key header (sent by admin frontend)
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey) return adminKey === adminPassword;

    // Fallback: check Authorization: Bearer header
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.split(' ')[1] === adminPassword;
    }

    return false;
  } catch {
    return false;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
