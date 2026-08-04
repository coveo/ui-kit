import {FacetManagerObject} from './pageObject';
import {facetBase} from '../../../../../../playwright/fixtures/baseFacetFixture';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {BaseFacetObject} from '../../../../../../playwright/page-object/baseFacetObject';
import facetManagerData from './data';

const pageUrl = 's/quantic-facet-manager';

interface FacetManagerOptions {}

type QuanticFacetManagerE2ESearchFixtures = {
  facetManager: FacetManagerObject;
  options: Partial<FacetManagerOptions>;
};

type QuanticFacetManagerE2EInsightFixtures =
  QuanticFacetManagerE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  facetBase.extend<QuanticFacetManagerE2ESearchFixtures>({
    options: {},
    facetResponses: {responses: [facetManagerData]},
    baseFacet: async ({page}, use) => {
      await use(new BaseFacetObject(page, searchRequestRegex));
    },
    facetManager: async (
      {page, options, configuration, baseFacet, facetResponses},
      use
    ) => {
      await baseFacet.mockSearchWithFacetResponseSequence(
        facetResponses?.responses
      );
      await page.goto(pageUrl);
      configuration.configure(options);
      await baseFacet.waitForSearchResponse();

      await use(new FacetManagerObject(page));
    },
  });

export const testInsight =
  facetBase.extend<QuanticFacetManagerE2EInsightFixtures>({
    options: {},
    facetResponses: {responses: [facetManagerData]},
    baseFacet: async ({page}, use) => {
      await use(new BaseFacetObject(page, insightSearchRequestRegex));
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    facetManager: async (
      {page, options, baseFacet, configuration, insightSetup, facetResponses},
      use
    ) => {
      await baseFacet.mockSearchWithFacetResponseSequence(
        facetResponses?.responses
      );
      await page.goto(pageUrl);
      configuration.configure({...options, useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      const searchResponsePromise = baseFacet.waitForSearchResponse();
      await baseFacet.performSearch();
      await searchResponsePromise;
      await use(new FacetManagerObject(page));
    },
  });

export {expect} from '@playwright/test';
