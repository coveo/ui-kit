import {describe, expectTypeOf, it} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {defineProductList} from '../controllers/product-list/headless-product-list.ssr.js';
import {defineRecommendations} from '../controllers/recommendations/headless-recommendations.ssr.js';
import {defineSearchBox} from '../controllers/search-box/headless-search-box.ssr.js';
import type {InferStaticState} from '../types/controller-inference.js';
import {defineCommerceEngine} from './commerce-engine.ssr.js';

// Types the customer relies on for IntelliSense: everything below is inferred from the controllers
// of the definition, with no annotation on the customer's side.
const {
  listingEngineDefinition,
  searchEngineDefinition,
  standaloneEngineDefinition,
  recommendationEngineDefinition,
} = defineCommerceEngine({
  configuration: getSampleCommerceEngineConfiguration(),
  controllers: {
    productList: defineProductList(),
    searchBox: defineSearchBox(),
    popularViewed: defineRecommendations({options: {slotId: 'slot-viewed'}}),
  },
});

type ListingStaticState = InferStaticState<typeof listingEngineDefinition>;

describe('defineCommerceEngine', () => {
  it('should hydrate each definition with the static state it fetched, as is', () => {
    expectTypeOf<
      Parameters<typeof listingEngineDefinition.hydrateStaticState>[0]
    >().toEqualTypeOf<ListingStaticState>();
    expectTypeOf<Parameters<typeof searchEngineDefinition.hydrateStaticState>[0]>().toEqualTypeOf<
      InferStaticState<typeof searchEngineDefinition>
    >();
    expectTypeOf<
      Parameters<typeof standaloneEngineDefinition.hydrateStaticState>[0]
    >().toEqualTypeOf<InferStaticState<typeof standaloneEngineDefinition>>();
    expectTypeOf<
      Parameters<typeof recommendationEngineDefinition.hydrateStaticState>[0]
    >().toEqualTypeOf<InferStaticState<typeof recommendationEngineDefinition>>();
  });
});
