import {test as it} from '@playwright/test';

const {describe, expect} = it;

describe('My main page', () => {
  it('should load coveo results', async ({page}) => {
    await page.goto('http://localhost:5173/');
    await expect(
      page.getByText(/Results \d+-\d+ of [\d,. ]+ in \d+\./)
    ).toBeVisible();
  });
});
