import type {Product} from '@coveo/relay-event-types';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {productView} from '../../../features/commerce/product/product-actions.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import {buildProductView, type ProductView} from './headless-product-view.js';

vi.mock('../../../features/commerce/product/product-actions');

describe('ProductView', () => {
  let engine: MockedCommerceEngine;
  let controller: ProductView;

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    controller = buildProductView(engine);
  });

  it('#view dispatches productView', () => {
    const product: Product = {
      name: 'ski',
      price: 1,
      productId: 'a',
    };

    controller.view(product);
    expect(productView).toHaveBeenCalledWith(product);
  });
});
