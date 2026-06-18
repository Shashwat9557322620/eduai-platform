import { test, expect } from '@playwright/test';

/**
 * E2E Tests — Homepage & Navigation
 */
test.describe('Homepage', () => {
  test('loads successfully and displays hero', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/EduAI/);
    const hero = page.locator('h1');
    await expect(hero).toBeVisible();
  });

  test('has accessible skip-to-content link', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.getByText('Skip to main content');
    await expect(skipLink).toBeFocused();
  });

  test('navigation links are visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('module cards link to correct pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/optimizer"]')).toBeVisible();
    await expect(page.locator('a[href="/flashcards"]')).toBeVisible();
    await expect(page.locator('a[href="/analyzer"]')).toBeVisible();
  });

  test('page renders without critical console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForTimeout(2000);
    const criticalErrors = errors.filter(
      (e) => !e.includes('gtag') && !e.includes('google') && !e.includes('clerk')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Public Page Navigation', () => {
  test('can navigate to FAQ page', async ({ page }) => {
    await page.goto('/faq');
    await expect(page).toHaveURL(/\/faq/);
  });

  test('can navigate to support page', async ({ page }) => {
    await page.goto('/support');
    await expect(page).toHaveURL(/\/support/);
  });

  test('can navigate to about page', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL(/\/about/);
  });

  test('can navigate to privacy policy', async ({ page }) => {
    await page.goto('/privacy-policy');
    await expect(page).toHaveURL(/\/privacy-policy/);
  });

  test('can navigate to terms of service', async ({ page }) => {
    await page.goto('/terms-of-service');
    await expect(page).toHaveURL(/\/terms-of-service/);
  });

  test('can navigate to refund policy', async ({ page }) => {
    await page.goto('/refund-policy');
    await expect(page).toHaveURL(/\/refund-policy/);
  });
});

test.describe('Keyboard Navigation', () => {
  test('can tab through interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // Should reach nav
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.tagName : null;
    });
    expect(focused).toBeTruthy();
  });
});
