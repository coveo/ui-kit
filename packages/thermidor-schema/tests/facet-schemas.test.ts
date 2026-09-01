import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {describe, expect, it} from 'vitest';
import {
  CategoryFacetSchema,
  ComponentContractsSchema,
  DateFacetSchema,
  FacetManagerSchema,
  NumericFacetSchema,
  NumericFacetStateSchema,
  RegularFacetSchema,
} from '../src/index.js';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaDirectory = path.join(packageRoot, 'schema');
const componentsDirectory = path.join(schemaDirectory, 'components');
const definitionsDirectory = path.join(schemaDirectory, 'definitions');
const baseDirectory = path.join(schemaDirectory, 'base');

const DRAFT_2020_12 = 'https://json-schema.org/draft/2020-12/schema';
const BASE_COMPONENT_ID = 'https://schema.thermidor.coveo.com/base/component.schema.json';
const FACET_VALUE_STATE_ID =
  'https://schema.thermidor.coveo.com/definitions/facet-value-state.schema.json';
const SELECTABLE_FACET_VALUE_STATE_ID =
  'https://schema.thermidor.coveo.com/definitions/selectable-facet-value-state.schema.json';

async function readSchema(filePath: string): Promise<Record<string, any>> {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

const facets = [
  {fileName: 'regular-facet.schema.json', componentType: 'regular-facet', zod: RegularFacetSchema},
  {fileName: 'numeric-facet.schema.json', componentType: 'numeric-facet', zod: NumericFacetSchema},
  {fileName: 'date-facet.schema.json', componentType: 'date-facet', zod: DateFacetSchema},
  {
    fileName: 'category-facet.schema.json',
    componentType: 'category-facet',
    zod: CategoryFacetSchema,
  },
] as const;

const facetSchemas = await Promise.all(
  facets.map(async (facet) => ({
    ...facet,
    schema: await readSchema(path.join(componentsDirectory, facet.fileName)),
  }))
);

function collectRefs(node: unknown, refs: Set<string>): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      collectRefs(item, refs);
    }
    return;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (key === '$ref' && typeof value === 'string') {
        refs.add(value);
      } else {
        collectRefs(value, refs);
      }
    }
  }
}

describe('facet schema conventions', () => {
  for (const {fileName, componentType, schema} of facetSchemas) {
    describe(fileName, () => {
      it('declares JSON Schema draft 2020-12 via $schema', () => {
        expect(schema.$schema).toBe(DRAFT_2020_12);
      });

      it('sets $id to the file basename under /components/', () => {
        expect(typeof schema.$id).toBe('string');
        expect(schema.$id.endsWith(`/components/${fileName}`)).toBe(true);
      });

      it('references base/component.schema.json through the top-level allOf', () => {
        expect(Array.isArray(schema.allOf)).toBe(true);
        const refs = (schema.allOf as Array<{$ref?: string}>).map((entry) => entry.$ref);
        expect(refs).toContain(BASE_COMPONENT_ID);
      });

      it('constrains componentType to the expected constant', () => {
        expect(schema.properties?.componentType?.const).toBe(componentType);
      });

      it('sets additionalProperties to false on the document root', () => {
        expect(schema.additionalProperties).toBe(false);
      });

      // Only regular facet references FacetValueState (idle/selected/excluded).
      // Numeric and date reference SelectableFacetValueState; category uses no state enum.
      if (componentType === 'regular-facet') {
        it('references the shared FacetValueState definition', () => {
          const refs = new Set<string>();
          collectRefs(schema, refs);
          expect(refs.has(FACET_VALUE_STATE_ID)).toBe(true);
        });
      }
      if (componentType === 'numeric-facet' || componentType === 'date-facet') {
        it('references the shared SelectableFacetValueState definition', () => {
          const refs = new Set<string>();
          collectRefs(schema, refs);
          expect(refs.has(SELECTABLE_FACET_VALUE_STATE_ID)).toBe(true);
        });
      }
    });
  }

  it('category-facet top-level allOf contains exactly one base component reference', () => {
    const category = facetSchemas.find((facet) => facet.componentType === 'category-facet')!;
    expect(category.schema.allOf).toHaveLength(1);
    expect(category.schema.allOf[0].$ref).toBe(BASE_COMPONENT_ID);
  });

  it('exposes the shared FacetValueState definition schema', async () => {
    const definition = await readSchema(
      path.join(definitionsDirectory, 'facet-value-state.schema.json')
    );
    expect(definition.$schema).toBe(DRAFT_2020_12);
    expect(definition.$id).toBe(FACET_VALUE_STATE_ID);
    expect(definition.title).toBe('FacetValueState');
    expect(definition.type).toBe('string');
    expect(definition.enum).toEqual(['idle', 'selected', 'excluded']);
  });
});

describe('facet componentType literals (generated Zod schemas)', () => {
  for (const {componentType, zod} of facets) {
    it(`${componentType} exposes the exact componentType literal`, () => {
      expect(zod.shape.componentType.value).toBe(componentType);
    });
  }
});

