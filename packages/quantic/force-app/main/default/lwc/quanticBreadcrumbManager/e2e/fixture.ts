import {BreadcrumbManagerObject} from './pageObject';
import {facetBase} from '../../../../../../playwright/fixtures/baseFacetFixture';
import {BaseFacetObject} from '../../../../../../playwright/page-object/baseFacetObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {allIdle} from './data';

const breadcrumbManagerUrl = 's/quantic-breadcrumb-manager';

interface BreadcrumbManagerOptions {
  categoryDivider: string;
  collapseThreshold: number;
}

type QuanticBreadcrumbManagerE2EFixtures = {
  breadcrumbManager: BreadcrumbManagerObject;
  options: Partial<BreadcrumbManagerOptions>;
};

type QuanticBreadcrumbManagerE2ESearchFixtures =
  QuanticBreadcrumbManagerE2EFixtures & {
    urlHash: string;
  };

type QuanticBreadcrumbManagerE2eInsightFixtures =
  QuanticBreadcrumbManagerE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  facetBase.extend<QuanticBreadcrumbManagerE2ESearchFixtures>({
    options: {},
    urlHash: '',
    facetResponses: {responses: [allIdle]},
    baseFacet: async ({page}, use) => {
      await use(new BaseFacetObject(page, searchRequestRegex));
    },
    breadcrumbManager: async (
      {page, options, configuration, baseFacet, urlHash, facetResponses},
      use
    ) => {
      await baseFacet.mockSearchWithBaseResponse();
      await page.goto(
        urlHash ? `${breadcrumbManagerUrl}#${urlHash}` : breadcrumbManagerUrl
      );
      await baseFacet.mockSearchWithFacetResponseSequence(
        facetResponses?.responses
      );
      configuration.configure(options);
      await baseFacet.waitForSearchResponse();
      await use(new BreadcrumbManagerObject(page));
    },
  });

export const testInsight =
  facetBase.extend<QuanticBreadcrumbManagerE2eInsightFixtures>({
    options: {},
    facetResponses: {responses: [allIdle]},
    baseFacet: async ({page}, use) => {
      await use(new BaseFacetObject(page, insightSearchRequestRegex));
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    breadcrumbManager: async (
      {page, options, baseFacet, configuration, insightSetup, facetResponses},
      use
    ) => {
      await page.goto(breadcrumbManagerUrl);
      await baseFacet.mockSearchWithFacetResponseSequence(
        facetResponses?.responses
      );
      configuration.configure({...options, useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      await Promise.all([
        baseFacet.waitForSearchResponse(),
        baseFacet.performSearch(),
      ]);
      await use(new BreadcrumbManagerObject(page));
    },
  });

export {expect} from '@playwright/test';
