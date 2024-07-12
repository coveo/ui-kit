import {Page, test as base} from '@playwright/test';
import {KnownErrorType} from '../../../../../dist/types/components/common/query-error/known-error-types';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../playwright-utils/base-fixture';
import {SearchBoxPageObject as SearchBox} from '../../atomic-commerce-search-box/e2e/page-object';
import {QueryErrorPageObject as QueryError} from './page-object';

type MyFixtures = {
  searchBox: SearchBox;
  queryError: QueryError;
};

export async function triggerError(
  page: Page,
  errorType: KnownErrorType | 'ClientError' = 'ClientError'
) {
  await page.route('**/v2/search', async (route) => {
    await route.fulfill({
      status: 418,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: false,
        status: 418,
        message: 'Something very weird just happened',
        statusCode: 418,
        type: errorType,
      }),
    });
  });
}
export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  searchBox: async ({page}, use) => {
    await use(new SearchBox(page));
  },
  queryError: async ({page}, use) => {
    await use(new QueryError(page));
  },
});
export {expect} from '@playwright/test';
