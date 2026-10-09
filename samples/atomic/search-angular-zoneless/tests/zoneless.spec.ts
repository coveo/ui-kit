import {expect, test} from '@playwright/test';

const pages = [
  {name: '@coveo/atomic-angular wrapper', path: '/wrapper'},
  {name: 'Atomic custom elements', path: '/custom-elements'},
];

test.use({viewport: {width: 1600, height: 1200}});

for (const {name, path} of pages) {
  test.describe(`${name} without zone.js`, () => {
    test.beforeEach(async ({page}) => {
      await page.goto(path);
      await expect(page.getByTestId('zone-status')).toHaveText('zone.js loaded: no');
    });

    test('renders the first search results', async ({page}) => {
      await expect(page.locator('atomic-query-summary')).toContainText(/Results 1-10 of [\d,]+/);
      await expect(page.locator('atomic-result-list atomic-result').first()).toBeVisible();
      await expect(page.getByTestId('total-results')).toHaveText(/^[1-9]\d*$/);
    });

    test('updates on user interaction', async ({page}) => {
      await expect(page.getByTestId('total-results')).toHaveText(/^[1-9]\d*$/);
      const initialTotal = await page.getByTestId('total-results').textContent();

      const textArea = page.locator('atomic-search-box textarea[part="textarea"]');
      await textArea.fill('test');
      await textArea.press('Enter');

      await expect(page.locator('atomic-query-summary')).toContainText('for test');
      await expect(page.getByTestId('total-results')).not.toHaveText(initialTotal!);
    });

    test('reflects input changes', async ({page}) => {
      const querySummary = page.locator('atomic-query-summary');
      await expect(querySummary).toContainText('Results 1-10');

      await page.getByTestId('toggle-language').click();
      await expect(querySummary).toContainText('Résultats 1-10');

      const authorFacet = page.locator('atomic-facet[field="author"]');
      await expect(authorFacet).toContainText('Authors');
      await page.getByTestId('toggle-facet-label').click();
      await expect(authorFacet).toContainText('Writers');
    });

    test('notifies Angular of Atomic events', async ({page}) => {
      await expect(page.getByTestId('total-results')).toHaveText(/^[1-9]\d*$/);

      await page.getByTestId('toggle-mobile-breakpoint').click();

      await expect(page.locator('atomic-search-layout')).toHaveAttribute(
        'mobile-breakpoint',
        '800px'
      );
      await expect(page.getByTestId('breakpoint-from-listener')).toHaveText('800px');
      await expect(page.getByTestId('breakpoint-from-observable')).toHaveText('800px');
    });
  });
}
