import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {
  ProductSchema,
  CartItemSchema,
  CartStateSchema,
  ProductCarouselStateSchema,
  NextActionsStateSchema,
  BundleDisplayStateSchema,
  ComparisonTableStateSchema,
  SetItemsPayloadSchema,
  UpdateItemQuantityPayloadSchema,
  SelectActionPayloadSchema,
  ComponentContractsSchema,
} from '../src/index.js';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Property 2: Zod generation idempotence
 * Validates: Requirements 10.2, 10.6
 */
describe('Zod generation idempotence', () => {
  // Spawns a TS-stripping node process that regenerates the Zod contracts,
  // which routinely runs past vitest's 5s default on CI runners.
  it('generation script is idempotent (running twice produces identical output)', () => {
    execFileSync(
      'node',
      ['--experimental-strip-types', path.join(packageRoot, 'scripts/generate-zod.ts'), '--check'],
      {
        cwd: packageRoot,
        stdio: 'pipe',
      }
    );
  }, 60_000);
});

/**
 * Property 8: Data type backward compatibility
 * Validates: Requirements 11.1, 11.2, 11.3, 11.5
 */
describe('data type backward compatibility', () => {
  it('Product schema structure is unchanged', () => {
    const validProduct = {
      permanentid: 'p1',
      ec_name: 'Trail shoes',
      ec_price: 99.99,
      ec_rating: 4.5,
      additionalFields: {custom: 'field'},
    };
    expect(ProductSchema.safeParse(validProduct).success).toBe(true);
  });

  it('CartItem schema structure is unchanged', () => {
    expect(
      CartItemSchema.safeParse({productId: 'p1', name: 'Widget', price: 10, quantity: 2}).success
    ).toBe(true);
  });

  it('CartState schema structure is unchanged', () => {
    expect(
      CartStateSchema.safeParse({items: [{productId: 'p1', name: 'X', price: 1, quantity: 1}]})
        .success
    ).toBe(true);
  });

  it('ProductCarouselState schema structure is unchanged', () => {
    expect(
      ProductCarouselStateSchema.safeParse({
        heading: 'Shoes',
        products: [{permanentid: 'p1', ec_name: 'Shoes', additionalFields: {}}],
      }).success
    ).toBe(true);
  });

  it('NextActionsState schema structure is unchanged', () => {
    expect(
      NextActionsStateSchema.safeParse({actions: [{text: 'hello', type: 'followup'}]}).success
    ).toBe(true);
  });

  it('SetItemsPayload schema structure is unchanged', () => {
    expect(
      SetItemsPayloadSchema.safeParse({
        items: [{productId: 'p1', name: 'X', price: 1, quantity: 1}],
      }).success
    ).toBe(true);
  });

  it('UpdateItemQuantityPayload schema structure is unchanged', () => {
    expect(
      UpdateItemQuantityPayloadSchema.safeParse({
        item: {productId: 'p1', name: 'X', price: 1, quantity: 1},
      }).success
    ).toBe(true);
  });

  it('SelectActionPayload schema structure is unchanged', () => {
    expect(SelectActionPayloadSchema.safeParse({text: 'search', type: 'search'}).success).toBe(
      true
    );
  });

  it('BundleDisplayState schema structure is unchanged', () => {
    expect(
      BundleDisplayStateSchema.safeParse({
        tiers: [
          {
            label: 'Budget',
            description: 'Cheap',
            slots: [{categoryLabel: 'Board', surfaceRef: 'pl-1'}],
          },
        ],
      }).success
    ).toBe(true);
  });

  it('ComparisonTableState schema structure is unchanged', () => {
    expect(
      ComparisonTableStateSchema.safeParse({
        products: [{productId: 'p1', name: 'P', values: {}}],
        attributes: [{key: 'k', label: 'K'}],
      }).success
    ).toBe(true);
  });
});

/**
 * Property 9: Controllers property rejection
 * Validates: Requirements 1.6, 10.5
 */
describe('controllers property rejection', () => {
  it('rejects a component document with a controllers property', () => {
    const documentWithControllers = {
      componentType: 'cart',
      state: {items: []},
      actions: {
        setItems: {payload: {items: []}},
        updateItemQuantity: {payload: {item: {productId: 'p1', name: 'X', price: 1, quantity: 1}}},
      },
      controllers: {cartController: {controllerId: 'cart-1'}},
    };
    expect(ComponentContractsSchema.safeParse(documentWithControllers).success).toBe(false);
  });

  it('rejects any document with controllers even if other fields are valid', () => {
    const withControllers = {
      componentType: 'product-carousel',
      state: {products: []},
      actions: {},
      controllers: {},
    };
    expect(ComponentContractsSchema.safeParse(withControllers).success).toBe(false);
  });
});
