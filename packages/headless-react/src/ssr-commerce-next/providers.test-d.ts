import {
  defineProductList,
  getSampleCommerceEngineConfiguration,
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
