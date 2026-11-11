import {
  defineProductList,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/ssr-commerce-next';
import {describe, expect, it} from 'vitest';
import {defineCommerceEngine} from './commerce-engine.js';

describe('defineCommerceEngine', () => {
  it('should expose one hook per controller, with useCommerceContext for the built-in context', () => {
    const {controllers} = defineCommerceEngine({
      configuration: getSampleCommerceEngineConfiguration(),
      controllers: {productList: defineProductList()},
    });

    expect(controllers.useProductList).toBeTypeOf('function');
    expect(controllers.useCart).toBeTypeOf('function');
    expect(controllers.useParameterManager).toBeTypeOf('function');
    expect(controllers.useCommerceContext).toBeTypeOf('function');
    expect(controllers).not.toHaveProperty('useContext');
  });
});
