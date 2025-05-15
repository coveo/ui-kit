import {testSearch, expect} from './fixture';
import {RecentQueriesListObject} from './pageObject';

const exampleQueries = ['homer', 'apu', 'homer'];

let test = testSearch;

async function assertRecentQueriesList(
  recentQueriesList: RecentQueriesListObject,
  expectedQueries: string[]
) {
  const recentQueriesListItems =
    await recentQueriesList.recentQueriesListItems.all();
  expect(recentQueriesListItems.length).toEqual(expectedQueries.length);

  expectedQueries.forEach(async (expectedQuery: string, index: number) => {
    // eslint-disable-next-line no-await-in-loop
    await expect(recentQueriesListItems[index]).toHaveText(expectedQuery);
  });
}

test.describe('quantic recent queries list', () => {
  test.describe('when the query is already in the recent queries list', () => {
    test('should set it as the first recent query and remove the previous one', async ({
      search,
      recentQueriesList,
    }) => {
      const firstSearchResponsePromise = search.waitForSearchResponse();
      await search.triggerSearchWithInput(exampleQueries[0]);
      await firstSearchResponsePromise;

      const secondSearchResponsePromise = search.waitForSearchResponse();
      await search.triggerSearchWithInput(exampleQueries[1]);
      await secondSearchResponsePromise;

      const thirdSearchResponsePromise = search.waitForSearchResponse();
      await search.triggerSearchWithInput(exampleQueries[0]);
      await thirdSearchResponsePromise;

      await assertRecentQueriesList(recentQueriesList, [
        exampleQueries[0],
        exampleQueries[1],
      ]);
    });
  });

  test.describe('when passing a query value as parameter in the URL', () => {
    test.use({
      urlHash: `q=${exampleQueries[0]}`,
    });

    test('should add the query to the recent queries list', async ({
      recentQueriesList,
    }) => {
      const firstRecentQuery =
        await recentQueriesList.recentQueriesListItems.first();
      const firstRecentQueryText = await firstRecentQuery.innerText();
      expect(firstRecentQueryText).toEqual(exampleQueries[0]);
    });
  });

  test.describe('when clicking on a recent query', () => {
    test('should trigger a search query, log the corresponding UA analytics events and set the query in the URL hash', async ({
      search,
      page,
      recentQueriesList,
    }) => {
      const searchResponsePromise = search.waitForSearchResponse();
      await search.triggerSearchWithInput(exampleQueries[0]);
      await searchResponsePromise;

      const recentQueryClickSearchResponsePromise =
        search.waitForSearchResponse();
      const uaRequestPromise =
        recentQueriesList.waitForRecentQueryClickAnalytics({
          queryText: exampleQueries[0],
        });

      const firstRecentQuery =
        await recentQueriesList.recentQueriesListItems.first();
      await firstRecentQuery.click();

      const searchResponse = await recentQueryClickSearchResponsePromise;
      await uaRequestPromise;

      const searchResponseBody = search.extractDataFromResponse(searchResponse);
      expect(searchResponseBody.q).toEqual(exampleQueries[0]);

      const urlHash = await page.url();
      expect(urlHash).toContain(`q=${exampleQueries[0]}`);
    });
  });
});
