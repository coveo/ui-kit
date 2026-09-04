// Feature: thermidor-schema-adjacency-list, Property 1: Ajv–Zod agreement per changed contract
//
// Property 1: For any generated input value and for each changed contract (the base
// component contract with composition fields exercised via the union member entry,
// the commerce-search component, the Component_Contracts_Union, and the
// Composition_Snapshot_Contract whose components map values validate against the
// CompositionSnapshotEntry view), the generated Zod projection accepts the value if and
// only if the Ajv-validated canonical JSON Schema document accepts it.
//
// Validates: Requirements 8.3, 8.4, 6.6
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import fc from 'fast-check';
import type {ZodTypeAny} from 'zod';
import {describe, expect, it} from 'vitest';
import {
  CommerceSearchSchema,
  ComponentContractsSchema,
  CompositionSnapshotSchema,
} from '../src/index.js';

const NUM_RUNS = 200;

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaDirectory = path.join(packageRoot, 'schema');

// --- Ajv setup: register every document under schema/, mirroring tests/contract.test.ts ---

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

const schemaDocuments = await loadJsonFiles(schemaDirectory);
const ajv = new Ajv2020({allErrors: true, strict: false, validateFormats: true});
addFormats(ajv);
for (const {path: schemaPath, value: schema} of schemaDocuments) {
  ajv.addSchema(schema);
  const fileUrl = new URL(
    path.relative(schemaDirectory, schemaPath).split(path.sep).join('/'),
    'https://schema.thermidor.coveo.com/'
  ).href;
  if (fileUrl !== (schema as {$id?: string}).$id) {
    ajv.addSchema({$id: fileUrl, $ref: (schema as {$id?: string}).$id});
  }
}

function ajvValidatorFor(schemaId: string): (value: unknown) => boolean {
  const validate = ajv.getSchema(schemaId);
  if (!validate) {
    throw new Error(`Ajv did not register ${schemaId}`);
  }
  return (value: unknown) => Boolean(validate(value));
}

// The Zod projection is ALWAYS the identity-free `{componentType, state, actions, children?, child?}`
// entry — `componentId`/`displayName` live on the A2-UI props layer, never on the runtime
// contract (see design "Why additionalProperties:false is the decisive keyword"). The matching
// Ajv entry points are therefore the identity-free entry views, not the identity-bearing member
// documents / `#/$defs/ComponentContracts` union (which `allOf` the base and so require identity).
// This is the divergence the entry view exists to remove and that Property 1 forbids (design
// "Component-contracts entry view").
//
// - Base+composition on a component / the union  -> `#/$defs/CompositionSnapshotEntry`   vs  ComponentContractsSchema
// - commerce-search                              -> `commerce-search...#/$defs/SnapshotEntry`   vs  CommerceSearchSchema
// - Composition snapshot (map values via entry)  -> composition-snapshot `$id`          vs  CompositionSnapshotSchema
const UNION_ENTRY_ID =
  'https://schema.thermidor.coveo.com/components/component-contracts.schema.json#/$defs/CompositionSnapshotEntry';
const COMMERCE_SEARCH_ENTRY_ID =
  'https://schema.thermidor.coveo.com/components/commerce-search.schema.json#/$defs/SnapshotEntry';
const SNAPSHOT_ID =
  'https://schema.thermidor.coveo.com/composition/composition-snapshot.schema.json';

const ajvUnion = ajvValidatorFor(UNION_ENTRY_ID);
const ajvCommerceSearch = ajvValidatorFor(COMMERCE_SEARCH_ENTRY_ID);
const ajvSnapshot = ajvValidatorFor(SNAPSHOT_ID);

// --- Generators (per design Testing Strategy) ---

// Pattern-valid component-id strings: ^[a-z][a-z0-9-]*$
const validIdArb: fc.Arbitrary<string> = fc
  .tuple(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
    fc.stringMatching(/^[a-z0-9-]*$/)
  )
  .map(([head, tail]) => head + tail);

// Adversarial ids: leading digit, uppercase, empty, unicode, leading/trailing hyphen.
const adversarialIdArb: fc.Arbitrary<string> = fc.oneof(
  /* cspell:disable-next-line */
  fc.constantFrom('', '-lead', 'trail-', '1leading', 'Upper', 'has space', 'unicödé', 'A', '_x'),
  fc.string()
);

