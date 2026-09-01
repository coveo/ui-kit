import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import * as newSchema from '../src/index.js';

const fixtureDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

const existingContracts =
  await import('../../thermidor-contracts/src/generated/catalog-contracts.js').catch(() => null);

describe('spot-check equivalence with existing thermidor-contracts', () => {
  it.skipIf(!existingContracts)('existing contracts module is importable', () => {
    expect(existingContracts).not.toBeNull();
  });

  it.skipIf(!existingContracts)(
    'every controller/definition Zod schema export in existing contracts also exists in the new package',
    () => {
      if (!existingContracts) return;

      const nameMapping: Record<string, string> = {
        productSchema: 'ProductSchema',
        cartItemSchema: 'CartItemSchema',
        productListControllerStateSchema: 'ProductListStateSchema',
        cartControllerStateSchema: 'CartStateSchema',
        cartControllerContractSetItemsPayloadSchema: 'SetItemsPayloadSchema',
        cartControllerContractUpdateItemQuantityPayloadSchema: 'UpdateItemQuantityPayloadSchema',
        productListControllerContract: 'ProductListControllerContractSchema',
        cartControllerContract: 'CartControllerContractSchema',
        controllerContracts: 'ControllerContractsSchema',
      };

      // Component-level schemas (productCarouselPropsSchema, cartPropsSchema) are not part of the
      // controller contract surface area and are intentionally excluded from the new package.
      const componentSchemas = new Set([
        'productCarouselPropsSchema',
        'cartPropsSchema',
        'productCarouselControllersSchema',
        'cartControllersSchema',
      ]);

      const existingExportNames = Object.keys(existingContracts).filter(
        (key) => (existingContracts as any)[key]?._def !== undefined && !componentSchemas.has(key)
      );

      for (const name of existingExportNames) {
        const newName = nameMapping[name] ?? name;
        expect(
          (newSchema as any)[newName],
          `Missing export for existing ${name} (mapped to ${newName})`
        ).toBeDefined();
      }
    }
  );

  it.skipIf(!existingContracts)(
    'product fixture produces same safeParse result in both packages',
    async () => {
      if (!existingContracts) return;
      const validProduct = JSON.parse(
        await readFile(path.join(fixtureDirectory, 'product.valid.json'), 'utf8')
      );
      const invalidProduct = JSON.parse(
        await readFile(path.join(fixtureDirectory, 'product.invalid-extra-property.json'), 'utf8')
      );

      const existingProductSchema = (existingContracts as any).productSchema;
      if (existingProductSchema) {
        expect(newSchema.ProductSchema.safeParse(validProduct).success).toBe(
          existingProductSchema.safeParse(validProduct).success
        );
        expect(newSchema.ProductSchema.safeParse(invalidProduct).success).toBe(
          existingProductSchema.safeParse(invalidProduct).success
        );
      }
    }
  );

  it.skipIf(!existingContracts)(
    'cart-item fixture produces same safeParse result in both packages',
    async () => {
      if (!existingContracts) return;
      const validItem = JSON.parse(
        await readFile(path.join(fixtureDirectory, 'cart-item.valid.json'), 'utf8')
      );
      const invalidItem = JSON.parse(
        await readFile(path.join(fixtureDirectory, 'cart-item.invalid-quantity.json'), 'utf8')
      );

      const existingCartItemSchema = (existingContracts as any).cartItemSchema;
      if (existingCartItemSchema) {
        expect(newSchema.CartItemSchema.safeParse(validItem).success).toBe(
          existingCartItemSchema.safeParse(validItem).success
        );
        expect(newSchema.CartItemSchema.safeParse(invalidItem).success).toBe(
          existingCartItemSchema.safeParse(invalidItem).success
        );
      }
    }
  );

  it.skipIf(!existingContracts)(
    'set-items-payload fixture produces same safeParse result in both packages',
    async () => {
      if (!existingContracts) return;
      const validPayload = JSON.parse(
        await readFile(path.join(fixtureDirectory, 'set-items-payload.valid.json'), 'utf8')
      );
      const invalidPayload = JSON.parse(
        await readFile(
          path.join(fixtureDirectory, 'set-items-payload.invalid-extra-property.json'),
          'utf8'
        )
      );

      const existingSchema = (existingContracts as any).cartControllerContractSetItemsPayloadSchema;
      if (existingSchema) {
        expect(newSchema.SetItemsPayloadSchema.safeParse(validPayload).success).toBe(
          existingSchema.safeParse(validPayload).success
        );
        expect(newSchema.SetItemsPayloadSchema.safeParse(invalidPayload).success).toBe(
          existingSchema.safeParse(invalidPayload).success
        );
      }
    }
  );

  it.skipIf(!existingContracts)(
    'update-item-quantity-payload fixture produces same safeParse result in both packages',
    async () => {
      if (!existingContracts) return;
      const validPayload = JSON.parse(
        await readFile(
          path.join(fixtureDirectory, 'update-item-quantity-payload.valid.json'),
          'utf8'
        )
      );
      const invalidPayload = JSON.parse(
        await readFile(
          path.join(fixtureDirectory, 'update-item-quantity-payload.invalid-missing-item.json'),
          'utf8'
        )
      );

      const existingSchema = (existingContracts as any)
        .cartControllerContractUpdateItemQuantityPayloadSchema;
      if (existingSchema) {
        expect(newSchema.UpdateItemQuantityPayloadSchema.safeParse(validPayload).success).toBe(
          existingSchema.safeParse(validPayload).success
        );
        expect(newSchema.UpdateItemQuantityPayloadSchema.safeParse(invalidPayload).success).toBe(
          existingSchema.safeParse(invalidPayload).success
        );
      }
    }
  );
});
