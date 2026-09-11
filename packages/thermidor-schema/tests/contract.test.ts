import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {describe, expect, it} from 'vitest';
import {
  BundleDisplayStateSchema,
  CategoryFacetStateSchema,
  ComparisonTableStateSchema,
  ComponentContractsSchema,
  DateFacetStateSchema,
  FacetManagerStateSchema,
  LayoutStackStateSchema,
  NextActionsBarSchema,
  NextActionsStateSchema,
  PageSizeStateSchema,
  QuerySummaryStateSchema,
  NumericFacetStateSchema,
  ProductCarouselStateSchema,
  ProductListStateSchema,
  ProductSummaryStateSchema,
  ProductSchema,
  RegularFacetStateSchema,
  SelectActionPayloadSchema,
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
    file: 'product-carousel-state.valid.json',
    schema: ProductCarouselStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/product-carousel.schema.json#/$defs/ProductCarouselState',
    valid: true,
  },
  {
    file: 'product-list-state.valid.json',
    schema: ProductListStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/product-list.schema.json#/$defs/ProductListState',
    valid: true,
  },
  {
    file: 'product-summary-state.valid.json',
    schema: ProductSummaryStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/product-summary.schema.json#/$defs/ProductSummaryState',
    valid: true,
  },
  {
    file: 'product-summary-state.valid-null-product.json',
    schema: ProductSummaryStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/product-summary.schema.json#/$defs/ProductSummaryState',
    valid: true,
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
    file: 'comparison-table-state.invalid-missing-heading.json',
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
  {
    file: 'regular-facet-state.valid.json',
    schema: RegularFacetStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/regular-facet.schema.json#/$defs/RegularFacetState',
    valid: true,
  },
  {
    file: 'regular-facet-state.invalid-extra-property.json',
    schema: RegularFacetStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/regular-facet.schema.json#/$defs/RegularFacetState',
    valid: false,
  },
  {
    file: 'regular-facet-state.invalid-state-value.json',
    schema: RegularFacetStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/regular-facet.schema.json#/$defs/RegularFacetState',
    valid: false,
  },
  {
    file: 'numeric-facet-state.valid.json',
    schema: NumericFacetStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/numeric-facet.schema.json#/$defs/NumericFacetState',
    valid: true,
  },
  {
    file: 'numeric-facet-state.invalid-negative-results.json',
    schema: NumericFacetStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/numeric-facet.schema.json#/$defs/NumericFacetState',
    valid: false,
  },
  {
    file: 'numeric-facet-state.invalid-state-value.json',
    schema: NumericFacetStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/numeric-facet.schema.json#/$defs/NumericFacetState',
    valid: false,
  },
  {
    file: 'date-facet-state.valid.json',
    schema: DateFacetStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/date-facet.schema.json#/$defs/DateFacetState',
    valid: true,
  },
  {
    file: 'date-facet-state.invalid-extra-property.json',
    schema: DateFacetStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/date-facet.schema.json#/$defs/DateFacetState',
    valid: false,
  },
  {
    file: 'date-facet-state.invalid-negative-results.json',
    schema: DateFacetStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/date-facet.schema.json#/$defs/DateFacetState',
    valid: false,
  },
  {
    file: 'category-facet-state.valid.json',
    schema: CategoryFacetStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/category-facet.schema.json#/$defs/CategoryFacetState',
    valid: true,
  },
  {
    file: 'category-facet-state.invalid-extra-property.json',
    schema: CategoryFacetStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/category-facet.schema.json#/$defs/CategoryFacetState',
    valid: false,
  },
  {
    file: 'category-facet-state.invalid-query-too-long.json',
    schema: CategoryFacetStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/category-facet.schema.json#/$defs/CategoryFacetState',
    valid: false,
  },
  {
    file: 'facet-manager-state.valid.json',
    schema: FacetManagerStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/facet-manager.schema.json#/$defs/FacetManagerState',
    valid: true,
  },
  {
    file: 'facet-manager-state.invalid-extra-property.json',
    schema: FacetManagerStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/facet-manager.schema.json#/$defs/FacetManagerState',
    valid: false,
  },
  {
    file: 'layout-stack-state.valid.json',
    schema: LayoutStackStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/layout-stack.schema.json#/$defs/LayoutStackState',
    valid: true,
  },
  {
    file: 'layout-stack-state.invalid-extra-property.json',
    schema: LayoutStackStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/layout-stack.schema.json#/$defs/LayoutStackState',
    valid: false,
  },
  {
    file: 'query-summary-state.valid.json',
    schema: QuerySummaryStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/query-summary.schema.json#/$defs/QuerySummaryState',
    valid: true,
  },
  {
    file: 'query-summary-state.invalid-missing-field.json',
    schema: QuerySummaryStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/query-summary.schema.json#/$defs/QuerySummaryState',
    valid: false,
  },
  {
    file: 'page-size-state.valid.json',
    schema: PageSizeStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/page-size.schema.json#/$defs/PageSizeState',
    valid: true,
  },
  {
    file: 'page-size-state.invalid-missing-page-size.json',
    schema: PageSizeStateSchema,
    schemaId:
      'https://schema.thermidor.coveo.com/components/page-size.schema.json#/$defs/PageSizeState',
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
      NextActionsBarSchema.shape.actions.shape.selectAction.shape.payload.safeParse({
        text: 'test',
        type: 'followup',
      }).success
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
        heading: 'Comparison',
        summary: 'A short summary.',
        products: [{productId: 'p1', name: 'Product', values: {k: 'v'}}],
        attributes: [{key: 'k', label: 'K'}],
      },
    };
    expect(ComponentContractsSchema.safeParse(contract).success).toBe(true);
  });

  it('accepts valid LayoutStack contract (empty state, no actions)', () => {
    const contract = {actions: {}, componentType: 'layout-stack', state: {}};
    expect(ComponentContractsSchema.safeParse(contract).success).toBe(true);
  });

  it('accepts valid QuerySummary contract', () => {
    const contract = {
      actions: {},
      componentType: 'query-summary',
      state: {query: 'Water Sports', firstIndex: 1, lastIndex: 12, totalEntries: 43},
    };
    expect(ComponentContractsSchema.safeParse(contract).success).toBe(true);
  });

  it('accepts valid PageSize contract with a setPageSize action', () => {
    const contract = {
      actions: {setPageSize: {payload: {pageSize: 24}}},
      componentType: 'page-size',
      state: {pageSize: 24},
    };
    expect(ComponentContractsSchema.safeParse(contract).success).toBe(true);
  });
});
