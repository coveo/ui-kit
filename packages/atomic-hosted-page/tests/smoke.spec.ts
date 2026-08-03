import {expect, test} from './fixture.js';

const urls = ['./hosted-ui-builder.html', './hosted-ui-trial.html', './hosted-ui-code.html'];

for (const url of urls) {
  test(`smoke test for ${url}`, async ({page}) => {
    await page.goto(url);
    await page.getByLabel('Search field with suggestions').click();
    await page.getByLabel('Search field with suggestions').fill('test');
    await page.getByLabel('Search field with suggestions').press('Enter');
    await expect(page.getByText(/Results 1-\d+ of 120/).first()).toBeVisible();
    await expect(page.getByRole('link', {name: 'Sample Result 1'}).first()).toBeVisible();
  });
}
