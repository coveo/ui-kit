import {FacetObject} from './pageObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {BaseFacetObject} from '../../../../../../playwright/page-object/baseFacetObject';
import facetData from './data';
import {facetBase} from '../../../../../../playwright/fixtures/baseFacetFixture';

const pageUrl = 's/quantic-facet';

interface FacetOptions {
  value?: string;
  caption?: string;
}

type QuanticFacetE2EFixtures = {
  facet: FacetObject;
  options: Partial<FacetOptions>;
  urlHash?: string;
  insightSetup?: InsightSetupObject;
  preventMockFacetResponse?: boolean;
};

export const testSearch = facetBase.extend<QuanticFacetE2EFixtures>({
  options: {},
  urlHash: '',
  preventMockFacetResponse: false,
  baseFacet: async ({page}, use) => {
    await use(new BaseFacetObject(page, searchRequestRegex));
  },
  facet: async (
    {
      page,
      options,
      configuration,
      baseFacet,
      urlHash,
      preventMockFacetResponse,
    },
    use
  ) => {
    await page.goto(
      `${pageUrl}${options.caption ? '-with-captions' : ''}#${urlHash ? urlHash : ''}`
    );
    if (!preventMockFacetResponse) {
      await baseFacet.mockSearchWithFacetResponse([facetData]);
    }
    configuration.configure(options);
    await baseFacet.waitForSearchResponse();

    await use(new FacetObject(page));
  },
});

export const testInsight = facetBase.extend<QuanticFacetE2EFixtures>({
  options: {},
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
    await page.goto(`${pageUrl}${options.caption ? '-with-captions' : ''}`);
    await baseFacet.mockSearchWithFacetResponse([facetData]);
    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup?.waitForInsightInterfaceInitialization();
    await baseFacet.performSearch();
    await baseFacet.waitForSearchResponse();
    await use(new FacetObject(page));
  },
});

export {expect} from '@playwright/test';
