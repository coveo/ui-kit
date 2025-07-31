import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class QueryErrorPageObject extends BasePageObject<'atomic-query-error'> {
  constructor(page: Page) {
    super(page, 'atomic-query-error');
  }

  get title() {
    return this.page.getByText('Something went wrong.', {exact: true});
  }

  get description() {
    return this.page.getByText(
      'If the problem persists contact the administrator.',
      {
        exact: true,
      }
    );
  }

  get infoButton() {
    return this.page.getByRole('button', {name: 'Learn more'});
  }
}
