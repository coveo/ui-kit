import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class AtomicQuickviewLocators extends BasePageObject<'atomic-quickview'> {
  constructor(page: Page) {
    super(page, 'atomic-quickview');
  }

  get resultButton() {
    return this.page.getByRole('button', {name: 'Quick View'});
  }

  get modal() {
    return this.page.getByRole('dialog');
  }

  get modalContainer() {
    return this.modal.locator('article');
  }

  get keywordsHighlight() {
    return this.page.getByText('Keywords highlight');
  }

  get keywordNavigatorNext() {
    return this.page.getByLabel('Next').first();
  }

  get keywordNavigatorPrevious() {
    return this.page.getByLabel('Previous').first();
  }

  get removeHighlights() {
    return this.page.getByLabel('Remove highlights').first();
  }

  get header() {
    return this.modal.locator('[part="header"]');
  }

  get titleLink() {
    return this.page.getByRole('link');
  }

  get closeButton() {
    return this.page.getByLabel('Close');
  }

  get pagerSummary() {
    return this.page.getByText('Result 1 of');
  }

  get nextQuickviewButton() {
    return this.page.getByRole('button', {name: 'Next quickview'});
  }

  get previousQuickviewButton() {
    return this.page.getByRole('button', {name: 'Previous quickview'});
  }

  get toggleKeywordNavigationButton() {
    return this.page.getByLabel('Toggle keywords navigation');
  }
}
