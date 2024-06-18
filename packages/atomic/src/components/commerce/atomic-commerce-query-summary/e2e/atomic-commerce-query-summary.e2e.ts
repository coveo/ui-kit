import {test, expect} from './fixture';

test.describe('when search has not been executed', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-query-summary--default&viewMode=story'
    );
  });

  test('should display a placeholder', async ({querySummary}) => {
    await expect(querySummary.placeholder).not.toBeVisible();
  });
});

test.describe('after searching for kayak', () => {
  test.beforeEach(async ({searchBox, page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-query-summary--with-search-box&viewMode=story'
    );
    await searchBox.hydrated.waitFor();
    await searchBox.searchInput.fill('kayak');
    await searchBox.submitButton.click();
  });

  test('should not display duration by default', async ({querySummary}) => {
    const textRegex = /^Results 1-[\d,]+ of [\d,]+ for kayak$/;
    await expect(querySummary.text(textRegex)).toBeVisible();
  });
});

test.describe('when search yields no results', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-query-summary--no-results&viewMode=story'
    );
  });

  test('should not display anything', async ({querySummary}) => {
    await expect(querySummary.hydrated).toBeEmpty();
  });
});

test.describe('when search yields 27 results', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-query-summary--fixed-number-of-results&viewMode=story'
    );
  });

  test('screen readers should read out', async ({querySummary}) => {
    const textRegex = /Results 1-27 of [\d,]+/;
    await expect(querySummary.ariaLive(textRegex)).toBeVisible();
  });
});

test.describe('when a query yield a single result', () => {
  test.beforeEach(async ({page, searchBox}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-query-summary--with-search-box&viewMode=story'
    );
    await searchBox.hydrated.waitFor();
    await searchBox.searchInput.fill('@ec_product_id=SP03730_00007');
    await searchBox.submitButton.click();
  });

  test('should display message', async ({querySummary}) => {
    const textRegex = /^Result 1 of 1 for @ec_product_id=SP03730_00007$/;
    await expect(querySummary.text(textRegex)).toBeVisible();
  });

  test('screen readers should read out', async ({querySummary}) => {
    const textRegex = /^Result 1 of 1 for @ec_product_id=SP03730_00007$/;
    await expect(querySummary.ariaLive(textRegex)).toBeVisible();
  });
});
