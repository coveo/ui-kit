import {createFacetSearchTransformer, searchResponses} from '@coveo/platform-mock-api/commerce';
import {MockCommerceApi} from '@coveo/platform-mock-api';
import {defineNetworkFixture, type NetworkFixture} from '@msw/playwright';
import {test as base, expect} from '@playwright/test';

interface Fixtures {
  network: NetworkFixture;
}

const commerceApi = new MockCommerceApi();

// The shared mock's querySuggest response has no `fieldSuggestionsFacets`, so the
// filter-suggestion groups in the custom search box would never appear. The public
// `searchuisamples` organization does return them, so they are added here to match
// what the sample sees at runtime.
commerceApi.querySuggestEndpoint.mock((base) => ({
  ...base,
  fieldSuggestionsFacets: [
    {facetId: 'cat_color', field: 'cat_color', displayName: 'Color', type: 'regular'},
    {facetId: 'ec_brand', field: 'ec_brand', displayName: 'Brand', type: 'regular'},
  ],
}));

// Filter suggestions resolve their values through the facet-search endpoint, which
// the shared mock leaves empty by default.
commerceApi.facetSearchEndpoint.addRequestTransformer(
  createFacetSearchTransformer(searchResponses.richResponse)
);

export const test = base.extend<Fixtures>({
  network: [
    async ({context}, use) => {
      const network = defineNetworkFixture({
        context,
        handlers: [...commerceApi.handlers],
      });
      await network.enable();
      await use(network);
      await network.disable();
    },
    {auto: true},
  ],
});

export {expect};
