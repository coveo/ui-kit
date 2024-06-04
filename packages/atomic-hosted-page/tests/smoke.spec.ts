import {test, expect} from '@playwright/test';

test('smoke test', async ({page}) => {
  await page.goto('http://localhost:3335/');
  await page.getByLabel('Search field with suggestions').click();
  await page.getByLabel('Search field with suggestions').fill('test');
  await page.getByLabel('Search field with suggestions').press('Enter');
  await expect(
    page.getByText(/Results 1-10 of \d for test in [\d.]? second/)
  ).toBeVisible();
});