describe('facet discriminated-union membership', () => {
  for (const {componentType, zod} of facets) {
    it(`${componentType} appears as a ComponentContracts union member`, () => {
      const option = ComponentContractsSchema.options.find(
        (candidate: any) => candidate.shape.componentType.value === componentType
      );
      expect(option).toBe(zod);
    });
  }
});

describe('no facet generator or sub-controller is modeled (Requirement 5.5)', () => {
  const forbiddenComponentTypes = ['facet-generator', 'facet-sub-controller'];

  it('no facet schema declares a generator/sub-controller componentType', () => {
    for (const {schema} of facetSchemas) {
      expect(forbiddenComponentTypes).not.toContain(schema.properties?.componentType?.const);
    }
  });

  it('no ComponentContracts union member is a generator/sub-controller', () => {
    for (const option of ComponentContractsSchema.options) {
      expect(forbiddenComponentTypes).not.toContain((option as any).shape.componentType.value);
    }
  });
});

describe('numeric-facet domain example (Requirement 2.7)', () => {
  const ajv = new Ajv2020({allErrors: true, strict: false, validateFormats: true});
  addFormats(ajv);
  const registered = new Set<string>();

  const registerAll = async () => {
    const {readdir} = await import('node:fs/promises');
    const walk = async (directory: string): Promise<string[]> => {
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
    };
    for (const filePath of await walk(schemaDirectory)) {
      const schema = await readSchema(filePath);
      if (!registered.has(schema.$id)) {
        ajv.addSchema(schema);
        registered.add(schema.$id);
      }
    }
  };

  const baseNumericState = () => ({
    field: 'price',
    displayName: 'Price',
    values: [],
    customRange: null,
    hasActiveValues: false,
    canShowMoreValues: false,
    canShowLessValues: false,
  });

  it('accepts a numeric facet state with a valid domain and rejects a malformed one', async () => {
    await registerAll();
    const validate = ajv.getSchema(
      'https://schema.thermidor.coveo.com/components/numeric-facet.schema.json#/$defs/NumericFacetState'
    );
    expect(validate).toBeDefined();

    const validDomainState = baseNumericState();
    (validDomainState as Record<string, unknown>).domain = {min: 0, max: 100};
    const validResult = validate?.(validDomainState);
    expect(validResult, JSON.stringify(validate?.errors)).toBe(true);

    const malformedDomainState = baseNumericState();
    (malformedDomainState as Record<string, unknown>).domain = {min: 'zero', max: 100};
    expect(validate?.(malformedDomainState)).toBe(false);

    const validViaZod = NumericFacetStateSchema.safeParse(validDomainState).success;
    expect(validViaZod).toBe(true);
    const malformedViaZod = NumericFacetStateSchema.safeParse(malformedDomainState).success;
    expect(malformedViaZod).toBe(false);
  });
});

describe('facet-manager component (Requirement 5)', () => {
  it('references base/component.schema.json and fixes componentType to facet-manager', async () => {
    const schema = await readSchema(path.join(componentsDirectory, 'facet-manager.schema.json'));
    expect(schema.$schema).toBe(DRAFT_2020_12);
    expect(schema.$id.endsWith('/components/facet-manager.schema.json')).toBe(true);
    expect(Array.isArray(schema.allOf)).toBe(true);
    expect(schema.allOf).toHaveLength(1);
    expect(schema.allOf[0].$ref).toBe(BASE_COMPONENT_ID);
    expect(schema.properties?.componentType?.const).toBe('facet-manager');
    expect(schema.additionalProperties).toBe(false);
  });

  it('has a state with a required facetIds string array and no facet data', async () => {
    const schema = await readSchema(path.join(componentsDirectory, 'facet-manager.schema.json'));
    const state = schema.$defs?.FacetManagerState;
    expect(state?.type).toBe('object');
    expect(state?.required).toEqual(['facetIds']);
    expect(state?.properties?.facetIds?.type).toBe('array');
    expect(state?.properties?.facetIds?.items?.type).toBe('string');
    expect(state?.properties?.facetIds?.items?.pattern).toBe('^[a-z][a-z0-9-]*$');
    expect(state?.additionalProperties).toBe(false);
    // Owns only the ordering; no facet value/search state leaks in.
    expect(Object.keys(state?.properties ?? {})).toEqual(['facetIds']);
  });

  it('exposes an empty actions object (thin ordering authority, not an aggregate controller)', async () => {
    const schema = await readSchema(path.join(componentsDirectory, 'facet-manager.schema.json'));
    expect(schema.properties?.actions?.type).toBe('object');
    expect(schema.properties?.actions?.properties ?? {}).toEqual({});
    expect(schema.properties?.actions?.additionalProperties).toBe(false);
  });

  it('appears as a ComponentContracts union member', () => {
    const option = ComponentContractsSchema.options.find(
      (candidate: any) => candidate.shape.componentType.value === 'facet-manager'
    );
    expect(option).toBe(FacetManagerSchema);
  });
});

describe('catalog no longer carries a facetOrdering field (single source of truth)', () => {
  it('base/catalog.schema.json does not define a facetOrdering property', async () => {
    const catalog = await readSchema(path.join(baseDirectory, 'catalog.schema.json'));
    expect(catalog.properties?.facetOrdering).toBeUndefined();
  });
});
