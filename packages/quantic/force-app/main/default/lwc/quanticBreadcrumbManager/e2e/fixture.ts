import {BreadcrumbManagerObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';

const breadcrumbManagerUrl = 's/quantic-breadcrumb-manager';

interface BreadcrumbManagerOptions {
  categoryDivider: string;
  collapseThreshold: number;
}

type QuanticBreadcrumbManagerE2EFixtures = {
  breadcrumbManager: BreadcrumbManagerObject;
  search: SearchObject;
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
  quanticBase.extend<QuanticBreadcrumbManagerE2ESearchFixtures>({
    options: {},
    urlHash: '',
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    breadcrumbManager: async (
      {page, options, configuration, search, urlHash},
      use
    ) => {
      await page.goto(
        urlHash ? `${breadcrumbManagerUrl}#${urlHash}` : breadcrumbManagerUrl
      );
      configuration.configure(options);
      await search.waitForSearchResponse();
      await use(new BreadcrumbManagerObject(page));
    },
  });

export const testInsight =
  quanticBase.extend<QuanticBreadcrumbManagerE2eInsightFixtures>({
    options: {},
    search: async ({page}, use) => {
      await use(new SearchObject(page, insightSearchRequestRegex));
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    breadcrumbManager: async (
      {page, options, search, configuration, insightSetup},
      use
    ) => {
      await page.goto(breadcrumbManagerUrl);
      configuration.configure({...options, useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      await search.performSearch();
      await search.waitForSearchResponse();
      await use(new BreadcrumbManagerObject(page));
    },
  });

export {expect} from '@playwright/test';
