import {test, expect} from '@playwright/test';

test('test', async ({page}) => {
  await page.goto(
    'http://localhost:4400/iframe.html?id=atomic-icon--default&viewMode=story'
  );
  await expect(page.locator('svg')).toBeVisible();
});
