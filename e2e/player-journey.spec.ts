import { test, expect } from '@playwright/test';

test.describe('Player User Journey', () => {
  test('player signup and onboarding flow', async ({ page }) => {
    // 1. Visit Auth page
    await page.goto('/bn/auth');
    await expect(page).toHaveTitle(/PlayerHaat/);

    // Verify role selection buttons
    const playerRoleButton = page.getByRole('button', { name: /খেলোয়াড়|Player/i });
    await expect(playerRoleButton).toBeVisible();
    await playerRoleButton.click();

    // 2. Navigate to Onboarding
    await page.goto('/bn/player/onboarding');
    await expect(page.locator('h1')).toBeVisible();

    // Step 1: Location & bio
    const continueBtn = page.getByRole('button', { name: /পরবর্তী|Continue/i });
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    }

    // Step 2: Choose Sport
    await expect(page.locator('text=ফুটবল').or(page.locator('text=Football'))).toBeVisible();
  });

  test('player sports profiles management', async ({ page }) => {
    await page.goto('/en/player/profiles');
    await expect(page.locator('h1')).toContainText(/Profiles/i);

    // Profile card displays statistics
    await expect(page.locator('text=Match Statistics')).toBeVisible();
    await expect(page.locator('text=Achievements')).toBeVisible();
  });

  test('player opportunities feed & apply action', async ({ page }) => {
    await page.goto('/en/player/opportunities');
    await expect(page.locator('h1')).toContainText(/Opportunities/i);

    // Open first apply sheet
    const applyBtn = page.getByRole('button', { name: /Apply/i }).first();
    if (await applyBtn.isVisible()) {
      await applyBtn.click();
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });
});

