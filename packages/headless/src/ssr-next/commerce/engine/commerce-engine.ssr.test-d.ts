import {describe, expectTypeOf, it} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {defineProductList} from '../controllers/product-list/headless-product-list.ssr.js';
import {defineRecommendations} from '../controllers/recommendations/headless-recommendations.ssr.js';
import {defineSearchBox} from '../controllers/search-box/headless-search-box.ssr.js';
import type {InferHydratedState, InferStaticState} from '../types/controller-inference.js';
import {SolutionType} from '../types/controller-constants.js';
import type {CommerceEngineDefinitionOptions} from '../types/engine.js';
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
type ListingHydratedState = InferHydratedState<typeof listingEngineDefinition>;

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

  it('should take the navigator context per request, not on the definition', () => {
    expectTypeOf<CommerceEngineDefinitionOptions>().not.toHaveProperty('navigatorContextProvider');
    expectTypeOf<ListingStaticState>().toHaveProperty('navigatorContext');
    expectTypeOf<ListingStaticState['accessToken']>().toEqualTypeOf<string | undefined>();
  });

  it('should stamp the static state with the solution type of its definition', () => {
    expectTypeOf<ListingStaticState['solutionType']>().toEqualTypeOf<SolutionType.listing>();
    expectTypeOf<
      InferStaticState<typeof searchEngineDefinition>['solutionType']
    >().toEqualTypeOf<SolutionType.search>();
  });

  it('should refuse the static state of another definition at compile time', () => {
    expectTypeOf<
      InferStaticState<typeof searchEngineDefinition>
    >().not.toMatchTypeOf<ListingStaticState>();
  });

  it('should list the controllers of each kind of page in its static state', () => {
    expectTypeOf<ListingStaticState['controllers']>().toHaveProperty('productList');
    expectTypeOf<ListingStaticState['controllers']>().toHaveProperty('cart');
    expectTypeOf<ListingStaticState['controllers']>().toHaveProperty('context');
    expectTypeOf<ListingStaticState['controllers']>().toHaveProperty('parameterManager');
    expectTypeOf<ListingStaticState['controllers']>().not.toHaveProperty('searchBox');
    expectTypeOf<ListingStaticState['controllers']>().not.toHaveProperty('popularViewed');
    expectTypeOf<InferStaticState<typeof searchEngineDefinition>['controllers']>().toHaveProperty(
      'searchBox'
    );
    expectTypeOf<
      InferStaticState<typeof standaloneEngineDefinition>['controllers']
    >().not.toHaveProperty('parameterManager');
    expectTypeOf<
      InferStaticState<typeof recommendationEngineDefinition>['controllers']
    >().toHaveProperty('popularViewed');
  });

  it('should type the controllers of the static state as state snapshots', () => {
    expectTypeOf<ListingStaticState['controllers']['productList']>().toHaveProperty('state');
    expectTypeOf<ListingStaticState['controllers']['productList']>().not.toHaveProperty(
      'subscribe'
    );
  });

  it('should hydrate the controllers of the page as live controllers', () => {
    expectTypeOf<ListingHydratedState['controllers']['productList']>().toHaveProperty('subscribe');
    expectTypeOf<ListingHydratedState['controllers']['parameterManager']>().toHaveProperty(
      'synchronize'
    );
    expectTypeOf<
      InferHydratedState<typeof standaloneEngineDefinition>['controllers']
    >().not.toHaveProperty('parameterManager');
  });
});
