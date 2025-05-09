import {CategoryFacetObject} from './pageObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {BaseFacetObject} from '../../../../../../playwright/page-object/baseFacetObject';
import facetData from './data';
import {facetBase} from '../../../../../../playwright/fixtures/baseFacetFixture';

const pageUrl = 's/quantic-category-facet';

interface FacetOptions {
  value?: string;
  caption?: string;
  withSearch?: boolean;
  numberOfValues?: number;
}

type QuanticFacetE2EFixtures = {
  facet: CategoryFacetObject;
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
    await page.goto(
      `${pageUrl}${options.caption ? '-with-captions' : ''}#${urlHash ? urlHash : ''}`
    );
    if (facetResponseMock) {
      await baseFacet.mockSearchWithFacetResponse(facetResponseMock);
    }
    configuration.configure(options);
    await baseFacet.waitForSearchResponse();

    await use(new CategoryFacetObject(page));
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
    await page.goto(`${pageUrl}${options.caption ? '-with-captions' : ''}`);
    if (facetResponseMock) {
      await baseFacet.mockSearchWithFacetResponse(facetResponseMock);
    }
    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup?.waitForInsightInterfaceInitialization();
    await baseFacet.performSearch();
    await baseFacet.waitForSearchResponse();
    await use(new CategoryFacetObject(page));
  },
});

export {expect} from '@playwright/test';
