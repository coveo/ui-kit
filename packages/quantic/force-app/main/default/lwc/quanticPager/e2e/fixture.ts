import {PagerObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';

const pageUrl = 's/quantic-pager';

interface PagerOptions {
  numberOfPages: number;
}
type QuanticPagerE2EFixtures = {
  pager: PagerObject;
  search: SearchObject;
  options: Partial<PagerOptions>;
};

type QuanticPagerE2ESearchFixtures = QuanticPagerE2EFixtures & {
  urlHash: string;
};

type QuanticPagerE2EInsightFixtures = QuanticPagerE2ESearchFixtures & {
  insightSetup: InsightSetupObject;
};

export const testSearch = quanticBase.extend<QuanticPagerE2ESearchFixtures>({
  options: {},
  urlHash: '',
  search: async ({page}, use) => {
    await use(new SearchObject(page, searchRequestRegex));
  },
  pager: async ({page, options, configuration, search, urlHash}, use) => {
    await page.goto(urlHash ? `${pageUrl}#${urlHash}` : pageUrl);
    const searchResponsePromise = search.waitForSearchResponse();
    configuration.configure(options);
    await searchResponsePromise;

    await use(new PagerObject(page));
  },
});

export const testInsight = quanticBase.extend<QuanticPagerE2EInsightFixtures>({
  options: {},
  search: async ({page}, use) => {
    await use(new SearchObject(page, insightSearchRequestRegex));
  },
  insightSetup: async ({page}, use) => {
    await use(new InsightSetupObject(page));
  },
  pager: async ({page, options, search, configuration, insightSetup}, use) => {
    await page.goto(pageUrl);
    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup.waitForInsightInterfaceInitialization();
    const searchResponsePromise = search.waitForSearchResponse();
    await search.performSearch();
    await searchResponsePromise;
    await use(new PagerObject(page));
  },
});

export {expect} from '@playwright/test';
