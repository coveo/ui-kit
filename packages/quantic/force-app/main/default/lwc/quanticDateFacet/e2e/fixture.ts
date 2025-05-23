import {DateFacetObject} from './pageObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {BaseFacetObject} from '../../../../../../playwright/page-object/baseFacetObject';
import {facetBase} from '../../../../../../playwright/fixtures/baseFacetFixture';
import facetData from './data';

const pageUrl = 's/quantic-date-facet';

interface FacetOptions {}

type QuanticFacetE2EFixtures = {
  facet: DateFacetObject;
  options: Partial<FacetOptions>;
  insightSetup?: InsightSetupObject;
};

export const testSearch = facetBase.extend<QuanticFacetE2EFixtures>({
  options: {},
  facetResponseMock: [facetData],
  baseFacet: async ({page}, use) => {
    await use(new BaseFacetObject(page, searchRequestRegex));
  },
  facet: async (
    {page, options, configuration, baseFacet, urlHash, facetResponseMock},
    use
  ) => {
    await page.goto(`${pageUrl}#${urlHash ? urlHash : ''}`);
    if (facetResponseMock) {
      await baseFacet.mockSearchWithFacetResponse(facetResponseMock);
    }
    configuration.configure(options);
    await baseFacet.waitForSearchResponse();

    await use(new DateFacetObject(page));
  },
});

export const testInsight = facetBase.extend<QuanticFacetE2EFixtures>({
  options: {},
  facetResponseMock: [facetData],
  baseFacet: async ({page}, use) => {
    await use(new BaseFacetObject(page, insightSearchRequestRegex));
  },
  insightSetup: async ({page}, use) => {
    await use(new InsightSetupObject(page));
  },
  facet: async (
    {page, options, baseFacet, configuration, insightSetup, facetResponseMock},
    use
  ) => {
    await page.goto(pageUrl);
    if (facetResponseMock) {
      await baseFacet.mockSearchWithFacetResponse(facetResponseMock);
    }
    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup?.waitForInsightInterfaceInitialization();
    await baseFacet.performSearch();
    await baseFacet.waitForSearchResponse();
    await use(new DateFacetObject(page));
  },
});

export {expect} from '@playwright/test';
