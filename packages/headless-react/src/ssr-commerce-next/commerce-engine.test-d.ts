import {
  type CommerceEngine,
  defineProductList,
  defineRecommendations,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/ssr-commerce-next';
import type {ComponentProps} from 'react';
import {describe, expectTypeOf, it} from 'vitest';
import type {Hydration} from '../ssr-common/types.js';
import {defineCommerceEngine} from './commerce-engine.js';
import {buildProviderWithDefinition} from './index.js';

// Everything below is inferred from the controllers of the definition, with no annotation on the
// customer's side.
const {controllers, useEngine, useHydration, listingEngineDefinition} = defineCommerceEngine({
  configuration: getSampleCommerceEngineConfiguration(),
  controllers: {
    productList: defineProductList(),
    popularViewed: defineRecommendations({options: {slotId: 'slot-viewed'}}),
  },
});

const ListingProvider = buildProviderWithDefinition(listingEngineDefinition);

describe('defineCommerceEngine', () => {
  it('should derive one hook per controller, including the baked-in ones', () => {
    expectTypeOf(controllers).toHaveProperty('useProductList');
    expectTypeOf(controllers).toHaveProperty('usePopularViewed');
    expectTypeOf(controllers).toHaveProperty('useCart');
    expectTypeOf(controllers).toHaveProperty('useCommerceContext');
    expectTypeOf(controllers).not.toHaveProperty('useContext');
    expectTypeOf(controllers).toHaveProperty('useParameterManager');
    expectTypeOf(controllers.useProductList).returns.toHaveProperty('state');
    expectTypeOf(controllers.useProductList).returns.toHaveProperty('methods');
  });

  it('should expose the engine and the hydration status', () => {
    expectTypeOf(useEngine).returns.toEqualTypeOf<CommerceEngine | undefined>();
    expectTypeOf(useHydration).returns.toEqualTypeOf<Hydration>();
  });

  it('should build a provider that handles a failed hydration on request', () => {
    expectTypeOf<ComponentProps<typeof ListingProvider>['onHydrationError']>().toEqualTypeOf<
      ((error: unknown) => void) | undefined
    >();
  });
});
