import {test, expect} from './fixture';

test.describe('when search has not been executed', () => {
  test.beforeEach(async ({querySummary}) => {
    await querySummary.load();
  });

  test('should display a placeholder', async ({querySummary}) => {
    await expect(querySummary.placeholder).not.toBeVisible();
  });
});

test.describe('after searching for kayak', () => {
  test.beforeEach(async ({searchBox, querySummary}) => {
    await querySummary.load({}, 'with-search-box');
    await searchBox.hydrated.waitFor();
    await searchBox.searchInput.fill('kayak');
    await searchBox.submitButton.click();
  });

  test('should not display duration by default', async ({querySummary}) => {
    const textRegex = /^Products 1-[\d,]+ of [\d,]+ for kayak$/;
    await expect(querySummary.text(textRegex)).toBeVisible();
  });
});

test.describe('when search yields no produts', () => {
  test.beforeEach(async ({querySummary}) => {
    await querySummary.load({}, 'no-products');
  });

  test('should not display anything', async ({querySummary}) => {
    await expect(querySummary.hydrated).toBeEmpty();
  });
});

test.describe('when search yields 27 products', () => {
  test.beforeEach(async ({querySummary}) => {
    await querySummary.load({}, 'fixed-number-of-products');
  });

  test('screen readers should read out', async ({querySummary}) => {
    const textRegex = /Products 1-27 of [\d,]+/;
    await expect(querySummary.ariaLive(textRegex)).toBeVisible();
  });
});

test.describe('when a query yield a single product', () => {
  test.beforeEach(async ({querySummary, searchBox}) => {
    await querySummary.load({}, 'with-search-box');
    await searchBox.hydrated.waitFor();
    await searchBox.searchInput.fill('@ec_product_id=SP03730_00007');
    await searchBox.submitButton.click();
  });

  test('should display message', async ({querySummary}) => {
    const textRegex = /^Product 1 of 1 for @ec_product_id=SP03730_00007$/;
    await expect(querySummary.text(textRegex)).toBeVisible();
  });

  test('screen readers should read out', async ({querySummary}) => {
    const textRegex = /^Product 1 of 1 for @ec_product_id=SP03730_00007$/;
    await expect(querySummary.ariaLive(textRegex)).toBeVisible();
  });
});
