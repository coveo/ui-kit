import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

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

  get keywordsHighlight() {
    return this.page.getByText('Keywords highlight');
  }

  get toggleKeywordNavigationButton() {
    return this.page.getByLabel('Toggle keywords navigation');
  }
}
