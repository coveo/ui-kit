import {
  defineProductList,
  defineRecommendations,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/ssr-commerce-next';
import {describe, expectTypeOf, it} from 'vitest';
import {defineCommerceEngine} from './commerce-engine.js';

// Everything below is inferred from the controllers of the definition, with no annotation on the
// customer's side.
const {controllers} = defineCommerceEngine({
  configuration: getSampleCommerceEngineConfiguration(),
  controllers: {
    productList: defineProductList(),
    popularViewed: defineRecommendations({options: {slotId: 'slot-viewed'}}),
  },
});

describe('defineCommerceEngine', () => {
  it('should derive one hook per controller, including the baked-in ones', () => {
    expectTypeOf(controllers).toHaveProperty('useProductList');
    expectTypeOf(controllers).toHaveProperty('usePopularViewed');
    expectTypeOf(controllers).toHaveProperty('useCart');
    expectTypeOf(controllers).toHaveProperty('useContext');
    expectTypeOf(controllers).toHaveProperty('useParameterManager');
    expectTypeOf(controllers.useProductList).returns.toHaveProperty('state');
    expectTypeOf(controllers.useProductList).returns.toHaveProperty('methods');
  });
});
