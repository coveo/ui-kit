import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class AtomicCommerceRecsListPageObject extends BasePageObject<'atomic-recs-list'> {
  constructor(page: Page) {
    super(page, 'atomic-recs-list');
  }

  get placeholder() {
    return this.page.locator('.placeholder');
  }

  get recommendation() {
    return this.page.locator(
      '[part="result-list-grid-clickable-container outline"]'
    );
  }

  get indicators() {
    return this.page.getByRole('listitem');
  }

  get nextButton() {
    return this.page.getByLabel('Next');
  }

  get prevButton() {
    return this.page.getByLabel('Previous');
  }

  async noRecommendations() {
    await this.page.route(
      '**/search/v2?organizationId=searchuisamples',
      async (route) => {
        const response = await route.fetch();
        const body = await response.json();
        body.results = [];
        await route.fulfill({
          response,
          json: body,
        });
      }
    );

    return this;
  }
}
