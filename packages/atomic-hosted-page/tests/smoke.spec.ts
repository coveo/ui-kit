import {test, expect} from '@playwright/test';

const urls = [
  'http://localhost:8000/hosted-ui-builder.html',
  'http://localhost:8000/hosted-ui-trial.html',
  'http://localhost:8000/hosted-ui-code.html',
];

for (const url of urls) {
  test(`smoke test for ${url}`, async ({page}) => {
    await page.goto(url);
    await page.getByLabel('Search field with suggestions').click();
    await page.getByLabel('Search field with suggestions').fill('test');
    await page.getByLabel('Search field with suggestions').press('Enter');
    await expect(
      page.getByText(/Results 1-10 of [\d,]+/).first()
    ).toBeVisible();
  });
}
