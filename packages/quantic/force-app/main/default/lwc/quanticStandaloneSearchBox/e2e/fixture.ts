import {StandaloneSearchBoxObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {searchRequestRegex} from '../../../../../../playwright/utils/requests';

const standaloneSearchBoxUrl = 's/quantic-standalone-search-box';

interface StandaloneSearchBoxOptions {
  placeholder?: string;
  withoutSubmitButton?: boolean;
  numberOfSuggestions?: number;
  redirectUrl?: string;
  searchHub?: string;
  pipeline?: string;
  textarea?: boolean;
  disableRecentQueries?: boolean;
  keepFiltersOnSearch?: boolean;
}

type QuanticStandaloneSearchBoxE2EFixtures = {
  searchBox: StandaloneSearchBoxObject;
  search: SearchObject;
  options: Partial<StandaloneSearchBoxOptions>;
  urlHash: string;
};

export const testStandaloneSearchBox =
  quanticBase.extend<QuanticStandaloneSearchBoxE2EFixtures>({
    options: {},
    urlHash: '',
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    searchBox: async ({page, options, configuration, urlHash}, use) => {
      await page.goto(
        urlHash
          ? `${standaloneSearchBoxUrl}#${urlHash}`
          : standaloneSearchBoxUrl
      );
      await configuration.configure(options);
      await use(new StandaloneSearchBoxObject(page));
    },
  });

export {expect} from '@playwright/test';
