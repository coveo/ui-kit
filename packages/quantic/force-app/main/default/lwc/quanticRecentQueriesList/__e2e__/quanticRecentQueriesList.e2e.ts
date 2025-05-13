import {testSearch, expect} from './fixture';

const exampleQueries = ['gandalf', 'gollum', 'sauron'];

let test = testSearch;

async function triggerSearchWithInput(search, query) {
  const searchResponsePromise = search.waitForSearchResponse();
  await search.fillSearchInput(query);
  await search.performSearch();
  await searchResponsePromise;
}

async function assertRecentQueriesList(recentQueriesList, expectedQueries) {
  const recentQueriesListItems =
    await recentQueriesList.recentQueriesListItems.all();
  expect(recentQueriesListItems.length).toEqual(expectedQueries.length);

  for (let i = 0; i < expectedQueries.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const queryText = await recentQueriesListItems[i].innerText();
    expect(queryText).toEqual(expectedQueries[i]);
  }
}

test.describe(`quantic recent queries list`, () => {
  test.describe('when making search queries', () => {
    test.use({
      options: {
        maxLength: 2,
      },
    });
    test('should add the query to the recent queries list', async ({
      search,
      recentQueriesList,
    }) => {
      await triggerSearchWithInput(search, exampleQueries[0]);

      const firstRecentQuery =
        await recentQueriesList.recentQueriesListItems.first();
      const firstRecentQueryText = await firstRecentQuery.innerText();
      expect(firstRecentQueryText).toEqual(exampleQueries[0]);
    });

    test('should not display more recent queries than the max length and should display the most recent queries', async ({
      search,
      recentQueriesList,
    }) => {
      await triggerSearchWithInput(search, exampleQueries[0]);
      await assertRecentQueriesList(recentQueriesList, [exampleQueries[0]]);
      await triggerSearchWithInput(search, exampleQueries[1]);
      await assertRecentQueriesList(recentQueriesList, [
        exampleQueries[1],
        exampleQueries[0],
      ]);
      await triggerSearchWithInput(search, exampleQueries[2]);

      await assertRecentQueriesList(recentQueriesList, [
        exampleQueries[2],
        exampleQueries[1],
      ]);
    });

    test.describe('when the query is already in the recent queries list', () => {
      test('should set it as the first recent query and remove the previous one', async ({
        search,
        recentQueriesList,
      }) => {
        await triggerSearchWithInput(search, exampleQueries[0]);
        await assertRecentQueriesList(recentQueriesList, [exampleQueries[0]]);

        await triggerSearchWithInput(search, exampleQueries[1]);
        await assertRecentQueriesList(recentQueriesList, [
          exampleQueries[1],
          exampleQueries[0],
        ]);

        await triggerSearchWithInput(search, exampleQueries[0]);
        await assertRecentQueriesList(recentQueriesList, [
          exampleQueries[0],
          exampleQueries[1],
        ]);
      });
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
      await triggerSearchWithInput(search, exampleQueries[0]);

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
