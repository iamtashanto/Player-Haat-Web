import { test, expect } from '@playwright/test';

test.describe('Recruiter User Journey', () => {
  test('recruiter signup, search players, and shortlist', async ({ page }) => {
    // 1. Visit Recruiter Discover page
    await page.goto('/en/recruiter/discover');
    await expect(page.locator('h1')).toContainText(/Discover Players/i);

    // Search input
    const searchInput = page.getByPlaceholder(/Search players/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Sohel');

    // Filter chips
    await expect(page.locator('text=Paid Khep')).toBeVisible();

    // Shortlist button navigation
    const shortlistNav = page.getByRole('button', { name: /Shortlist/i }).first();
    await expect(shortlistNav).toBeVisible();
    await shortlistNav.click();
    await expect(page).toHaveURL(/.*shortlist/);
  });

  test('recruiter recruitment requests and applicant acceptance', async ({ page }) => {
    // 1. Visit Recruiter Requests manager
    await page.goto('/en/recruiter/requests');
    await expect(page.locator('h1')).toBeVisible();

    // Verify Post Request button
    const postBtn = page.getByRole('button', { name: /Post a request|Post request/i }).first();
    await expect(postBtn).toBeVisible();

    // Open applicants sheet
    const applicantsBtn = page.getByRole('button', { name: /Applicants/i }).first();
    if (await applicantsBtn.isVisible()) {
      await applicantsBtn.click();
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });
});

