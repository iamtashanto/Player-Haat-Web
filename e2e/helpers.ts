import { execFileSync } from 'node:child_process';
import { expect, type Page, type TestInfo } from '@playwright/test';

export const DB = process.env.E2E_DATABASE_URL ?? 'postgresql://ta-shanto@localhost/ph_web';
export const stamp = Date.now().toString(36);

/** Run SQL against the API's database (e2e only: to move a match into the past, since the UI can't time-travel). */
export function sql(query: string): string {
  return execFileSync('psql', [DB, '-Atc', query], { encoding: 'utf8' }).trim();
}

export async function shot(page: Page, info: TestInfo, name: string) {
  await page.waitForTimeout(800); // let animations settle (polling keeps the network busy, so no networkidle)
  await page.screenshot({ path: `e2e/screenshots/${info.project.name}-${name}.png`, fullPage: false });
}

/** Sign up through the real UI with email + password. */
export async function signUp(page: Page, role: 'Player' | 'Recruiter', name: string, email: string) {
  await page.goto('/en/auth');
  await page.getByRole('button', { name: new RegExp(`^${role}`, 'i') }).first().click();
  await page.getByRole('button', { name: /use email/i }).click();
  await page.getByRole('tab', { name: /sign up/i }).or(page.getByRole('button', { name: /^sign up$/i })).first().click();
  await page.getByRole('textbox', { name: /full name/i }).fill(name);
  await page.getByRole('textbox', { name: /^email$/i }).fill(email);
  await page.getByRole('textbox', { name: /^password$/i }).fill('Passw0rd1');
  await page.getByRole('button', { name: /create account/i }).click();
}

export async function expectNoFakeContent(page: Page) {
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/Sohel Rana|Abahani|sample|lorem/i);
}
