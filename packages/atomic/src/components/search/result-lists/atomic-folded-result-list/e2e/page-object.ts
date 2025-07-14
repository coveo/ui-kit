import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class AtomicFoldedResultListPageObject extends BasePageObject<'atomic-folded-result-list'> {
  constructor(page: Page) {
    super(page, 'atomic-folded-result-list');
  }

  get noResultsLabel() {
    return this.page.locator('[part="no-result-root"]');
  }

  get loadAllResultsButton() {
    return this.page.getByRole('button', {name: 'Load all results'});
  }

  get collapseResultsButton() {
    return this.page.getByRole('button', {name: 'Collapse results'});
  }

  get resultChildren() {
    return this.page.locator('[part="children-root"]');
  }

  async withATotalNumberOfChildResults(total: number) {
    await this.page.route(
      '**/search/v2?organizationId=searchuisamples',
      async (route) => {
        const response = await route.fetch();
        const body = await response.json();
        body.results[0].totalNumberOfChildResults = total;

        await route.fulfill({
          response,
          json: body,
        });
      }
    );
  }
}
