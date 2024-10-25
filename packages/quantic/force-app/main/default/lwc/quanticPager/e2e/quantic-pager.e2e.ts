import {Page} from '@playwright/test';
import {testSearch, testInsight, expect} from './fixture';
import {SearchObject} from '../../../../../../playwright/page-object/search-object';
import {
  useCaseTestCases,
  useCaseEnum,
} from '../../../../../../playwright/utils/use-case';
import {InsightObject} from '../../../../../../playwright/page-object/insight-object';
import {ConfigurationObject} from '../../../../../../playwright/page-object/configuration-object';

interface PageObjects {
  configuration: ConfigurationObject;
  search: SearchObject;
  insight?: InsightObject;
}

interface PagerOptions {
  useCase: string;
  numberOfPages: number;
}

async function visitPage(
  page: Page,
  {search, insight, configuration}: PageObjects,
  options: Partial<PagerOptions> = {}
) {
  const pageUrl = 's/quantic-pager';
  await page.goto(pageUrl);
  configuration.configure(options);
  if (options.useCase === useCaseEnum.insight) {
    await insight?.waitForInsightInterfaceInitialization();
    await search.interceptSearchAndLimitResultPages(5);
    await search.performSearch();
    await search.waitForSearchResponse();
  } else {
    await search.interceptSearchAndLimitResultPages(5);
    await search.waitForSearchResponse();
  }
}

async function visitPageAndloadOptionsFromUrl(
  page: Page,
  {search, configuration}: PageObjects,
  urlHash: string
) {
  const pageUrl = 's/quantic-pager';
  await page.goto(`${pageUrl}#${urlHash}`);
  await search.interceptSearchAndLimitResultPages(5);
  configuration.configure();
}

async function setupWithPauseBeforeSearch(
  page: Page,
  {search, insight, configuration}: PageObjects,
  options: Partial<PagerOptions> = {}
) {
  const pageUrl = 's/quantic-pager';
  await page.goto(pageUrl);

  if (options.useCase === useCaseEnum.insight) {
    configuration.configure(options);
    await insight?.waitForInsightInterfaceInitialization();
    const stalledRequest = search.interceptSearchIndefinitely();
    await search.performSearch();
    return stalledRequest;
  } else {
    const stalledRequest = search.interceptSearchIndefinitely();
    configuration.configure(options);
    return stalledRequest;
  }
}

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic pager ${useCase.label}`, () => {
    test.beforeEach(async ({page, search, insight, configuration}) => {
      await visitPage(
        page,
        {search, insight, configuration},
        {useCase: useCase.value}
      );
    });

    test.describe('when the page is loading ${useCase.label', () => {
      test('should display the pager only after the search request is completed', async ({
        page,
        search,
        insight,
        pager,
        configuration,
      }) => {
        const resumeSearchRequest = await setupWithPauseBeforeSearch(
          page,
          {search, insight, configuration},
          {useCase: useCase.value}
        );

        await expect(pager.previousPageButton).not.toBeVisible();
        await expect(pager.nextPageButton).not.toBeVisible();
        await expect(pager.pageButtons).not.toBeVisible();

        resumeSearchRequest();

        await expect(pager.previousPageButton).toBeVisible();
        await expect(pager.nextPageButton).toBeVisible();
        await expect(pager.pageButtons).not.toBeNull();
      });
    });

    test.describe('when being in the first page', () => {
      test('should disable the previous page button', async ({pager}) => {
        await expect(pager.pageButtons.nth(0)).toHaveAttribute(
          'aria-pressed',
          'true'
        );
        await expect(pager.previousPageButton).toBeDisabled();
      });
    });

    test.describe('when being in the last page', () => {
      test.beforeEach(async ({pager, search}) => {
        await pager.goToLastPage();
        await search.waitForSearchResponse();
      });

      test('should disable the next page button', async ({pager}) => {
        await expect(pager.pageButtons.nth(-1)).toHaveAttribute(
          'aria-pressed',
          'true'
        );
        await expect(pager.nextPageButton).toBeDisabled();
      });
    });

    test.describe('when clicking the next page button', () => {
      test('should trigger a new search and log analytics', async ({
        pager,
        search,
      }) => {
        await pager.clickNextPageButton();
        await search.waitForSearchResponse();
        await pager.waitForPagerUaAnalytics('pagerNext');
      });
    });

    test.describe('when clicking the previous page button', () => {
      test('should trigger a new search and log analytics', async ({
        pager,
        search,
      }) => {
        await pager.clickNextPageButton();
        await search.waitForSearchResponse();

        await pager.clickPreviousPageButton();
        await search.waitForSearchResponse();
        await pager.waitForPagerUaAnalytics('pagerPrevious');
      });
    });

    test.describe('when clicking a specific page button', () => {
      test('should trigger a new search and log analytics', async ({
        pager,
        search,
      }) => {
        await pager.clickPageNumberButton(2);
        await search.waitForSearchResponse();
        await pager.waitForPagerUaAnalytics('pagerNumber');
      });
    });

    test.describe('when a new search is made', () => {
      test('should select the first page', async ({pager, search}) => {
        await pager.clickNextPageButton();
        await search.waitForSearchResponse();

        await expect(pager.previousPageButton).not.toBeDisabled();
        await search.performSearch();
        const searchResponse = await search.waitForSearchResponse();
        const {firstResult} = await searchResponse.request().postDataJSON();

        const expectedPage = 0;
        await expect(pager.pageButtons.nth(expectedPage)).toHaveAttribute(
          'aria-pressed',
          'true'
        );
        expect(firstResult).toBe(0);
      });
    });

    if (useCase.value === 'search') {
      test.describe('when loading optins from the url', () => {
        test('should reflect the options of url in the component', async ({
          page,
          pager,
          search,
          configuration,
        }) => {
          await visitPageAndloadOptionsFromUrl(
            page,
            {search, configuration},
            'firstResult=30'
          );

          const expectedPage = 3;
          await expect(pager.pageButtons.nth(expectedPage)).toHaveAttribute(
            'aria-pressed',
            'true'
          );
        });
      });
    }
  });
});
