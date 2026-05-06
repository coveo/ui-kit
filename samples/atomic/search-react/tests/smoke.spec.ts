import {expect, test} from '@playwright/test';

test.describe('Atomic Search React Sample', () => {
  test('loads and performs a search', async ({page}) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3004');

    const searchBox = page.locator('atomic-search-box');
    await expect(searchBox).toBeVisible();

    const querySummary = page.locator('atomic-query-summary');
    await querySummary.waitFor();
    await querySummary.locator('div[part="container"]').waitFor();

    const textarea = searchBox.locator('textarea[part="textarea"]');
    await textarea.fill('test');
    await textarea.press('Enter');

    const facet = page.locator('atomic-facet').first();
    await expect(facet).toBeVisible();

    await expect(querySummary).toBeVisible();

    const summaryContainer = querySummary.locator('div[part="container"]');
    await expect
      .poll(
        async () => {
          const text = await summaryContainer.textContent();
          return text ?? '';
        },
        {timeout: 5000}
      )
      .toMatch(/Results 1-[1-9].*for test/);

    const filteredErrors = consoleErrors.filter(
      (error) => !error.includes('MissingInterfaceParentError')
    );
    expect(filteredErrors).toEqual([]);
  });
});
