/**
 * Input sanitization utilities for XSS protection
 */

/** Strip HTML tags from a string */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/** Sanitize user input: strip HTML, trim, limit length */
export function sanitizeInput(input: string, maxLength: number = 10000): string {
  return stripHtml(input).trim().slice(0, maxLength);
}

/** Sanitize a string for safe display in HTML attributes */
export function escapeAttr(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Validate that a string contains only expected characters */
export function isCleanInput(input: string): boolean {
  // Reject if contains common XSS payloads
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
    /expression\(/i,
    /eval\(/i,
    /alert\(/i,
  ];
  return !xssPatterns.some((pattern) => pattern.test(input));
}

/** Get client IP from request headers */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "127.0.0.1";
}
