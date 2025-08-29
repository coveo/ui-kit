import {expect, test} from '@playwright/test';

test.describe('smoke test', () => {
  test.use({viewport: {width: 2000, height: 2000}});

  test('Search Page', async ({page}) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Visit the application
    await page.goto('http://localhost:5173');

    // Check for the search box and perform a search
    const searchBox = page.locator('atomic-search-box');
    await expect(searchBox).toBeVisible();

    const querySummary = page.locator('atomic-query-summary');

    await querySummary.waitFor();
    await querySummary.locator('div[part="container"]').waitFor();

    const textarea = searchBox.locator('textarea[part="textarea"]');
    await textarea.fill('test');
    await textarea.press('Enter');

    // Verify facet exists
    const facet = page.locator('atomic-facet').first();
    await expect(facet).toBeVisible();

    // Verify query summary
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

    // Verify result list and results exist
    const resultList = page.locator('atomic-result-list');
    await expect(resultList).toBeVisible();

    const firstResult = resultList.locator('atomic-result').first();
    await expect(firstResult).toBeVisible();

    // Filter out expected MissingInterfaceParentError as they are getting fixed with Lit
    const filteredErrors = consoleErrors.filter(
      (error) => !error.includes('MissingInterfaceParentError')
    );
    expect(filteredErrors).toEqual([]);
  });

  test('Commerce Search Page', async ({page}) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:5173/?page=Commerce%20Search%20Page');

    // Verify search box is visible
    const searchBox = page.locator('atomic-commerce-search-box');
    await expect(searchBox).toBeVisible();

    const querySummary = page.locator('atomic-commerce-query-summary');

    await querySummary.waitFor();
    await querySummary.locator('div[part="container"]').waitFor();

    // Perform a search query
    const textarea = searchBox.locator('textarea[part="textarea"]');
    await textarea.fill('shoe');
    await textarea.press('Enter');

    // Verify query summary
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

    // Verify facets are visible
    const facets = page.locator('atomic-commerce-facets');
    await expect(facets).toBeVisible();

    // Verify product list is visible
    const productList = page.locator('atomic-commerce-product-list');
    await expect(productList).toBeVisible();

    // Verify at least one product is displayed
    const firstProduct = productList.locator('atomic-product').first();
    await expect(firstProduct).toBeVisible();

    // Filter out expected MissingInterfaceParentError for atomic-result-link
    const filteredErrors = consoleErrors.filter(
      (error) =>
        !error.includes('MissingInterfaceParentError') ||
        !error.includes('atomic-result-link')
    );
    expect(filteredErrors).toEqual([]);
  });

  test('Commerce Recommendation Page', async ({page}) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(
      'http://localhost:5173/?page=Commerce%20Recommendations%20Page'
    );

    // Verify recommendation list is visible
    const recommendationList = page.locator(
      'atomic-commerce-recommendation-list'
    );
    await expect(recommendationList).toBeVisible();

    // Verify at least one recommendation is displayed
    const firstRecommendation = recommendationList
      .locator('atomic-product')
      .first();
    await expect(firstRecommendation).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});
