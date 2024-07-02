import {Product} from '@coveo/relay-event-types';
import {productView} from '../../../features/commerce/product/product-actions';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../test/mock-engine-v2';
import {buildProductView, ProductView} from './headless-product-view';

jest.mock('../../../features/commerce/product/product-actions');

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
