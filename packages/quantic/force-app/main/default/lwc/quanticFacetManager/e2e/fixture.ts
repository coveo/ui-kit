import {FacetManagerObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';

const pageUrl = 's/quantic-facet-manager';

interface FacetManagerOptions {}

type QuanticFacetManagerE2ESearchFixtures = {
  facetManager: FacetManagerObject;
  search: SearchObject;
  options: Partial<FacetManagerOptions>;
};

type QuanticFacetManagerE2EInsightFixtures =
  QuanticFacetManagerE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  quanticBase.extend<QuanticFacetManagerE2ESearchFixtures>({
    options: {},
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    facetManager: async ({page, options, configuration, search}, use) => {
      await page.goto(pageUrl);
      configuration.configure(options);
      await search.waitForSearchResponse();

      await use(new FacetManagerObject(page));
    },
  });

export const testInsight =
  quanticBase.extend<QuanticFacetManagerE2EInsightFixtures>({
    options: {},
    search: async ({page}, use) => {
      await use(new SearchObject(page, insightSearchRequestRegex));
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    facetManager: async (
      {page, options, search, configuration, insightSetup},
      use
    ) => {
      await page.goto(pageUrl);
      configuration.configure({...options, useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      const searchResponsePromise = search.waitForSearchResponse();
      await search.performSearch();
      await searchResponsePromise;
      await use(new FacetManagerObject(page));
    },
  });

export {expect} from '@playwright/test';