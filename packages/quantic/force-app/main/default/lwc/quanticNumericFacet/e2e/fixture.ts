import {NumericFacetObject} from './pageObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {BaseFacetObject} from '../../../../../../playwright/page-object/baseFacetObject';
import {initialFacetData} from './data';
import {facetBase} from '../../../../../../playwright/fixtures/baseFacetFixture';

const pageUrl = 's/quantic-numeric-facet';

interface FacetOptions {
  withInput: boolean;
}

type QuanticNumericFacetE2EFixtures = {
  facet: NumericFacetObject;
  options: Partial<FacetOptions>;
  insightSetup?: InsightSetupObject;
};

export const testSearch = facetBase.extend<QuanticNumericFacetE2EFixtures>({
  options: {withInput: true},
  facetResponses: {responses: [[initialFacetData]]},
  baseFacet: async ({page}, use) => {
    await use(new BaseFacetObject(page, searchRequestRegex));
  },
  facet: async (
    {page, options, configuration, baseFacet, urlHash, facetResponses},
    use
  ) => {
    // search use case: interface auto-triggers a search on load, hence the mockSearchWithBaseResponse call below
    await baseFacet.mockSearchWithBaseResponse();
    await page.goto(`${pageUrl}#${urlHash ? urlHash : ''}`);
    await baseFacet.mockSearchWithFacetResponseSequence(
      facetResponses?.responses
    );

    configuration.configure(options);
    await baseFacet.waitForSearchResponse();

    await use(new NumericFacetObject(page));
  },
});

export const testInsight = facetBase.extend<QuanticNumericFacetE2EFixtures>({
  options: {withInput: true},
  facetResponses: {responses: [[initialFacetData]]},
  baseFacet: async ({page}, use) => {
    await use(new BaseFacetObject(page, insightSearchRequestRegex));
  },
  insightSetup: async ({page}, use) => {
    await use(new InsightSetupObject(page));
  },
  facet: async (
    {page, options, baseFacet, configuration, insightSetup, facetResponses},
    use
  ) => {
    await page.goto(pageUrl);
    await baseFacet.mockSearchWithFacetResponseSequence(
      facetResponses?.responses
    );
    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup?.waitForInsightInterfaceInitialization();
    await Promise.all([
      baseFacet.waitForSearchResponse(),
      baseFacet.performSearch(),
    ]);
    await use(new NumericFacetObject(page));
  },
});

export {expect} from '@playwright/test';
