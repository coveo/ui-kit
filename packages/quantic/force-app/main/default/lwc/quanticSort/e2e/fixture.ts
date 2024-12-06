import {SortObject} from './sortObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';

const pagerUrl = 's/quantic-sort';

interface SortOptions {}

type QuanticSortE2EFixtures = {
  sort: SortObject;
  sortCustom: SortObject;
  sortInvalid: SortObject;
  search: SearchObject;
  options: Partial<SortOptions>;
};

type QuanticSortE2ESearchFixtures = QuanticSortE2EFixtures & {
  urlHash: string;
};

type QuanticSortE2EInsightFixtures = QuanticSortE2ESearchFixtures & {
  insightSetup: InsightSetupObject;
};

export const testSearch = quanticBase.extend<QuanticSortE2ESearchFixtures>({
  options: {},
  urlHash: '',
  search: async ({page}, use) => {
    await use(new SearchObject(page, searchRequestRegex));
  },

  sort: async ({page, options, configuration, search, urlHash}, use) => {
    await page.goto(urlHash ? `${pagerUrl}#${urlHash}` : pagerUrl);
    configuration.configure(options);
    await search.waitForSearchResponse();
    await use(new SortObject(page));
  },

  sortCustom: async ({page, options, configuration, search, urlHash}, use) => {
    await page.goto(urlHash ? `${pagerUrl}#${urlHash}` : pagerUrl);
    await page.getByRole('button', {name: 'Add Custom Sort Options'}).click();
    configuration.configure(options);
    await search.waitForSearchResponse();
    await use(new SortObject(page));
  },

  sortInvalid: async ({page, options, configuration, search, urlHash}, use) => {
    await page.goto(urlHash ? `${pagerUrl}#${urlHash}` : pagerUrl);
    await page
      .getByRole('button', {name: 'Add Invalid Custom Sort Options'})
      .click();
    configuration.configure(options);
    await search.waitForSearchResponse();
    await use(new SortObject(page));
  },
});

export const testInsight = quanticBase.extend<QuanticSortE2EInsightFixtures>({
  options: {},
  search: async ({page}, use) => {
    await use(new SearchObject(page, insightSearchRequestRegex));
  },

  insightSetup: async ({page}, use) => {
    await use(new InsightSetupObject(page));
  },

  sort: async ({page, options, search, configuration, insightSetup}, use) => {
    await page.goto(pagerUrl);
    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup.waitForInsightInterfaceInitialization();
    await search.performSearch();
    await search.waitForSearchResponse();
    await use(new SortObject(page));
  },

  sortCustom: async (
    {page, options, search, configuration, insightSetup},
    use
  ) => {
    await page.goto(pagerUrl);
    await page.getByRole('button', {name: 'Add Custom Sort Options'}).click();
    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup.waitForInsightInterfaceInitialization();
    await search.performSearch();
    await search.waitForSearchResponse();
    await use(new SortObject(page));
  },

  sortInvalid: async (
    {page, options, search, configuration, insightSetup},
    use
  ) => {
    await page.goto(pagerUrl);
    await page
      .getByRole('button', {name: 'Add Invalid Custom Sort Options'})
      .click();
    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup.waitForInsightInterfaceInitialization();
    await search.performSearch();
    await search.waitForSearchResponse();
    await use(new SortObject(page));
  },
});

export {expect} from '@playwright/test';