const anyIdArb: fc.Arbitrary<string> = fc.oneof(validIdArb, adversarialIdArb);

// children arrays: empty / single / duplicates / invalid items, over valid and adversarial ids.
const childrenArb: fc.Arbitrary<unknown> = fc.oneof(
  fc.constant([]),
  fc.array(validIdArb, {maxLength: 4}),
  validIdArb.map((id) => [id, id]), // duplicates accepted (no uniqueItems)
  fc.array(anyIdArb, {maxLength: 4}),
  // Non-array-of-strings children (adversarial): should be rejected by both engines.
  fc.oneof(fc.constant('not-an-array'), fc.array(fc.integer(), {maxLength: 3}), fc.constant([1, 2]))
);

const childArb: fc.Arbitrary<unknown> = fc.oneof(validIdArb, adversarialIdArb, fc.integer());

// Minimal valid per-type instances (aligned with the SDK minimalInstances map), used to build
// components that carry composition. Each is the identity-free member entry.
const minimalInstances: Record<string, Record<string, unknown>> = {
  'product-carousel': {
    componentType: 'product-carousel',
    state: {heading: 'Featured', products: []},
    actions: {},
  },
  cart: {
    componentType: 'cart',
    state: {items: []},
    actions: {
      setItems: {payload: {items: []}},
      updateItemQuantity: {
        payload: {item: {productId: 'p1', name: 'Widget', price: 5, quantity: 1}},
      },
    },
  },
  'next-actions-bar': {
    componentType: 'next-actions-bar',
    state: {actions: []},
    actions: {selectAction: {payload: {text: 'hello', type: 'followup'}}},
  },
  'bundle-display': {componentType: 'bundle-display', state: {tiers: []}, actions: {}},
  'comparison-table': {
    componentType: 'comparison-table',
    state: {attributes: [], products: []},
    actions: {},
  },
  'product-list': {componentType: 'product-list', state: {products: []}, actions: {}},
  pagination: {
    componentType: 'pagination',
    state: {page: 0, pageSize: 10, totalEntries: 0, totalPages: 0},
    actions: {
      selectPage: {payload: {page: 0}},
      setPageSize: {payload: {pageSize: 10}},
    },
  },
  sort: {
    componentType: 'sort',
    state: {
      appliedSort: {sortCriteria: 'relevance', fields: []},
      availableSorts: [{sortCriteria: 'relevance', fields: []}],
    },
    actions: {selectSort: {payload: {sortCriteria: 'relevance', fields: []}}},
  },
  'search-box': {
    componentType: 'search-box',
    state: {query: ''},
    actions: {submitQuery: {payload: {query: ''}}},
  },
  'regular-facet': {
    componentType: 'regular-facet',
    state: {
      field: 'brand',
      displayName: 'Brand',
      values: [],
      hasActiveValues: false,
      canShowMoreValues: false,
      canShowLessValues: false,
      facetSearch: {query: '', canShowMoreResults: false, results: []},
    },
    actions: {
      toggleSelect: {payload: {value: 'Coveo'}},
      toggleExclude: {payload: {value: 'Coveo'}},
      toggleSingleSelect: {payload: {value: 'Coveo'}},
      toggleSingleExclude: {payload: {value: 'Coveo'}},
      clearAllActiveValues: {payload: null},
      search: {payload: {query: ''}},
      showMoreSearchResults: {payload: null},
      clearSearch: {payload: null},
      showMoreValues: {payload: null},
      showLessValues: {payload: null},
    },
  },
  'numeric-facet': {
    componentType: 'numeric-facet',
    state: {
      field: 'price',
      displayName: 'Price',
      values: [],
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
  },
  'date-facet': {
    componentType: 'date-facet',
    state: {
      field: 'date',
      displayName: 'Date',
      values: [],
      customRange: null,
      hasActiveValues: false,
      canShowMoreValues: false,
      canShowLessValues: false,
    },
    actions: {
      toggleSelect: {payload: {start: '2024-01-01', end: '2024-12-31'}},
      toggleSingleSelect: {payload: {start: '2024-01-01', end: '2024-12-31'}},
      clearAllActiveValues: {payload: null},
      applyCustomRange: {payload: {start: '2024-01-01', end: '2024-12-31'}},
      showMoreValues: {payload: null},
      showLessValues: {payload: null},
    },
  },
  'category-facet': {
    componentType: 'category-facet',
    state: {
      field: 'category',
      displayName: 'Category',
      values: {ancestry: [], selected: null, children: []},
      canShowMoreValues: false,
      canShowLessValues: false,
      facetSearch: {query: '', canShowMoreResults: false, results: []},
    },
    actions: {
      selectPath: {payload: {path: []}},
      clearSelectedPath: {payload: null},
      search: {payload: {query: ''}},
      showMoreSearchResults: {payload: null},
      clearSearch: {payload: null},
      showMoreValues: {payload: null},
      showLessValues: {payload: null},
    },
  },
  'facet-manager': {componentType: 'facet-manager', state: {facetIds: []}, actions: {}},
  'commerce-search': {componentType: 'commerce-search', state: {}, actions: {}},
};

const componentTypes = Object.keys(minimalInstances);

// A component instance (member entry) with optional/adversarial composition fields attached,
// plus occasional structural corruption to exercise both accept and reject branches.
const componentInstanceArb: fc.Arbitrary<unknown> = fc
  .record(
    {
      componentType: fc.constantFrom(...componentTypes),
      withChildren: fc.boolean(),
      children: childrenArb,
      withChild: fc.boolean(),
      child: childArb,
      // Occasionally inject an unknown componentType or an extra property to force rejection.
      corrupt: fc.constantFrom('none', 'none', 'none', 'unknown-type', 'extra-prop', 'identity'),
    },
    {noNullPrototype: true}
  )
  .map(({componentType, withChildren, children, withChild, child, corrupt}) => {
    const base = structuredClone(minimalInstances[componentType]);
    const instance: Record<string, unknown> = {...base};
    if (withChildren) {
      instance.children = children;
    }
    if (withChild) {
      instance.child = child;
    }
    if (corrupt === 'unknown-type') {
      instance.componentType = 'not-a-real-component';
    } else if (corrupt === 'extra-prop') {
      instance.somethingExtra = true;
    } else if (corrupt === 'identity') {
      // base identity fields are rejected by the entry view (additionalProperties:false) and by
      // the strictObject Zod projection — both engines reject, so they must agree.
      instance.componentId = 'some-id';
      instance.displayName = 'Some Name';
    }
    return instance;
  });

// Type-swap adversary: take a valid instance of type A and graft the WRONG type onto it — either
// swap in type B's componentType while keeping A's state/actions, or swap in type B's state/actions
// while keeping A's componentType. The result is structurally plausible (every field is a real,
// well-formed value from some member) but cross-typed, which Ajv's per-member `oneOf` rejects. This
// is precisely the blind spot the flat Zod projection used to accept; both engines must now reject
// it and therefore agree. Types A and B are always distinct.
const typeSwapArb: fc.Arbitrary<unknown> = fc
  .record({
    typeA: fc.constantFrom(...componentTypes),
    typeBOffset: fc.integer({min: 1, max: componentTypes.length - 1}),
    swap: fc.constantFrom('componentType', 'state-actions'),
  })
  .map(({typeA, typeBOffset, swap}) => {
    const indexA = componentTypes.indexOf(typeA);
    const typeB = componentTypes[(indexA + typeBOffset) % componentTypes.length];
    const instanceA = structuredClone(minimalInstances[typeA]);
    const instanceB = structuredClone(minimalInstances[typeB]);
    if (swap === 'componentType') {
      // A's state/actions under B's componentType.
      return {...instanceA, componentType: instanceB.componentType};
    }
    // B's state/actions under A's componentType.
    return {...instanceA, state: instanceB.state, actions: instanceB.actions};
  });

const commerceSearchInstanceArb: fc.Arbitrary<unknown> = fc
  .record({
    withChildren: fc.boolean(),
    children: childrenArb,
    withChild: fc.boolean(),
    child: childArb,
    corrupt: fc.constantFrom('none', 'none', 'none', 'bad-state', 'extra-prop'),
  })
  .map(({withChildren, children, withChild, child, corrupt}) => {
    const instance: Record<string, unknown> = {
      componentType: 'commerce-search',
      state: {},
      actions: {},
    };
    if (withChildren) {
      instance.children = children;
    }
    if (withChild) {
      instance.child = child;
    }
    if (corrupt === 'bad-state') {
      instance.state = {unexpected: 'value'};
    } else if (corrupt === 'extra-prop') {
      instance.extra = 1;
    }
    return instance;
  });

// A composition snapshot: a components map keyed by generated ids whose values are member
// entries, with a rootId sometimes present in the map and sometimes not, incl. the empty map.
const snapshotArb: fc.Arbitrary<unknown> = fc
  .record({
    // Map values mix well-formed member entries with cross-typed (type-swapped) values so the
    // snapshot's `components` map exercises the CompositionSnapshotEntry discrimination on both the
    // accept and reject branches.
    entries: fc.array(fc.tuple(anyIdArb, fc.oneof(componentInstanceArb, typeSwapArb)), {
      maxLength: 4,
    }),
    rootId: anyIdArb,
    rootFromMap: fc.boolean(),
    corrupt: fc.constantFrom('none', 'none', 'none', 'missing-root', 'extra-prop', 'bad-value'),
  })
  .map(({entries, rootId, rootFromMap, corrupt}) => {
    const components: Record<string, unknown> = {};
    for (const [id, instance] of entries) {
      components[id] = instance;
    }
    const keys = Object.keys(components);
    const effectiveRoot = rootFromMap && keys.length > 0 ? keys[0] : rootId;
    const snapshot: Record<string, unknown> = {rootId: effectiveRoot, components};
    if (corrupt === 'missing-root') {
      delete snapshot.rootId;
    } else if (corrupt === 'extra-prop') {
      snapshot.unexpected = true;
    } else if (corrupt === 'bad-value') {
      components['ok-id'] = {not: 'an entry'};
    }
    return snapshot;
  });

// --- The agreement assertion ---

function assertAgreement(
  contractName: string,
  zodSchema: ZodTypeAny,
  ajvValidate: (value: unknown) => boolean,
  value: unknown
): void {
  const zodAccepts = zodSchema.safeParse(value).success;
  const ajvAccepts = ajvValidate(value);
  expect(
    zodAccepts,
    `Ajv↔Zod divergence on contract "${contractName}": Zod ${
      zodAccepts ? 'accepted' : 'rejected'
    } but Ajv ${ajvAccepts ? 'accepted' : 'rejected'} — value: ${JSON.stringify(value)}`
  ).toBe(ajvAccepts);
}

describe('Property 1: Ajv–Zod agreement per changed contract', () => {
  it('agrees on the base+composition contract via the union member entry', () => {
    fc.assert(
      fc.property(componentInstanceArb, (value) => {
        assertAgreement(
          'Component_Contracts_Union (member entry)',
          ComponentContractsSchema,
          ajvUnion,
          value
        );
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('agrees on the commerce-search component contract', () => {
    fc.assert(
      fc.property(commerceSearchInstanceArb, (value) => {
        assertAgreement('commerce-search', CommerceSearchSchema, ajvCommerceSearch, value);
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('agrees on the Component_Contracts_Union across all member types', () => {
    fc.assert(
      fc.property(componentInstanceArb, (value) => {
        assertAgreement('Component_Contracts_Union', ComponentContractsSchema, ajvUnion, value);
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('agrees on the Composition_Snapshot_Contract (map values via CompositionSnapshotEntry)', () => {
    fc.assert(
      fc.property(snapshotArb, (value) => {
        assertAgreement(
          'Composition_Snapshot_Contract',
          CompositionSnapshotSchema,
          ajvSnapshot,
          value
        );
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('agrees on cross-typed (type-swapped) values via the union member entry', () => {
    fc.assert(
      fc.property(typeSwapArb, (value) => {
        assertAgreement(
          'Component_Contracts_Union (type-swap)',
          ComponentContractsSchema,
          ajvUnion,
          value
        );
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('agrees on cross-typed (type-swapped) values routed through the composition snapshot', () => {
    fc.assert(
      fc.property(anyIdArb, typeSwapArb, (id, mismatched) => {
        const snapshot = {rootId: id, components: {[id]: mismatched}};
        assertAgreement(
          'Composition_Snapshot_Contract (type-swap map value)',
          CompositionSnapshotSchema,
          ajvSnapshot,
          snapshot
        );
      }),
      {numRuns: NUM_RUNS}
    );
  });
});
