import {describe, expect, it} from 'vitest';
import {thermidorCatalogDefinitions} from './components.js';

describe('thermidorCatalogDefinitions', () => {
  it('accepts the controller advertisements supplied by the catalog message', () => {
    expect(
      thermidorCatalogDefinitions.ProductCarousel.props.safeParse({
        controllers: {
          productListController: {
            controllerId: 'featured-products',
            controllerSchema: 'product-list.schema.json',
          },
        },
      }).success
    ).toBe(true);
    expect(
      thermidorCatalogDefinitions.Cart.props.safeParse({
        controllers: {
          cartController: {
            controllerId: 'shopping-cart',
            controllerSchema: 'cart.schema.json',
          },
        },
      }).success
    ).toBe(true);
  });
});
