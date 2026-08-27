import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import fc from 'fast-check';
import type {ZodTypeAny} from 'zod';
import {describe, expect, it} from 'vitest';
import {
  CategoryFacetSchema,
  ComponentContractsSchema,
  DateFacetSchema,
  NumericFacetSchema,
  RegularFacetSchema,
} from '../src/index.js';

/**
 * Property 4: componentType discriminant enforcement
 *
 * For ANY facet schema and ANY string not equal to that schema's
 * `componentType` constant, an otherwise-valid document carrying that string
 * as `componentType` is rejected by the facet schema and by the
 * ComponentContracts discriminated union.
 *
 * Feature: commerce-facet-schemas, Property 4: componentType discriminant enforcement
 *
 * Validates: Requirements 3.9
 */
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaDirectory = path.join(packageRoot, 'schema');

const ajv = new Ajv2020({allErrors: true, strict: false, validateFormats: true});
addFormats(ajv);

const registered = new Set<string>();
async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, {withFileTypes: true});
  const files: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(entryPath);
    }
  }
  return files;
}
for (const filePath of await walk(schemaDirectory)) {
  const schema = JSON.parse(await readFile(filePath, 'utf8'));
  if (!registered.has(schema.$id)) {
    ajv.addSchema(schema);
    registered.add(schema.$id);
  }
}

const NUM_RUNS = 100;

const VALID_FACET_COMPONENT_TYPES = [
  'regular-facet',
  'numeric-facet',
  'date-facet',
  'category-facet',
] as const;

// Other real componentTypes that must not accidentally be produced as the
// "arbitrary other" string, so that the negative case remains meaningful.
const OTHER_REAL_COMPONENT_TYPES = [
  'product-carousel',
  'cart',
  'next-actions-bar',
  'bundle-display',
  'comparison-table',
];

const RESERVED_COMPONENT_TYPES = new Set<string>([
  ...VALID_FACET_COMPONENT_TYPES,
  ...OTHER_REAL_COMPONENT_TYPES,
]);

interface FacetCase {
  componentType: (typeof VALID_FACET_COMPONENT_TYPES)[number];
  /**
   * Ajv $id targeting the facet's `componentType` subschema (the const that
   * encodes the discriminant). Validating the full facet document against the
   * facet root is not feasible here: the root declares `additionalProperties:
   * false` while the base component's `componentId`/`displayName` arrive via
   * `allOf`, so Ajv reports them as additional properties. We therefore
   * exercise the discriminant directly through Ajv, and rely on the generated
   * Zod schemas (which fold the base component in) for the full-document
   * rejection.
   */
  componentTypeSchemaId: string;
  zod: ZodTypeAny;
  /**
   * An otherwise-valid facet contract (shaped as the generated Zod schema
   * encodes it: componentType, state, actions) carrying the correct
   * componentType constant.
   */
  validDocument: () => Record<string, unknown>;
}

