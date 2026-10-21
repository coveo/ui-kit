import {describe, expectTypeOf, it} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {defineDidYouMean} from '../controllers/did-you-mean/headless-did-you-mean.ssr.js';
import {defineProductList} from '../controllers/product-list/headless-product-list.ssr.js';
import {defineRecommendations} from '../controllers/recommendations/headless-recommendations.ssr.js';
import {defineSearchBox} from '../controllers/search-box/headless-search-box.ssr.js';
import type {InferHydratedState, InferStaticState} from '../types/controller-inference.js';
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

type ListingFetchOptions = Parameters<typeof listingEngineDefinition.fetchStaticState>[0];
type SearchFetchOptions = Parameters<typeof searchEngineDefinition.fetchStaticState>[0];
type StandaloneFetchOptions = Parameters<typeof standaloneEngineDefinition.fetchStaticState>[0];

describe('defineCommerceEngine', () => {
  it('should return exactly three engine definitions', () => {
    expectTypeOf(rest).toEqualTypeOf<{}>();
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

  it('should list the recommendation slots in the static state of every engine definition', () => {
    expectTypeOf<InferStaticState<typeof listingEngineDefinition>['controllers']>().toHaveProperty(
      'popularViewed'
    );
    expectTypeOf<InferStaticState<typeof searchEngineDefinition>['controllers']>().toHaveProperty(
      'popularBought'
    );
    expectTypeOf<
      InferStaticState<typeof standaloneEngineDefinition>['controllers']
    >().toHaveProperty('popularViewed');
  });

  it('should keep the controllers of the other kinds of page out of a static state', () => {
    expectTypeOf<
      InferStaticState<typeof listingEngineDefinition>['controllers']
    >().not.toHaveProperty('searchBox');
    expectTypeOf<
      InferStaticState<typeof standaloneEngineDefinition>['controllers']
    >().not.toHaveProperty('productList');
    expectTypeOf<
      InferStaticState<typeof listingEngineDefinition>['controllers']
    >().not.toHaveProperty('didYouMean');
  });

  it('should carry the requested slots and the product ID in the static state', () => {
    type ListingStaticState = InferStaticState<typeof listingEngineDefinition>;
    expectTypeOf<ListingStaticState['recommendations']>().toEqualTypeOf<
      Array<'popularViewed' | 'popularBought'> | undefined
    >();
    expectTypeOf<ListingStaticState['productId']>().toEqualTypeOf<string | undefined>();
  });

  it('should hydrate the recommendation slots as live controllers', () => {
    type ListingHydratedState = InferHydratedState<typeof listingEngineDefinition>;
    expectTypeOf<ListingHydratedState['controllers']['popularViewed']>().toHaveProperty('refresh');
    expectTypeOf<ListingHydratedState['controllers']['productList']>().toHaveProperty('state');
  });
});
