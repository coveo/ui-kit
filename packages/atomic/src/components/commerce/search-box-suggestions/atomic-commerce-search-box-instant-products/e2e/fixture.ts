import {Page, test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../../playwright-utils/base-fixture';
import {SearchBoxPageObject} from '../../../atomic-commerce-search-box/e2e/page-object';
import {InstantProductPageObject} from './page-object';

type MyFixtures = {
  searchBox: SearchBoxPageObject;
  instantProduct: InstantProductPageObject;
};

// export async function setRecentQueries(page: Page, count: number) {
//   await page.evaluate((count: number) => {
//     const recentQueries = Array.from(
//       {length: count},
//       (_, i) => `Recent query ${i}`
//     );
//     const stringified = JSON.stringify(recentQueries);
//     localStorage.setItem('coveo-recent-queries', stringified);
//   }, count);
// }

// export async function setSuggestions(page: Page, numberOfSuggestions: number) {
//   await page.route('**/v2/search/querySuggest', async (route) => {
//     const completions = Array.from({length: numberOfSuggestions}, (_, i) => ({
//       expression: `query-suggestion-${i}`,
//       highlighted: `query-suggestion-${i}`,
//     }));

//     await route.fulfill({
//       status: 200,
//       contentType: 'application/json',
//       body: JSON.stringify({completions}),
//     });
//   });
// }

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  InstantProduct: async ({page}, use) => {
    await use(new InstantProductPageObject(page));
  },
  searchBox: async ({page}, use) => {
    await use(new SearchBoxPageObject(page));
  },
});

export {expect} from '@playwright/test';
