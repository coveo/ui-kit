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

type QuanticFacetManagerE2EFixtures = {
  facetManager: FacetManagerObject;
  search: SearchObject;
  options: Partial<FacetManagerOptions>;
};

type QuanticFacetManagerE2ESearchFixtures = QuanticFacetManagerE2EFixtures & {
  urlHash: string;
};

type QuanticFacetManagerE2EInsightFixtures =
  QuanticFacetManagerE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  quanticBase.extend<QuanticFacetManagerE2ESearchFixtures>({
    options: {},
    urlHash: '',
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    facetManager: async (
      {page, options, configuration, search, urlHash},
      use
    ) => {
      await page.goto(urlHash ? `${pageUrl}#${urlHash}` : pageUrl);
      configuration.configure(options);
      await search.waitForSearchResponse();

      await use(new FacetManagerObject(page));
    },
  });

export const testInsight =
  quanticBase.extend<QuanticFacetManagerE2EInsightFixtures>({
    options: {},
    urlHash: '',
    search: async ({page}, use) => {
      await use(new SearchObject(page, insightSearchRequestRegex));
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    facetManager: async (
      {page, options, search, configuration, insightSetup, urlHash},
      use
    ) => {
      await page.goto(urlHash ? `${pageUrl}#${urlHash}` : pageUrl);
      configuration.configure({...options, useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      await search.performSearch();
      await search.waitForSearchResponse();
      await use(new FacetManagerObject(page));
    },
  });

export {expect} from '@playwright/test';
