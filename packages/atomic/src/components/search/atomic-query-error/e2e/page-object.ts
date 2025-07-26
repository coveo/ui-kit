import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class QueryErrorPageObject extends BasePageObject<'atomic-query-error'> {
  constructor(page: Page) {
    super(page, 'atomic-query-error');
  }

  get title() {
    return this.page.getByText(
      'Your organization searchuisamples cannot be accessed.',
      {exact: true}
    );
  }

  get description() {
    return this.page.getByText('Ensure that the token is valid.', {
      exact: true,
    });
  }

  get docLink() {
    return this.page.getByText('Coveo Online Help');
  }

  with419Error() {
    return this.page.route(
      'https://searchuisamples.org.coveo.com/rest/search/v2?organizationId=searchuisamples',
      async (route, request) => {
        if (request.method() === 'POST') {
          await route.fulfill({
            status: 419,
            contentType: 'application/json',
            body: JSON.stringify({
              message: 'Expired token',
              statusCode: 419,
              type: 'ExpiredTokenException',
            }),
          });
        } else {
          await route.continue();
        }
      }
    );
  }

  get title419() {
    return this.page.getByText('Something went wrong.', {exact: true});
  }

  get description419() {
    return this.page.getByText(
      'If the problem persists contact the administrator.',
      {exact: true}
    );
  }

  get infoButton() {
    return this.page.getByRole('button', {name: 'Learn more'});
  }
}
