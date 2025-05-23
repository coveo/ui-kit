import {RecommendationListObject} from './pageObject';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {searchRequestRegex} from '../../../../../../playwright/utils/requests';

const pageUrl = 's/quantic-recommendation-list';

interface RecommendationListOptions {
  numberOfRecommendations: number;
  recommendationsPerRow: number;
  variant: string;
  fieldsToInclude: string;
}

type QuanticRecommendationListE2EFixtures = {
  recommendationList: RecommendationListObject;
  search: SearchObject;
  options: Partial<RecommendationListOptions>;
};

export const test = quanticBase.extend<QuanticRecommendationListE2EFixtures>({
  options: {},
  search: async ({page}, use) => {
    await use(new SearchObject(page, searchRequestRegex));
  },
  recommendationList: async ({page, options, configuration, search}, use) => {
    await page.goto(pageUrl);
    configuration.configure(options);
    await search.waitForSearchResponse();

    await use(new RecommendationListObject(page));
  },
});

export {expect} from '@playwright/test';
