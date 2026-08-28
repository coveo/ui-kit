import {describe, expect, it} from 'vitest';
import {thermidorCatalogDefinitions, THERMIDOR_CATALOG_ID} from './components.js';
import {
  CartControllerContractSchema,
  ProductListControllerContractSchema,
  ProductCarouselPropsSchema,
  ProductSchema,
  CartItemSchema,
} from '@coveo/thermidor-schema';

describe('thermidorCatalogDefinitions', () => {
  it('accepts the controller advertisements supplied by the catalog message', () => {
    expect(
      ProductCarouselPropsSchema.safeParse({
        controllers: {
          productListController: {
            controllerId: 'featured-products',
            controllerSchema:
              'https://schema.thermidor.coveo.com/controllers/product-list.schema.json',
          },
        },
      }).success
    ).toBe(true);
  });

  it('validates generated Product and CartItem values against their v2 JSON Schema constraints', () => {
    expect(
      ProductSchema.safeParse({
        permanentid: 'p1',
        ec_name: 'Trail shoes',
        ec_rating: null,
        additionalFields: {},
        children: [{permanentid: 'p1-blue', ec_name: 'Trail shoes', additionalFields: {}}],
      }).success
    ).toBe(true);
    expect(
      ProductSchema.safeParse({
        permanentid: 'p1',
        ec_name: 'Trail shoes',
        ec_rating: 6,
        additionalFields: {},
      }).success
    ).toBe(false);
    expect(
      CartItemSchema.safeParse({productId: 'p1', name: 'Trail shoes', price: 0, quantity: 1})
        .success
    ).toBe(true);
    expect(
      CartItemSchema.safeParse({productId: 'p1', name: 'Trail shoes', price: -1, quantity: 1})
        .success
    ).toBe(false);
    expect(
      CartItemSchema.safeParse({productId: 'p1', name: 'Trail shoes', price: 99.99, quantity: 1.5})
        .success
    ).toBe(false);
  });

  it('enforces the controller contract literals and closed binding objects from JSON Schema', () => {
    expect(
      ProductCarouselPropsSchema.safeParse({
        controllers: {
          productListController: {
            controllerId: 'featured-products',
            controllerSchema: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
          },
        },
      }).success
    ).toBe(false);
  });

  it('validates v2 controller state and nested action contracts', () => {
    expect(
      ProductListControllerContractSchema.shape.state.safeParse({
        products: [{permanentid: 'p1', ec_name: 'Trail shoes', additionalFields: {}}],
      }).success
    ).toBe(true);
    expect(CartControllerContractSchema.shape.state.safeParse({items: []}).success).toBe(true);
    expect(
      CartControllerContractSchema.shape.actions.shape.setItems.shape.payload.safeParse({
        items: [{productId: 'p1', name: 'Trail shoes', price: 99.99, quantity: 1}],
      }).success
    ).toBe(true);
    expect(
      CartControllerContractSchema.shape.actions.shape.updateItemQuantity.shape.payload.safeParse({
        item: {productId: 'p1', name: 'Trail shoes', price: 99.99, quantity: 0},
      }).success
    ).toBe(false);
  });

  it('exports the correct catalog ID', () => {
    expect(THERMIDOR_CATALOG_ID).toBe('https://schema.thermidor.coveo.com/a2-ui/catalog.json');
  });

  it('generated props schema literals match the controller contract schema values', () => {
    expect(
      ProductCarouselPropsSchema.shape.controllers.shape.productListController.shape
        .controllerSchema.value
    ).toBe(ProductListControllerContractSchema.shape.controllerSchema.value);
  });
});
