import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {describe, expect, it} from 'vitest';
import {
  BundleDisplaySchema,
  BundleDisplayStateSchema,
  CartItemSchema,
  CartSchema,
  CartStateSchema,
  ComparisonTableSchema,
  ComparisonTableStateSchema,
  ComponentContractsSchema,
  NextActionsBarSchema,
  NextActionsStateSchema,
  ProductCarouselSchema,
  ProductListStateSchema,
  ProductSchema,
  SelectActionPayloadSchema,
  SetItemsPayloadSchema,
  UpdateItemQuantityPayloadSchema,
} from '../src/index.js';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaDirectory = path.join(packageRoot, 'schema');
const fixtureDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

async function loadJsonFiles(
  directory: string
): Promise<Array<{path: string; value: Record<string, unknown>}>> {
  const entries = await readdir(directory, {withFileTypes: true});
  const files: Array<{path: string; value: Record<string, unknown>}> = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await loadJsonFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push({path: entryPath, value: JSON.parse(await readFile(entryPath, 'utf8'))});
    }
  }
  return files;
}

const schemas = await loadJsonFiles(schemaDirectory);
const ajv = new Ajv2020({allErrors: true, strict: false, validateFormats: true});
addFormats(ajv);
for (const {path: schemaPath, value: schema} of schemas) {
  ajv.addSchema(schema);
  const fileUrl = new URL(
    path.relative(schemaDirectory, schemaPath).split(path.sep).join('/'),
    'https://schema.thermidor.coveo.com/'
  ).href;
  if (fileUrl !== (schema as any).$id) {
    ajv.addSchema({$id: fileUrl, $ref: (schema as any).$id});
  }
}

const fixtures = [
  {
    file: 'product.valid.json',
    schema: ProductSchema,
    schemaId: 'https://schema.thermidor.coveo.com/definitions/product.schema.json',
    valid: true,
  },
  {
    file: 'product.invalid-extra-property.json',
    schema: ProductSchema,
    schemaId: 'https://schema.thermidor.coveo.com/definitions/product.schema.json',
    valid: false,
  },
  {
    file: 'product.invalid-child.json',
    schema: ProductSchema,
    schemaId: 'https://schema.thermidor.coveo.com/definitions/product.schema.json',
    valid: false,
  },
  {
    file: 'cart-item.valid.json',
    schema: CartItemSchema,
    schemaId: 'https://schema.thermidor.coveo.com/definitions/cart-item.schema.json',
    valid: true,
  },
  {
    file: 'cart-item.invalid-quantity.json',
    schema: CartItemSchema,
    schemaId: 'https://schema.thermidor.coveo.com/definitions/cart-item.schema.json',
    valid: false,
  },
  {
    file: 'product-list-state.valid.json',
    schema: ProductListStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/product-carousel.schema.json#/$defs/ProductListState',
    valid: true,
  },
  {
    file: 'cart-state.valid.json',
    schema: CartStateSchema,
    schemaId: 'https://schema.thermidor.coveo.com/components/cart.schema.json#/$defs/CartState',
    valid: true,
  },
  {
    file: 'set-items-payload.valid.json',
    schema: SetItemsPayloadSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/cart.schema.json#/$defs/SetItemsAction/properties/payload',
    valid: true,
  },
  {
    file: 'set-items-payload.invalid-extra-property.json',
    schema: SetItemsPayloadSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/cart.schema.json#/$defs/SetItemsAction/properties/payload',
    valid: false,
  },
  {
    file: 'update-item-quantity-payload.valid.json',
    schema: UpdateItemQuantityPayloadSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/cart.schema.json#/$defs/UpdateItemQuantityAction/properties/payload',
    valid: true,
  },
  {
    file: 'update-item-quantity-payload.invalid-missing-item.json',
    schema: UpdateItemQuantityPayloadSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/cart.schema.json#/$defs/UpdateItemQuantityAction/properties/payload',
    valid: false,
  },
  {
    file: 'next-actions-state.valid.json',
    schema: NextActionsStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/next-actions-bar.schema.json#/$defs/NextActionsState',
    valid: true,
  },
  {
    file: 'next-actions-state.invalid-type.json',
    schema: NextActionsStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/next-actions-bar.schema.json#/$defs/NextActionsState',
    valid: false,
  },
  {
    file: 'bundle-display-state.valid.json',
    schema: BundleDisplayStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/bundle-display.schema.json#/$defs/BundleDisplayState',
    valid: true,
  },
  {
    file: 'bundle-display-state.invalid-missing-label.json',
    schema: BundleDisplayStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/bundle-display.schema.json#/$defs/BundleDisplayState',
    valid: false,
  },
  {
    file: 'comparison-table-state.valid.json',
    schema: ComparisonTableStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/comparison-table.schema.json#/$defs/ComparisonTableState',
    valid: true,
  },
  {
    file: 'comparison-table-state.invalid-missing-name.json',
    schema: ComparisonTableStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/comparison-table.schema.json#/$defs/ComparisonTableState',
    valid: false,
  },
  {
    file: 'select-action-payload.valid.json',
    schema: SelectActionPayloadSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/next-actions-bar.schema.json#/$defs/SelectActionAction/properties/payload',
    valid: true,
  },
  {
    file: 'select-action-payload.invalid-type.json',
    schema: SelectActionPayloadSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/next-actions-bar.schema.json#/$defs/SelectActionAction/properties/payload',
    valid: false,
  },
];

