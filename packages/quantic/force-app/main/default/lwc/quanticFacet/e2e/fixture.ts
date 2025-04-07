import {FacetObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {SearchObjectWithFacet} from '../../../../../../playwright/page-object/searchObjectWithFacets';
import facetData from './data';

const pageUrl = 's/quantic-facet';

interface FacetOptions {
  value?: string;
  caption?: string;
}

type QuanticFacetE2EFixtures = {
  facet: FacetObject;
  search: SearchObjectWithFacet;
  options: Partial<FacetOptions>;
  urlHash?: string;
  insightSetup?: InsightSetupObject;
  preventMockFacetResponse?: boolean;
};

export const testSearch = quanticBase.extend<QuanticFacetE2EFixtures>({
  options: {},
  urlHash: '',
  preventMockFacetResponse: false,
  search: async ({page}, use) => {
    await use(new SearchObjectWithFacet(page, searchRequestRegex));
  },
  facet: async (
    {page, options, configuration, search, urlHash, preventMockFacetResponse},
    use
  ) => {
    await page.goto(
      `${pageUrl}${options.caption ? '-with-captions' : ''}#${urlHash ? urlHash : ''}`
    );
    if (!preventMockFacetResponse) {
      await search.mockSearchWithFacetResponse([facetData]);
    }
    configuration.configure(options);
    await search.waitForSearchResponse();

    await use(new FacetObject(page));
  },
});

export const testInsight = quanticBase.extend<QuanticFacetE2EFixtures>({
  options: {},
  search: async ({page}, use) => {
    await use(new SearchObjectWithFacet(page, insightSearchRequestRegex));
  },
  insightSetup: async ({page}, use) => {
    await use(new InsightSetupObject(page));
  },
  facet: async ({page, options, search, configuration, insightSetup}, use) => {
    await page.goto(`${pageUrl}${options.caption ? '-with-captions' : ''}`);
    await search.mockSearchWithFacetResponse([facetData]);
    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup?.waitForInsightInterfaceInitialization();
    await search.performSearch();
    await search.waitForSearchResponse();
    await use(new FacetObject(page));
  },
});

export {expect} from '@playwright/test';