const facetCases: FacetCase[] = [
  {
    componentType: 'regular-facet',
    componentTypeSchemaId:
      'https://schema.thermidor.coveo.com/components/regular-facet.schema.json#/properties/componentType',
    zod: RegularFacetSchema,
    validDocument: () => ({
      componentType: 'regular-facet',
      state: {
        field: 'brand',
        displayName: 'Brand',
        values: [{value: 'Coveo', numberOfResults: 42, state: 'selected'}],
        hasActiveValues: true,
        canShowMoreValues: true,
        canShowLessValues: false,
        facetSearch: {query: 'cov', canShowMoreResults: true, results: []},
      },
      actions: {
        toggleSelect: {payload: {value: 'Coveo'}},
        toggleExclude: {payload: {value: 'Coveo'}},
        toggleSingleSelect: {payload: {value: 'Coveo'}},
        toggleSingleExclude: {payload: {value: 'Coveo'}},
        clearAllActiveValues: {payload: null},
        search: {payload: {query: 'cov'}},
        showMoreSearchResults: {payload: null},
        clearSearch: {payload: null},
        showMoreValues: {payload: null},
        showLessValues: {payload: null},
      },
    }),
  },
  {
    componentType: 'numeric-facet',
    componentTypeSchemaId:
      'https://schema.thermidor.coveo.com/components/numeric-facet.schema.json#/properties/componentType',
    zod: NumericFacetSchema,
    validDocument: () => ({
      componentType: 'numeric-facet',
      state: {
        field: 'price',
        displayName: 'Price',
        values: [{start: 0, end: 100, numberOfResults: 5, state: 'idle'}],
        customRange: null,
        hasActiveValues: false,
        canShowMoreValues: false,
        canShowLessValues: false,
      },
      actions: {
        toggleSelect: {payload: {start: 0, end: 100}},
        toggleSingleSelect: {payload: {start: 0, end: 100}},
        clearAllActiveValues: {payload: null},
        applyCustomRange: {payload: {start: 0, end: 100}},
        showMoreValues: {payload: null},
        showLessValues: {payload: null},
      },
    }),
  },
  {
    componentType: 'date-facet',
    componentTypeSchemaId:
      'https://schema.thermidor.coveo.com/components/date-facet.schema.json#/properties/componentType',
    zod: DateFacetSchema,
    validDocument: () => ({
      componentType: 'date-facet',
      state: {
        field: 'date',
        displayName: 'Date',
        values: [
          {
            start: '2024-01-01',
            end: '2024-12-31',
            numberOfResults: 7,
            state: 'selected',
          },
        ],
        customRange: null,
        hasActiveValues: true,
        canShowMoreValues: true,
        canShowLessValues: false,
      },
      actions: {
        toggleSelect: {
          payload: {start: '2024-01-01', end: '2024-12-31'},
        },
        toggleSingleSelect: {
          payload: {start: '2024-01-01', end: '2024-12-31'},
        },
        clearAllActiveValues: {payload: null},
        applyCustomRange: {
          payload: {start: '2024-01-01', end: '2024-12-31'},
        },
        showMoreValues: {payload: null},
        showLessValues: {payload: null},
      },
    }),
  },
  {
    componentType: 'category-facet',
    componentTypeSchemaId:
      'https://schema.thermidor.coveo.com/components/category-facet.schema.json#/properties/componentType',
    zod: CategoryFacetSchema,
    validDocument: () => ({
      componentType: 'category-facet',
      state: {
        field: 'category',
        displayName: 'Category',
        values: {
          ancestry: [],
          selected: null,
          children: [{path: ['Electronics'], value: 'Electronics', numberOfResults: 12}],
        },
        canShowMoreValues: false,
        canShowLessValues: false,
        facetSearch: {query: '', canShowMoreResults: false, results: []},
      },
      actions: {
        selectPath: {payload: {path: ['Electronics']}},
        clearSelectedPath: {payload: null},
        search: {payload: {query: 'elec'}},
        showMoreSearchResults: {payload: null},
        clearSearch: {payload: null},
        showMoreValues: {payload: null},
        showLessValues: {payload: null},
      },
    }),
  },
];

/**
 * Arbitrary strings that are guaranteed NOT to equal any valid facet
 * componentType constant (nor any other real componentType).
 */
const otherComponentTypeArb = fc
  .string({minLength: 0, maxLength: 40})
  .filter((value) => !RESERVED_COMPONENT_TYPES.has(value));

describe('Feature: commerce-facet-schemas, Property 4: componentType discriminant enforcement', () => {
  for (const facet of facetCases) {
    describe(facet.componentType, () => {
      it('rejects an otherwise-valid document whose componentType differs (Ajv + Zod)', () => {
        const validateComponentType = ajv.getSchema(facet.componentTypeSchemaId);
        expect(
          validateComponentType,
          `Ajv did not register ${facet.componentTypeSchemaId}`
        ).toBeDefined();

        // Sanity: the untouched document is accepted by the generated Zod facet
        // schema and by the union, so failures below are attributable solely to
        // the componentType discriminant. Ajv accepts the correct constant.
        const baseline = facet.validDocument();
        expect(facet.zod.safeParse(baseline).success).toBe(true);
        expect(ComponentContractsSchema.safeParse(baseline).success).toBe(true);
        expect(validateComponentType?.(facet.componentType)).toBe(true);

        fc.assert(
          fc.property(otherComponentTypeArb, (otherComponentType) => {
            const document = facet.validDocument();
            document.componentType = otherComponentType;

            // Rejected by the facet schema's componentType const (Ajv 2020-12):
            // the discriminant no longer matches the required constant.
            expect(validateComponentType?.(otherComponentType)).toBe(false);

            // Rejected by the generated Zod facet schema (folds in the base
            // component; the literal componentType no longer matches).
            expect(facet.zod.safeParse(document).success).toBe(false);

            // Rejected by the ComponentContracts discriminated union: it does
            // not match the intended member.
            expect(ComponentContractsSchema.safeParse(document).success).toBe(false);
          }),
          {numRuns: NUM_RUNS}
        );
      });
    });
  }
});