describe('generated Zod schemas match Ajv for all fixtures', () => {
  for (const fixture of fixtures) {
    it(`${fixture.file} → ${fixture.valid ? 'accepted' : 'rejected'}`, async () => {
      const value = JSON.parse(await readFile(path.join(fixtureDirectory, fixture.file), 'utf8'));
      const validate = ajv.getSchema(fixture.schemaId);
      expect(validate, `Ajv did not register ${fixture.schemaId}`).toBeDefined();
      expect(validate?.(value)).toBe(fixture.valid);
      expect(fixture.schema.safeParse(value).success).toBe(fixture.valid);
    });
  }
});

describe('component contract discriminated union', () => {
  it('accepts valid ProductCarousel contract', () => {
    const contract = {
      actions: {},
      componentType: 'product-carousel',
      state: {heading: 'Featured', products: []},
    };
    expect(ComponentContractsSchema.safeParse(contract).success).toBe(true);
  });

  it('accepts valid Cart contract', () => {
    const cartItem = {name: 'Kayak', price: 1, productId: 'kayak-001', quantity: 1};
    const contract = {
      actions: {
        setItems: {payload: {items: [cartItem]}},
        updateItemQuantity: {payload: {item: cartItem}},
      },
      componentType: 'cart',
      state: {items: [cartItem]},
    };
    expect(ComponentContractsSchema.safeParse(contract).success).toBe(true);
  });

  it('rejects cart contract with product-carousel componentType', () => {
    const cartItem = {name: 'Kayak', price: 1, productId: 'kayak-001', quantity: 1};
    const contract = {
      actions: {
        setItems: {payload: {items: [cartItem]}},
        updateItemQuantity: {payload: {item: cartItem}},
      },
      componentType: 'product-carousel',
      state: {items: [cartItem]},
    };
    expect(ComponentContractsSchema.safeParse(contract).success).toBe(false);
  });

  it('rejects unknown componentType value', () => {
    const contract = {
      actions: {},
      componentType: 'unknown-component',
      state: {products: []},
    };
    expect(ComponentContractsSchema.safeParse(contract).success).toBe(false);
  });

  it('accesses nested action payload schemas', () => {
    expect(
      CartSchema.shape.actions.shape.setItems.shape.payload.safeParse({items: []}).success
    ).toBe(true);
  });

  it('accepts valid NextActionsBar contract', () => {
    const contract = {
      actions: {selectAction: {payload: {text: 'test', type: 'followup'}}},
      componentType: 'next-actions-bar',
      state: {actions: [{text: 'Hello', type: 'followup'}]},
    };
    expect(ComponentContractsSchema.safeParse(contract).success).toBe(true);
  });

  it('accepts valid BundleDisplay contract', () => {
    const contract = {
      actions: {},
      componentType: 'bundle-display',
      state: {tiers: [{label: 'Budget', description: 'Cheap', slots: []}]},
    };
    expect(ComponentContractsSchema.safeParse(contract).success).toBe(true);
  });

  it('accepts valid ComparisonTable contract', () => {
    const contract = {
      actions: {},
      componentType: 'comparison-table',
      state: {
        products: [{productId: 'p1', name: 'Product', values: {}}],
        attributes: [{key: 'k', label: 'K'}],
      },
    };
    expect(ComponentContractsSchema.safeParse(contract).success).toBe(true);
  });
});
