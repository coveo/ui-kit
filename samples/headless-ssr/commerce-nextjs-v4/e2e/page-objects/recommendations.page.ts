import type {Page} from '@playwright/test';

export type RecommendationSlot = 'popularBought' | 'popularViewed' | 'viewedTogether';

export class RecommendationsPageObject {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  slot(name: RecommendationSlot) {
    return this.page.getByTestId(`recommendations-${name}`);
  }

  products(name: RecommendationSlot) {
    return this.slot(name).locator('li');
  }
}
