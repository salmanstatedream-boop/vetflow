import { test, expect, type Page } from '@playwright/test';

async function loginAsDoctor(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'doctor.a@vetcare.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });
}

async function openFirstMatchingVisit(page: Page, purposeLabel: RegExp) {
  await page.goto('/dashboard/doctors');
  await page.waitForLoadState('networkidle');

  const row = page.locator('a, button, tr, [role="row"]').filter({ hasText: purposeLabel }).first();
  if ((await row.count()) === 0) {
    test.info().annotations.push({
      type: 'note',
      description: `No ${purposeLabel} visit found in doctor queue — UI locking flow skipped for this purpose.`,
    });
    return false;
  }
  await row.click();
  await page.waitForURL(/\/dashboard\/doctors\//, { timeout: 15000 });
  return true;
}

async function assertTwoStepLocking(page: Page, page1Label: string, page2Label: string) {
  await expect(page.getByText(page1Label, { exact: false }).first()).toBeVisible({ timeout: 15000 });
  const page2Btn = page.getByRole('button', { name: new RegExp(`2\\.\\s*${page2Label}`, 'i') });
  await expect(page2Btn).toBeVisible();
  await expect(page2Btn).toBeDisabled();

  // Attempting locked step should stay blocked
  await page2Btn.click({ force: true }).catch(() => undefined);
  await expect(page.getByText(/complete previous sections first/i)).toBeVisible({ timeout: 3000 }).catch(
    async () => {
      // Some browsers ignore disabled click; ensure page 1 content still showing
      await expect(page.getByText(/Vitals/i).first()).toBeVisible();
    }
  );
}

test.describe('specialty consultation workflows', () => {
  test('vaccination Exam & Fitness → Vaccines & Rx locking chrome', async ({ page }) => {
    await loginAsDoctor(page);
    const opened = await openFirstMatchingVisit(page, /vaccin/i);
    test.skip(!opened, 'No vaccination visit available in queue');

    await expect(page.getByText(/Vaccination workflow/i)).toBeVisible({ timeout: 15000 });
    await assertTwoStepLocking(page, 'Exam & Fitness', 'Vaccines & Rx');
    await expect(page.getByText(/Fitness outcome/i)).toBeVisible();
    await expect(page.getByText(/Vaccination type/i)).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/workflow-vaccination-page1.png', fullPage: true });
  });

  test('deworming Exam & Fitness → Deworming & Rx locking chrome', async ({ page }) => {
    await loginAsDoctor(page);
    const opened = await openFirstMatchingVisit(page, /deworm/i);
    test.skip(!opened, 'No deworming visit available in queue');

    await expect(page.getByText(/Deworming workflow/i)).toBeVisible({ timeout: 15000 });
    await assertTwoStepLocking(page, 'Exam & Fitness', 'Deworming & Rx');
    await expect(page.getByText(/Deworming type/i)).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/workflow-deworming-page1.png', fullPage: true });
  });

  test('grooming Exam & Grooming → Services & Rx locking chrome', async ({ page }) => {
    await loginAsDoctor(page);
    const opened = await openFirstMatchingVisit(page, /groom/i);
    test.skip(!opened, 'No grooming visit available in queue');

    await expect(page.getByText(/Grooming workflow/i)).toBeVisible({ timeout: 15000 });
    await assertTwoStepLocking(page, 'Exam & Grooming', 'Services & Rx');
    await expect(page.getByText(/Grooming type/i)).toBeVisible();
    await expect(page.getByText(/Condition checks/i)).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/workflow-grooming-page1.png', fullPage: true });
  });
});
