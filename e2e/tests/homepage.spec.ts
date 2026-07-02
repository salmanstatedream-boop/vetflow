import { test, expect } from '@playwright/test';

test('landing page renders correctly and takes screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Phoenix OS').first()).toBeVisible();

  await expect(page.locator('text=Every clinic workflow')).toBeVisible();
  await page.waitForTimeout(1000);

  await page.evaluate(async () => {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const scrollHeight = document.body.scrollHeight;
    const viewportHeight = window.innerHeight;
    let currentPosition = 0;

    while (currentPosition < scrollHeight) {
      window.scrollTo(0, currentPosition);
      currentPosition += viewportHeight / 2;
      await delay(50);
    }

    window.scrollTo(0, 0);
  });

  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'e2e/screenshots/homepage.png', fullPage: true });
});
