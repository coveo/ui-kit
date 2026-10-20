import {
  type CommerceEngine,
  defineProductList,
  getSampleCommerceEngineConfiguration,
  type InferHydratedState,
  type InferStaticState,
} from '@coveo/headless/ssr-commerce-next';
import type {ComponentProps} from 'react';
import {describe, expectTypeOf, it} from 'vitest';
import {defineCommerceEngine} from './commerce-engine.js';
import {buildProviderWithDefinition} from './providers.js';

const {listingEngineDefinition} = defineCommerceEngine({
  configuration: getSampleCommerceEngineConfiguration(),
  controllers: {productList: defineProductList()},
});

const ListingProvider = buildProviderWithDefinition(listingEngineDefinition);

describe('buildProviderWithDefinition', () => {
  it('should take the static state of its definition, as fetchStaticState returns it', () => {
    expectTypeOf<ComponentProps<typeof ListingProvider>['staticState']>().toEqualTypeOf<
      InferStaticState<typeof listingEngineDefinition>
    >();
  });
});

describe('the StateProvider of an engine definition', () => {
  type StateProviderProps = ComponentProps<typeof listingEngineDefinition.StateProvider>;

  it('should take the controllers of its definition, static or hydrated', () => {
    expectTypeOf<StateProviderProps['controllers']>().toEqualTypeOf<
      | InferStaticState<typeof listingEngineDefinition>['controllers']
      | InferHydratedState<typeof listingEngineDefinition>['controllers']
    >();
  });

  it('should name the controllers of the page, the baked-in ones included', () => {
    expectTypeOf<keyof StateProviderProps['controllers']>().toEqualTypeOf<
      'productList' | 'parameterManager' | 'context' | 'cart'
    >();
  });

  it('should take the hydrated engine', () => {
    expectTypeOf<StateProviderProps['engine']>().toEqualTypeOf<CommerceEngine | undefined>();
  });
});
