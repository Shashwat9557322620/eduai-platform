import { test, expect } from '@playwright/test';

/**
 * E2E Tests — Accessibility
 */
test.describe('Accessibility', () => {
  test('homepage has main landmark', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('main[role="main"]');
    await expect(main).toBeVisible();
  });

  test('homepage has skip-to-content link', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test('all pages have lang attribute', async ({ page }) => {
    await page.goto('/');
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBe('en');
  });

  test('interactive elements are focusable', async ({ page }) => {
    await page.goto('/');
    const links = await page.locator('a[href]').all();
    expect(links.length).toBeGreaterThan(0);
    // First link should be the skip-to-content link
    await links[0].focus();
    await expect(links[0]).toBeFocused();
  });

  test('404 page returns proper status', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');
    expect(response?.status()).toBe(404);
  });

  test('faq page has proper heading structure', async ({ page }) => {
    await page.goto('/faq');
    const headings = await page.locator('h1, h2, h3').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('theme color meta tag is set', async ({ page }) => {
    await page.goto('/');
    const themeColor = await page.getAttribute('meta[name="theme-color"]', 'content');
    expect(themeColor).toBeTruthy();
  });

  test('ARIA labels present on key interactive elements', async ({ page }) => {
    await page.goto('/');
    // Navigation should have aria-label
    const nav = page.locator('nav[aria-label]');
    await expect(nav).toBeAttached();
  });
});
