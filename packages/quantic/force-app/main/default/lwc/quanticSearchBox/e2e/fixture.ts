import {SearchBoxObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {AnalyticsModeEnum} from '../../../../../../playwright/utils/analyticsMode';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';

const pageUrl = 's/quantic-search-box';

interface SearchBoxOptions {
  engineId: string;
  placeholder: string;
  withoutSubmitButton: boolean;
  numberOfSuggestions: number;
  textArea: boolean;
  disableRecentQueries: boolean;
  keepFiltersOnSearch: boolean;
}

type QuanticSearchBoxE2EFixtures = {
  searchBox: SearchBoxObject;
  search: SearchObject;
  options: Partial<SearchBoxOptions>;
};

type QuanticSearchBoxE2ESearchFixtures = QuanticSearchBoxE2EFixtures & {
  urlHash: string;
};

type QuanticSearchBoxE2EInsightFixtures = QuanticSearchBoxE2ESearchFixtures & {
  insightSetup: InsightSetupObject;
};

export const testSearch = quanticBase.extend<QuanticSearchBoxE2ESearchFixtures>({
  options: {},
  pageUrl: pageUrl,
  urlHash: '',
  analyticsMode: AnalyticsModeEnum.legacy,
  search: async ({page}, use) => {
    await use(new SearchObject(page, searchRequestRegex));
  },
  searchBox: async (
    {page, options, configuration, search, urlHash, analytics},
    use
  ) => {
    await page.goto(urlHash ? `${pageUrl}#${urlHash}` : pageUrl);
    const searchResponsePromise = search.waitForSearchResponse();
    await configuration.configure(options);
    await searchResponsePromise;

    await use(new SearchBoxObject(page, analytics));
  },
});

export const testInsight = quanticBase.extend<QuanticSearchBoxE2EInsightFixtures>({
  pageUrl: pageUrl,
  options: {},
  analyticsMode: AnalyticsModeEnum.legacy,
  search: async ({page}, use) => {
    await use(new SearchObject(page, insightSearchRequestRegex));
  },
  insightSetup: async ({page}, use) => {
    await use(new InsightSetupObject(page));
  },
  searchBox: async (
    {page, options, search, configuration, insightSetup, analytics},
    use
  ) => {
    await page.goto(pageUrl);
    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup.waitForInsightInterfaceInitialization();
    const searchResponsePromise = search.waitForSearchResponse();
    await search.performSearch();
    await searchResponsePromise;
    await use(new SearchBoxObject(page, analytics));
  },
});

export {expect} from '@playwright/test';
