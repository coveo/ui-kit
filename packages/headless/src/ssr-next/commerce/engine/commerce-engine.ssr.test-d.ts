import {describe, expectTypeOf, it} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {defineDidYouMean} from '../controllers/did-you-mean/headless-did-you-mean.ssr.js';
import {defineProductList} from '../controllers/product-list/headless-product-list.ssr.js';
import {defineRecommendations} from '../controllers/recommendations/headless-recommendations.ssr.js';
import {defineSearchBox} from '../controllers/search-box/headless-search-box.ssr.js';
import {SolutionType} from '../types/controller-constants.js';
import type {InferHydratedState, InferStaticState} from '../types/controller-inference.js';
import type {CommerceEngineDefinitionOptions} from '../types/engine.js';
import {defineCommerceEngine} from './commerce-engine.ssr.js';

// Types the customer relies on for IntelliSense: everything below is inferred from the controllers
// of the definition, with no annotation on the customer's side.
const {listingEngineDefinition, searchEngineDefinition, standaloneEngineDefinition, ...rest} =
  defineCommerceEngine({
    configuration: getSampleCommerceEngineConfiguration(),
    controllers: {
      productList: defineProductList(),
      searchBox: defineSearchBox(),
      didYouMean: defineDidYouMean(),
      popularViewed: defineRecommendations({options: {slotId: 'slot-viewed'}}),
      popularBought: defineRecommendations({options: {slotId: 'slot-bought'}}),
    },
  });

type ListingStaticState = InferStaticState<typeof listingEngineDefinition>;
type ListingHydratedState = InferHydratedState<typeof listingEngineDefinition>;
type ListingFetchOptions = Parameters<typeof listingEngineDefinition.fetchStaticState>[0];
type SearchFetchOptions = Parameters<typeof searchEngineDefinition.fetchStaticState>[0];
type StandaloneFetchOptions = Parameters<typeof standaloneEngineDefinition.fetchStaticState>[0];

describe('defineCommerceEngine', () => {
  it('should return exactly three engine definitions', () => {
    expectTypeOf(rest).toEqualTypeOf<{}>();
  });

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

  it('should type the recommendations option as the names of the defined slots', () => {
    type SlotNames = Array<'popularViewed' | 'popularBought'> | undefined;
    expectTypeOf<ListingFetchOptions['recommendations']>().toEqualTypeOf<SlotNames>();
    expectTypeOf<SearchFetchOptions['recommendations']>().toEqualTypeOf<SlotNames>();
    expectTypeOf<StandaloneFetchOptions['recommendations']>().toEqualTypeOf<SlotNames>();
  });

  it('should accept the product ID on every engine definition', () => {
    expectTypeOf<ListingFetchOptions['productId']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<SearchFetchOptions['productId']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<StandaloneFetchOptions['productId']>().toEqualTypeOf<string | undefined>();
  });

  it('should list the controllers of each kind of page in its static state', () => {
    expectTypeOf<ListingStaticState['controllers']>().toHaveProperty('productList');
    expectTypeOf<ListingStaticState['controllers']>().toHaveProperty('cart');
    expectTypeOf<ListingStaticState['controllers']>().toHaveProperty('context');
    expectTypeOf<ListingStaticState['controllers']>().toHaveProperty('parameterManager');
    expectTypeOf<ListingStaticState['controllers']>().not.toHaveProperty('searchBox');
    expectTypeOf<ListingStaticState['controllers']>().not.toHaveProperty('didYouMean');
    expectTypeOf<InferStaticState<typeof searchEngineDefinition>['controllers']>().toHaveProperty(
      'searchBox'
    );
    expectTypeOf<
      InferStaticState<typeof standaloneEngineDefinition>['controllers']
    >().not.toHaveProperty('productList');
    expectTypeOf<
      InferStaticState<typeof standaloneEngineDefinition>['controllers']
    >().not.toHaveProperty('parameterManager');
  });

  it('should list the recommendation slots in the static state of every engine definition', () => {
    expectTypeOf<ListingStaticState['controllers']>().toHaveProperty('popularViewed');
    expectTypeOf<InferStaticState<typeof searchEngineDefinition>['controllers']>().toHaveProperty(
      'popularBought'
    );
    expectTypeOf<
      InferStaticState<typeof standaloneEngineDefinition>['controllers']
    >().toHaveProperty('popularViewed');
  });

  it('should carry the requested slots and the product ID in the static state', () => {
    expectTypeOf<ListingStaticState['recommendations']>().toEqualTypeOf<
      Array<'popularViewed' | 'popularBought'> | undefined
    >();
    expectTypeOf<ListingStaticState['productId']>().toEqualTypeOf<string | undefined>();
  });

  it('should type the controllers of the static state as state snapshots', () => {
    expectTypeOf<ListingStaticState['controllers']['productList']>().toHaveProperty('state');
    expectTypeOf<ListingStaticState['controllers']['productList']>().not.toHaveProperty(
      'subscribe'
    );
  });

  it('should hydrate the controllers of the page as live controllers', () => {
    expectTypeOf<ListingHydratedState['controllers']['productList']>().toHaveProperty('subscribe');
    expectTypeOf<ListingHydratedState['controllers']['popularViewed']>().toHaveProperty('refresh');
    expectTypeOf<ListingHydratedState['controllers']['parameterManager']>().toHaveProperty(
      'synchronize'
    );
    expectTypeOf<
      InferHydratedState<typeof standaloneEngineDefinition>['controllers']
    >().not.toHaveProperty('parameterManager');
  });
});
