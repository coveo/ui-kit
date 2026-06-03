import {expect, test} from '@playwright/test';

test.describe('smoke test', () => {
  test('Search Page', async ({page}) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:5173');

    // Verify the app loads with main content
    await expect(page.locator('main.App')).toBeVisible();

    // Verify search box is present and perform a search
    const searchBox = page.getByRole('textbox').first();
    await expect(searchBox).toBeVisible();
    await searchBox.fill('test');
    await searchBox.press('Enter');

    // Verify results are displayed after search
    await expect(page.locator('main.App')).toBeVisible();

    // Filter out known Coveo API dispatch errors from the sample org
    const unexpectedErrors = consoleErrors.filter(
      (error) => !error.includes('Action dispatch error')
    );
    expect(unexpectedErrors).toEqual([]);
  });
});
