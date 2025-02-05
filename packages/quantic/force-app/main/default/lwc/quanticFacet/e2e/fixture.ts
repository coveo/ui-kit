import {FacetObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';

const pageUrl = 's/quantic-facet';

interface FacetOptions {
  // TODO: Add options
}

type QuanticFacetE2EFixtures = {
  facet: FacetObject;
  search: SearchObject;
  options: Partial<FacetOptions>;
};

type QuanticFacetE2ESearchFixtures = QuanticFacetE2EFixtures & {
  urlHash: string;
};

type QuanticFacetE2EInsightFixtures = QuanticFacetE2ESearchFixtures & {
  insightSetup: InsightSetupObject;
};

export const testSearch = quanticBase.extend<QuanticFacetE2ESearchFixtures>({
  options: {},
  search: async ({page}, use) => {
    await use(new SearchObject(page, searchRequestRegex));
  },
  facet: async ({page, options, configuration, search, urlHash}, use) => {
    await page.goto(urlHash ? `${pageUrl}#${urlHash}` : pageUrl);
    configuration.configure(options);
    await search.waitForSearchResponse();

    await use(new FacetObject(page));
  },
});

export const testInsight = quanticBase.extend<QuanticFacetE2EInsightFixtures>({
  options: {},
  search: async ({page}, use) => {
    await use(new SearchObject(page, insightSearchRequestRegex));
  },
  insightSetup: async ({page}, use) => {
    await use(new InsightSetupObject(page));
  },
  facet: async ({page, options, search, configuration, insightSetup}, use) => {
    await page.goto(pageUrl);
    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup.waitForInsightInterfaceInitialization();
    await search.performSearch();
    await search.waitForSearchResponse();
    await use(new FacetObject(page));
  },
});

export {expect} from '@playwright/test';
