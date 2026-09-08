import {describe, expect, it} from 'vitest';
import {thermidorCatalogDefinitions, THERMIDOR_CATALOG_ID} from './components.js';
import {
  CartSchema,
  ProductCarouselSchema,
  ComponentContractsSchema,
  ProductCarouselPropsSchema,
  ProductSchema,
  CartItemSchema,
} from '@coveo/thermidor-schema';

describe('thermidorCatalogDefinitions', () => {
  it('accepts the flat component props supplied by the catalog message', () => {
    expect(
      ProductCarouselPropsSchema.safeParse({
        componentId: 'featured-products',
        componentType: 'product-carousel',
      }).success
    ).toBe(true);
  });

  it('validates generated Product and CartItem values against their JSON Schema constraints', () => {
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

  it('rejects props with wrong componentType literal', () => {
    expect(
      ProductCarouselPropsSchema.safeParse({
        componentId: 'featured-products',
        componentType: 'cart',
      }).success
    ).toBe(false);
  });

  it('validates component contract state and actions via ComponentContractsSchema', () => {
    expect(
      ProductCarouselSchema.shape.state.safeParse({
        heading: 'Trail shoes',
        products: [{permanentid: 'p1', ec_name: 'Trail shoes', additionalFields: {}}],
      }).success
    ).toBe(true);
    expect(CartSchema.shape.state.safeParse({items: []}).success).toBe(true);
    expect(
      CartSchema.shape.actions.shape.setItems.shape.payload.safeParse({
        items: [{productId: 'p1', name: 'Trail shoes', price: 99.99, quantity: 1}],
      }).success
    ).toBe(true);
    expect(
      CartSchema.shape.actions.shape.updateItemQuantity.shape.payload.safeParse({
        item: {productId: 'p1', name: 'Trail shoes', price: 99.99, quantity: 0},
      }).success
    ).toBe(false);
  });

  it('exports the correct catalog ID', () => {
    expect(THERMIDOR_CATALOG_ID).toBe('https://schema.thermidor.coveo.com/a2-ui/catalog.json');
  });

  it('props schema componentType literals match the component contract values', () => {
    expect(ProductCarouselPropsSchema.shape.componentType.value).toBe(
      ProductCarouselSchema.shape.componentType.value
    );
  });
});
