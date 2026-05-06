import {expect, test} from '@playwright/test';

test.describe('Atomic Commerce React Sample', () => {
  test('commerce search page loads and displays products', async ({page}) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3005');

    const searchBox = page.locator('atomic-commerce-search-box');
    await expect(searchBox).toBeVisible({timeout: 30000});

    const querySummary = page.locator('atomic-commerce-query-summary');
    await querySummary.waitFor();
    await querySummary.locator('div[part="container"]').waitFor();

    const textarea = searchBox.locator('textarea[part="textarea"]');
    await textarea.fill('shoe');
    await textarea.press('Enter');

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
      .toMatch(/Products? 1-[1-9]?[0-9]* of \d+ for shoe/);

    const productList = page.locator('atomic-commerce-product-list');
    await expect(productList).toBeVisible();

    const firstProduct = productList.locator('atomic-product').first();
    await expect(firstProduct).toBeVisible();

    const filteredErrors = consoleErrors.filter(
      (error) => !error.includes('MissingInterfaceParentError')
    );
    expect(filteredErrors).toEqual([]);
  });

  test('commerce recommendation page loads', async ({page}) => {
    await page.goto('http://localhost:3005');

    const recommendationsButton = page.getByRole('button', {
      name: 'Recommendations',
    });
    await expect(recommendationsButton).toBeVisible({timeout: 30000});
    await recommendationsButton.click();

    const recommendationList = page.locator(
      'atomic-commerce-recommendation-list'
    );
    await expect(recommendationList).toBeVisible();

    const firstProduct = recommendationList.locator('atomic-product').first();
    await expect(firstProduct).toBeVisible();
  });
});
