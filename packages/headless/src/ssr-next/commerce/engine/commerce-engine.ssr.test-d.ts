import {describe, expectTypeOf, it} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {defineProductList} from '../controllers/product-list/headless-product-list.ssr.js';
import {defineRecommendations} from '../controllers/recommendations/headless-recommendations.ssr.js';
import {defineSearchBox} from '../controllers/search-box/headless-search-box.ssr.js';
import type {SolutionType} from '../types/controller-constants.js';
import type {InferHydratedState, InferStaticState} from '../types/controller-inference.js';
import type {CommerceEngineDefinitionOptions} from '../types/engine.js';
import type {CommerceStaticState} from '../types/fetch-static-state.js';
import type {CommerceHydratedState} from '../types/hydrate-static-state.js';
import {defineCommerceEngine} from './commerce-engine.ssr.js';

const controllers = {
  productList: defineProductList(),
  searchBox: defineSearchBox(),
  popularViewed: defineRecommendations({options: {slotId: 'slot-viewed'}}),
};

// Types the customer relies on for IntelliSense: everything below is inferred from the controllers
// of the definition, with no annotation on the customer's side.
const {
  listingEngineDefinition,
  searchEngineDefinition,
  standaloneEngineDefinition,
  recommendationEngineDefinition,
} = defineCommerceEngine({
  configuration: getSampleCommerceEngineConfiguration(),
  controllers,
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

describe('the static and hydrated states of a commerce engine definition', () => {
  it('should be named after the controllers and the kind of page of the definition', () => {
    expectTypeOf<ListingStaticState>().toEqualTypeOf<
      CommerceStaticState<typeof controllers, SolutionType.listing>
    >();
    expectTypeOf<ListingHydratedState>().toEqualTypeOf<
      CommerceHydratedState<typeof controllers, SolutionType.listing>
    >();
  });

  it('should name exactly the controllers built for each kind of page', () => {
    expectTypeOf<keyof ListingHydratedState['controllers']>().toEqualTypeOf<
      'productList' | 'parameterManager' | 'context' | 'cart'
    >();
    expectTypeOf<
      keyof InferHydratedState<typeof searchEngineDefinition>['controllers']
    >().toEqualTypeOf<'productList' | 'searchBox' | 'parameterManager' | 'context' | 'cart'>();
    expectTypeOf<
      keyof InferHydratedState<typeof standaloneEngineDefinition>['controllers']
    >().toEqualTypeOf<'context' | 'cart'>();
    expectTypeOf<
      keyof InferHydratedState<typeof recommendationEngineDefinition>['controllers']
    >().toEqualTypeOf<'popularViewed' | 'context' | 'cart'>();
    expectTypeOf<keyof ListingStaticState['controllers']>().toEqualTypeOf<
      keyof ListingHydratedState['controllers']
    >();
  });
});
