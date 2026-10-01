import {expect, test} from './fixtures.js';

test('search page replaces only the search box', async ({page}) => {
  await page.goto('/search.html');

  await expect(page.locator('hybrid-search-box')).toBeVisible();
  // The point of the sample: the Atomic search box is gone, everything else stays.
  await expect(page.locator('atomic-commerce-search-box')).toHaveCount(0);
  await expect(page.locator('atomic-commerce-facets')).toBeVisible();
  await expect(page.locator('atomic-commerce-product-list')).toBeVisible();
  await expect(page.locator('atomic-commerce-pager')).toBeVisible();
  await expect(page.locator('atomic-commerce-sort-dropdown')).toBeVisible();
});

test('custom search box groups suggestions, filter suggestions, and instant products', async ({
  page,
}) => {
  await page.goto('/search.html');

  const input = page.getByRole('combobox', {name: 'Search products'});
  await expect(input).toBeEnabled();
  await input.fill('sh');

  const listbox = page.getByRole('listbox', {name: 'Search suggestions'});
  await expect(listbox).toBeVisible();

  await expect(listbox.getByRole('group', {name: 'Suggestions'})).toBeVisible();
  // Filter suggestions have no equivalent in atomic-commerce-search-box; they are
  // the capability that justifies the replacement.
  await expect(listbox.getByRole('group', {name: 'Brand'})).toBeVisible();
  await expect(listbox.getByRole('group', {name: 'Color'})).toBeVisible();

  await expect(page.getByRole('heading', {name: 'Top products'})).toBeVisible();
});

test('submitting from the custom box drives the Atomic components and the URL', async ({page}) => {
  await page.goto('/search.html');

  const input = page.getByRole('combobox', {name: 'Search products'});
  await expect(input).toBeEnabled();

  const productList = page.locator('atomic-commerce-product-list');
  await expect(productList).toBeVisible();

  await input.fill('shoes');
  await input.press('Enter');

  // The engine is the only thing connecting the two: a query dispatched by the
  // custom box must reach the Atomic product list and the interface's URL manager.
  await expect(page.locator('atomic-commerce-query-summary')).toContainText(/shoes/i);
  await expect(page).toHaveURL(/#.*q=shoes/);
});

test('keyboard navigation moves through the suggestion list', async ({page}) => {
  await page.goto('/search.html');

  const input = page.getByRole('combobox', {name: 'Search products'});
  await expect(input).toBeEnabled();
  await input.fill('sh');

  await expect(page.getByRole('listbox', {name: 'Search suggestions'})).toBeVisible();
  await expect(input).toHaveAttribute('aria-expanded', 'true');

  await input.press('ArrowDown');
  const activeId = await input.getAttribute('aria-activedescendant');
  expect(activeId).toBeTruthy();
  await expect(page.locator(`#${activeId}`)).toHaveAttribute('aria-selected', 'true');

  await input.press('Escape');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('home page redirects to the search page with the query applied', async ({page}) => {
  await page.goto('/index.html');

  const recommendationLists = page.locator('atomic-commerce-recommendation-list');
  await expect(recommendationLists).toHaveCount(2);

  const input = page.getByRole('combobox', {name: 'Search products'});
  await expect(input).toBeEnabled();
  await input.fill('shoes');
  await input.press('Enter');

  await page.waitForURL(/search\.html/);
  // Proves the sample holds up its half of the standalone handoff: the destination
  // interface reads the stored query out of local storage on first request.
  await expect(page.locator('atomic-commerce-query-summary')).toContainText(/shoes/i);
});

test('pants listing stays fully standard Atomic', async ({page}) => {
  await page.goto('/listing-pants.html');

  await expect(page.locator('atomic-commerce-search-box')).toBeVisible();
  await expect(page.locator('hybrid-search-box')).toHaveCount(0);
  await expect(page.locator('atomic-commerce-product-list')).toBeVisible();
  await expect(page.locator('atomic-commerce-facets')).toBeVisible();
});

test('toys listing opens the untouched Atomic facets inside a custom modal', async ({page}) => {
  await page.goto('/listing-toys.html');

  await expect(page.locator('atomic-commerce-product-list')).toBeVisible();

  const dialog = page.getByRole('dialog', {name: 'Filters'});
  await expect(dialog).toBeHidden();

  await page.getByRole('button', {name: 'Filters'}).click();

  await expect(dialog).toBeVisible();
  // The Atomic component is composed around, not replaced: it still generates its
  // own facet components from the response while sitting inside the dialog.
  await expect(dialog.locator('atomic-commerce-facets')).toBeVisible();
  await expect(dialog.locator('atomic-commerce-facet').first()).toBeVisible();

  await page.getByRole('button', {name: 'Done'}).click();
  await expect(dialog).toBeHidden();
});
