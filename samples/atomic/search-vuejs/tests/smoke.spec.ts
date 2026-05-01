import {expect, test} from '@playwright/test';

test.describe('smoke test', () => {
  test.use({viewport: {width: 2000, height: 2000}});

  test('should load', async ({page}) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:5173');

    const searchBox = page.locator('atomic-search-box');
    await expect(searchBox).toBeVisible();

    const querySummary = page.locator('atomic-query-summary');
    await querySummary.waitFor();
    await querySummary.locator('div[part="container"]').waitFor();

    const textarea = searchBox.locator('textarea[part="textarea"]');
    await textarea.fill('test');
    await textarea.press('Enter');

    const facet = page.locator('atomic-facet').first();
    await expect(facet).toBeVisible({timeout: 10000});

    await expect(querySummary).toBeVisible();

    const summaryContainer = querySummary.locator('div[part="container"]');
    await expect
      .poll(
        async () => {
          const text = await summaryContainer.textContent();
          return text ?? '';
        },
        {timeout: 10000}
      )
      .toMatch(/Results 1-[1-9].*for test/);

    const resultList = page.locator('atomic-result-list');
    await expect(resultList).toBeVisible();

    const firstResult = resultList.locator('atomic-result').first();
    await expect(firstResult).toBeVisible();

    const filteredErrors = consoleErrors.filter(
      (error) =>
        !error.includes('ResizeObserver loop') &&
        !error.includes('MissingInterfaceParentError')
    );
    expect(filteredErrors).toEqual([]);
  });
});
