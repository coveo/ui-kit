import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import fc from 'fast-check';
import {describe, expect, it} from 'vitest';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaDirectory = path.join(packageRoot, 'schema');

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
  if (fileUrl !== (schema as {$id?: string}).$id) {
    ajv.addSchema({$id: fileUrl, $ref: (schema as {$id?: string}).$id});
  }
}

const catalogSchemaId = 'https://schema.thermidor.coveo.com/base/catalog.schema.json';
const facetComponentTypes = [
  'regular-facet',
  'numeric-facet',
  'date-facet',
  'category-facet',
] as const;
const facetComponentTypeSet = new Set<string>(facetComponentTypes);

type FacetComponentType = (typeof facetComponentTypes)[number];

interface CatalogComponent {
  componentId: string;
  displayName: string;
  componentType: string;
  state: Record<string, unknown>;
  actions: Record<string, unknown>;
}

interface Catalog {
  catalogId: string;
  version: string;
  components: CatalogComponent[];
}

type ReferentialIntegrityResult =
  | {valid: true; ordering: string[]}
  | {valid: false; unmatchedIds: string[]};

function isFacetComponent(component: CatalogComponent): boolean {
  return facetComponentTypeSet.has(component.componentType);
}

/**
 * Referential-integrity validator for the facet-manager component's
 * state.facetIds (Requirement 5.6).
 *
 * JSON Schema draft 2020-12 cannot generically assert that each facetIds entry
 * equals some catalog component's componentId, so per design.md this rule is
 * enforced by a validation function in the test suite. The validator reads the
 * facet-manager component's state.facetIds, collects the facet catalog
 * components' componentIds, and checks that every ordering identifier is a
 * member. On success it returns the ordering unchanged; on mismatch it returns
 * a failure naming every unmatched identifier and produces NO reordered or
 * partial representation.
 */
function validateFacetManagerReferentialIntegrity(catalog: Catalog): ReferentialIntegrityResult {
  const orderingComponent = catalog.components.find(
    (component) => component.componentType === 'facet-manager'
  );
  const facetIds = (orderingComponent?.state.facetIds as string[] | undefined) ?? [];
  const componentIds = new Set(
    catalog.components.filter(isFacetComponent).map((component) => component.componentId)
  );
  const unmatchedIds = facetIds.filter((id) => !componentIds.has(id));
  if (unmatchedIds.length > 0) {
    return {valid: false, unmatchedIds};
  }
  return {valid: true, ordering: facetIds};
}

/**
 * Feature: commerce-facet-schemas, Property 6: Facet ordering referential integrity
 *
 * For any catalog with a set of components and a facet-manager component whose
 * state.facetIds lists identifiers, the representation is accepted IF AND ONLY
 * IF every identifier in facetIds matches the componentId of some facet
 * component in the catalog. When an identifier has no matching component,
 * validation FAILS and identifies that unmatched identifier, producing no
 * reordered or partial representation.
 *
 * Validates: Requirements 5.6
 */
