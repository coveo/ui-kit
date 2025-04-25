import {TimeframeFacetObject} from './pageObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {BaseFacetObject} from '../../../../../../playwright/page-object/baseFacetObject';
import {facetBase} from '../../../../../../playwright/fixtures/baseFacetFixture';

const pageUrl = 's/quantic-timeframe-facet';

interface FacetOptions {
  withDatePicker?: boolean;
}

type QuanticFacetE2EFixtures = {
  facet: TimeframeFacetObject;
  options: Partial<FacetOptions>;
  insightSetup?: InsightSetupObject;
};

export const testSearch = facetBase.extend<QuanticFacetE2EFixtures>({
  options: {withDatePicker: true},
  baseFacet: async ({page}, use) => {
    await use(new BaseFacetObject(page, searchRequestRegex));
  },
  facet: async ({page, options, configuration, baseFacet, urlHash}, use) => {
    await page.goto(`${pageUrl}#${urlHash ? urlHash : ''}`);
    configuration.configure(options);
    await baseFacet.waitForSearchResponse();

    await use(new TimeframeFacetObject(page));
  },
});

export const testInsight = facetBase.extend<QuanticFacetE2EFixtures>({
  options: {withDatePicker: true},
  baseFacet: async ({page}, use) => {
    await use(new BaseFacetObject(page, insightSearchRequestRegex));
  },
  insightSetup: async ({page}, use) => {
    await use(new InsightSetupObject(page));
  },
  facet: async (
    {page, options, baseFacet, configuration, insightSetup},
    use
  ) => {
    await page.goto(pageUrl);
    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup?.waitForInsightInterfaceInitialization();
    await baseFacet.performSearch();
    await baseFacet.waitForSearchResponse();
    await use(new TimeframeFacetObject(page));
  },
});

export {expect} from '@playwright/test';
