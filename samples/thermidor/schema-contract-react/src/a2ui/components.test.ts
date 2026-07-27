import {describe, expect, it} from 'vitest';
import {thermidorCatalogDefinitions} from './components.js';
import {cartItemSchema, productSchema} from './generated/catalog-components.js';

describe('thermidorCatalogDefinitions', () => {
  it('accepts the controller advertisements supplied by the catalog message', () => {
    expect(
      thermidorCatalogDefinitions.ProductCarousel.props.safeParse({
        controllers: {
          productListController: {
            controllerId: 'featured-products',
            controllerSchema:
              'https://schema.thermidor.coveo.com/controllers/product-list.schema.json',
          },
        },
      }).success
    ).toBe(true);
    expect(
      thermidorCatalogDefinitions.Cart.props.safeParse({
        controllers: {
          cartController: {
            controllerId: 'shopping-cart',
            controllerSchema: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
          },
        },
      }).success
    ).toBe(true);
  });

  it('validates generated Product and CartItem values against their JSON Schema constraints', () => {
    expect(
      productSchema.safeParse({
        permanentid: 'p1',
        ec_name: 'Trail shoes',
        ec_rating: null,
        additionalFields: {},
        children: [{permanentid: 'p1-blue', ec_name: 'Trail shoes', additionalFields: {}}],
      }).success
    ).toBe(true);
    expect(
      productSchema.safeParse({
        permanentid: 'p1',
        ec_name: 'Trail shoes',
        ec_rating: 6,
        additionalFields: {},
      }).success
    ).toBe(false);
    expect(
      cartItemSchema.safeParse({productId: 'p1', name: 'Trail shoes', price: 0, quantity: 1})
        .success
    ).toBe(false);
    expect(
      cartItemSchema.safeParse({productId: 'p1', name: 'Trail shoes', price: 99.99, quantity: 1.5})
        .success
    ).toBe(false);
  });

  it('enforces the controller contract literals and closed binding objects from JSON Schema', () => {
    expect(
      thermidorCatalogDefinitions.ProductCarousel.props.safeParse({
        controllers: {
          productListController: {
            controllerId: 'featured-products',
            controllerSchema: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
          },
        },
      }).success
    ).toBe(false);
    expect(
      thermidorCatalogDefinitions.Cart.props.safeParse({
        controllers: {
          cartController: {
            controllerId: 'shopping-cart',
            controllerSchema: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
            unexpected: true,
          },
        },
      }).success
    ).toBe(false);
  });
});