describe('Feature: commerce-facet-schemas, Property 6: Facet ordering referential integrity', () => {
  const NUM_RUNS = 100;

  const componentIdArb = fc
    .tuple(
      fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
      fc.string({
        unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
        maxLength: 12,
      })
    )
    .map(([head, tail]) => `${head}${tail}`);

  function buildFacetComponent(
    componentId: string,
    componentType: FacetComponentType
  ): CatalogComponent {
    return {
      componentId,
      displayName: 'Facet',
      componentType,
      state: {},
      actions: {},
    };
  }

  function buildNonFacetComponent(componentId: string): CatalogComponent {
    return {
      componentId,
      displayName: 'Product Carousel',
      componentType: 'product-carousel',
      state: {products: []},
      actions: {},
    };
  }

  function buildOrderingComponent(facetIds: string[]): CatalogComponent {
    return {
      componentId: 'facet-manager',
      displayName: 'Facet Manager',
      componentType: 'facet-manager',
      state: {facetIds},
      actions: {},
    };
  }

  function buildCatalog(
    facetComponentIds: string[],
    facetIds: string[],
    additionalComponents: CatalogComponent[] = []
  ): Catalog {
    return {
      catalogId: 'a2ui-commerce-v1',
      version: '0.1.0',
      components: [
        ...additionalComponents,
        ...facetComponentIds.map((componentId, index) =>
          buildFacetComponent(componentId, facetComponentTypes[index % facetComponentTypes.length]!)
        ),
        buildOrderingComponent(facetIds),
      ],
    };
  }

  it('accepts facet identifiers for every supported facet component type', () => {
    const facetComponents = facetComponentTypes.map((componentType) =>
      buildFacetComponent(`${componentType}-id`, componentType)
    );
    const facetIds = facetComponents.map((component) => component.componentId);
    const catalog = buildCatalog([], facetIds, facetComponents);

    const result = validateFacetManagerReferentialIntegrity(catalog);

    expect(result).toStrictEqual({valid: true, ordering: facetIds});
  });

  it('rejects an identifier that only matches a non-facet component', () => {
    const nonFacetComponentId = 'product-carousel';
    const catalog = buildCatalog(
      [],
      [nonFacetComponentId],
      [buildNonFacetComponent(nonFacetComponentId)]
    );

    const result = validateFacetManagerReferentialIntegrity(catalog);

    expect(result).toStrictEqual({valid: false, unmatchedIds: [nonFacetComponentId]});
  });

  it('accepts iff every facetIds entry matches a facet component, and names unmatched ids otherwise', () => {
    const validate = ajv.getSchema(catalogSchemaId);
    expect(validate, `Ajv did not register ${catalogSchemaId}`).toBeDefined();

    fc.assert(
      fc.property(
        fc.uniqueArray(componentIdArb, {minLength: 0, maxLength: 8}),
        fc.array(componentIdArb, {minLength: 0, maxLength: 8}),
        (presentIds, extraIds) => {
          fc.pre(!presentIds.includes('facet-manager'));
          fc.pre(!extraIds.includes('facet-manager'));

          const validOrdering = presentIds;
          const validCatalog = buildCatalog(presentIds, validOrdering);

          expect(validate?.(validCatalog)).toBe(true);

          const validResult = validateFacetManagerReferentialIntegrity(validCatalog);
          expect(validResult.valid).toBe(true);
          if (validResult.valid) {
            expect(validResult.ordering).toStrictEqual(validOrdering);
          }

          const mixedOrdering = [...validOrdering, ...extraIds];
          const mixedCatalog = buildCatalog(presentIds, mixedOrdering);
          const mixedResult = validateFacetManagerReferentialIntegrity(mixedCatalog);

          const facetIdSet = new Set(presentIds);
          const expectedUnmatched = mixedOrdering.filter((id) => !facetIdSet.has(id));

          if (expectedUnmatched.length === 0) {
            expect(mixedResult.valid).toBe(true);
          } else {
            expect(mixedResult.valid).toBe(false);
            if (!mixedResult.valid) {
              expect(mixedResult.unmatchedIds).toStrictEqual(expectedUnmatched);
              expect(mixedResult).not.toHaveProperty('ordering');
            }
          }
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('fails and identifies a facetIds entry absent from catalog facet components', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(componentIdArb, {minLength: 0, maxLength: 6}),
        componentIdArb,
        (presentIds, candidateId) => {
          const facetIdSet = new Set(presentIds);
          fc.pre(!facetIdSet.has(candidateId));
          fc.pre(candidateId !== 'facet-manager');
          fc.pre(!presentIds.includes('facet-manager'));

          const catalog = buildCatalog(presentIds, [...presentIds, candidateId]);
          const result = validateFacetManagerReferentialIntegrity(catalog);

          expect(result.valid).toBe(false);
          if (!result.valid) {
            expect(result.unmatchedIds).toContain(candidateId);
            expect(result).not.toHaveProperty('ordering');
          }
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });
});
