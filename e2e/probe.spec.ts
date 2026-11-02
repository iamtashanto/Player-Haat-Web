import { test } from '@playwright/test';
import { shot, signUp, stamp } from './helpers';

test('probe signup', async ({ page }, info) => {
  await signUp(page, 'Player', 'Probe Player', `probe-${stamp}-${info.project.name}@e2e.test`);
  await page.waitForTimeout(3000);
  console.log('URL after signup:', page.url());
  await shot(page, info, 'probe');
});
