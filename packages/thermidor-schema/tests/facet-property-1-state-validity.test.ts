import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import type {ValidateFunction} from 'ajv';
import fc from 'fast-check';
import type {ZodType} from 'zod';
import {beforeAll, describe, expect, it} from 'vitest';
import {
  CategoryFacetStateSchema,
  DateFacetStateSchema,
  NumericFacetStateSchema,
  RegularFacetStateSchema,
} from '../src/index.js';

// Feature: commerce-facet-schemas, Property 1: Facet state validity
//
// For any facet type (regular, numeric, date, category) and for any generated
// `state` object that satisfies that facet's documented shape and bounds,
// validation ACCEPTS the state; and for any generated `state` that omits a
// required property, carries numberOfResults < 0, carries a `state` value
// outside {idle, selected, excluded}, or violates a documented
// string-length/array-size bound, validation REJECTS the state. For the
// category facet this holds for every value in the flat ancestry/selected/children structure.
//
// Validates: Requirements 1.4, 1.5, 1.6, 1.7, 2.4, 2.5, 2.6, 2.11, 3.4, 3.5,
// 3.10, 4.4, 4.5, 4.6

const NUM_RUNS = 200;

const schemaDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'schema');

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

const STATE_SCHEMA_IDS = {
  regular:
    'https://schema.thermidor.coveo.com/components/regular-facet.schema.json#/$defs/RegularFacetState',
  numeric:
    'https://schema.thermidor.coveo.com/components/numeric-facet.schema.json#/$defs/NumericFacetState',
  date: 'https://schema.thermidor.coveo.com/components/date-facet.schema.json#/$defs/DateFacetState',
  category:
    'https://schema.thermidor.coveo.com/components/category-facet.schema.json#/$defs/CategoryFacetState',
} as const;

type FacetKind = keyof typeof STATE_SCHEMA_IDS;

const zodStateSchemas: Record<FacetKind, ZodType> = {
  regular: RegularFacetStateSchema,
  numeric: NumericFacetStateSchema,
  date: DateFacetStateSchema,
  category: CategoryFacetStateSchema,
};

const ajvValidators = {} as Record<FacetKind, ValidateFunction>;

beforeAll(async () => {
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
      ajv.addSchema({$id: fileUrl, $ref: (schema as {$id: string}).$id});
    }
  }
  for (const kind of Object.keys(STATE_SCHEMA_IDS) as FacetKind[]) {
    const validate = ajv.getSchema(STATE_SCHEMA_IDS[kind]);
    if (!validate) {
      throw new Error(`Ajv did not register ${STATE_SCHEMA_IDS[kind]}`);
    }
    ajvValidators[kind] = validate;
  }
});

// Assert that Ajv and the generated Zod schema agree on the validity of a
// state document, then return the agreed-upon verdict.
function validateBoth(kind: FacetKind, value: unknown): boolean {
  const ajvResult = ajvValidators[kind](value) === true;
  const zodResult = zodStateSchemas[kind].safeParse(value).success;
  expect(zodResult, `Ajv/Zod disagreement for ${kind}: Ajv=${ajvResult} Zod=${zodResult}`).toBe(
    ajvResult
  );
  return ajvResult;
}

// --- Shared arbitraries ------------------------------------------------------

const facetValueStateArb = fc.constantFrom('idle', 'selected', 'excluded');
const selectableFacetValueStateArb = fc.constantFrom('idle', 'selected');
const invalidFacetValueStateArb = fc
  .string()
  .filter((s) => !['idle', 'selected', 'excluded'].includes(s));

// Boundary-aware string generator: exercises lengths 0, 1, 255, 1024 plus
// arbitrary lengths in range.
function boundedString(min: number, max: number): fc.Arbitrary<string> {
  const boundaries = [0, 1, 255, 1024].filter((n) => n >= min && n <= max);
  const fixed = boundaries.map((n) => fc.string({minLength: n, maxLength: n}));
  return fc.oneof(fc.string({minLength: min, maxLength: max}), ...fixed);
}

// numberOfResults / count: exercises 0 and 999,999,999 plus arbitrary values.
const validCountArb = fc.oneof(fc.constantFrom(0, 999999999), fc.integer({min: 0, max: 999999999}));
const invalidNegativeCountArb = fc.integer({min: -1000000, max: -1});

// --- Regular facet -----------------------------------------------------------

const regularValueArb = fc.record({
  value: boundedString(1, 1024),
  numberOfResults: validCountArb,
  state: facetValueStateArb,
});

const regularSearchResultArb = fc.record({
  value: boundedString(1, 1024),
  numberOfResults: validCountArb,
});

const regularSearchArb = fc.record({
  query: boundedString(0, 1024),
  canShowMoreResults: fc.boolean(),
  results: fc.array(regularSearchResultArb, {maxLength: 5}),
});

const validRegularStateArb = fc.record({
  field: boundedString(1, 255),
  displayName: boundedString(1, 255),
  values: fc.array(regularValueArb, {maxLength: 5}),
  hasActiveValues: fc.boolean(),
  canShowMoreValues: fc.boolean(),
  canShowLessValues: fc.boolean(),
  facetSearch: regularSearchArb,
});

// --- Numeric facet -----------------------------------------------------------

const numericValueArb = fc.record({
  start: fc.double({noNaN: true, noDefaultInfinity: true}),
  end: fc.double({noNaN: true, noDefaultInfinity: true}),
  numberOfResults: validCountArb,
  state: selectableFacetValueStateArb,
});

const numericCustomRangeArb = fc.oneof(
  fc.constant(null),
  fc.record({
    start: fc.double({noNaN: true, noDefaultInfinity: true}),
    end: fc.double({noNaN: true, noDefaultInfinity: true}),
    numberOfResults: validCountArb,
  })
);

const validNumericStateArb = fc.record(
  {
    field: fc.string(),
    displayName: fc.string(),
    values: fc.array(numericValueArb, {maxLength: 5}),
    customRange: numericCustomRangeArb,
    hasActiveValues: fc.boolean(),
    canShowMoreValues: fc.boolean(),
    canShowLessValues: fc.boolean(),
    domain: fc.record({
      min: fc.double({noNaN: true, noDefaultInfinity: true}),
      max: fc.double({noNaN: true, noDefaultInfinity: true}),
    }),
  },
  {
    requiredKeys: [
      'field',
      'displayName',
      'values',
      'customRange',
      'hasActiveValues',
      'canShowMoreValues',
      'canShowLessValues',
    ],
  }
);

// --- Date facet --------------------------------------------------------------

const dateValueArb = fc.record({
  start: fc.string(),
  end: fc.string(),
  numberOfResults: validCountArb,
  state: selectableFacetValueStateArb,
});

const dateCustomRangeArb = fc.oneof(
  fc.constant(null),
  fc.record({
    start: fc.string(),
    end: fc.string(),
    numberOfResults: validCountArb,
  })
);

const validDateStateArb = fc.record({
  field: fc.string(),
  displayName: fc.string(),
  values: fc.array(dateValueArb, {maxLength: 5}),
  customRange: dateCustomRangeArb,
  hasActiveValues: fc.boolean(),
  canShowMoreValues: fc.boolean(),
  canShowLessValues: fc.boolean(),
});

// --- Category facet (flat values structure) -----------------------------------

const categoryPathValueArb = fc.record({
  path: fc.array(fc.string(), {maxLength: 4}),
  value: fc.string(),
  numberOfResults: validCountArb,
});

const categoryValuesArb = fc.record({
  ancestry: fc.oneof(fc.constant([]), fc.array(categoryPathValueArb, {maxLength: 4})),
  selected: fc.oneof(fc.constant(null), categoryPathValueArb),
  children: fc.array(categoryPathValueArb, {maxLength: 5}),
});

const categorySearchArb = fc.record({
  query: fc.string({maxLength: 256}),
  canShowMoreResults: fc.boolean(),
  results: fc.array(categoryPathValueArb, {maxLength: 4}),
});

const validCategoryStateArb = fc.record({
  field: fc.string(),
  displayName: fc.string(),
  values: categoryValuesArb,
  canShowMoreValues: fc.boolean(),
  canShowLessValues: fc.boolean(),
  facetSearch: categorySearchArb,
});

const validStateArbs: Record<FacetKind, fc.Arbitrary<Record<string, unknown>>> = {
  regular: validRegularStateArb,
  numeric: validNumericStateArb,
  date: validDateStateArb,
  category: validCategoryStateArb,
};

const REQUIRED_KEYS: Record<FacetKind, string[]> = {
  regular: [
    'field',
    'displayName',
    'values',
    'canShowMoreValues',
    'canShowLessValues',
    'facetSearch',
  ],
  numeric: [
    'field',
    'displayName',
    'values',
    'customRange',
    'canShowMoreValues',
    'canShowLessValues',
  ],
  date: ['field', 'displayName', 'values', 'customRange', 'canShowMoreValues', 'canShowLessValues'],
  category: [
    'field',
    'displayName',
    'values',
    'canShowMoreValues',
    'canShowLessValues',
    'facetSearch',
  ],
};

describe('Feature: commerce-facet-schemas, Property 1: Facet state validity', () => {
  const facetKinds = Object.keys(STATE_SCHEMA_IDS) as FacetKind[];

  for (const kind of facetKinds) {
    describe(`${kind} facet`, () => {
      it('ACCEPTS states satisfying the documented shape and bounds', () => {
        fc.assert(
          fc.property(validStateArbs[kind], (state) => {
            expect(validateBoth(kind, state)).toBe(true);
          }),
          {numRuns: NUM_RUNS}
        );
      });

      it('REJECTS states that omit a required property', () => {
        const requiredKeys = REQUIRED_KEYS[kind];
        fc.assert(
          fc.property(
            validStateArbs[kind],
            fc.constantFrom(...requiredKeys),
            (state, keyToDrop) => {
              const mutated: Record<string, unknown> = {...state};
              delete mutated[keyToDrop];
              expect(validateBoth(kind, mutated)).toBe(false);
            }
          ),
          {numRuns: NUM_RUNS}
        );
      });
    });
  }

  // Boundary-focused rejection cases exercising numberOfResults, state enum,
  // and string-length / array-size bounds per facet type.

  it('regular facet REJECTS negative numberOfResults, invalid state, and out-of-bound strings/arrays', () => {
    fc.assert(
      fc.property(
        validRegularStateArb,
        fc.oneof(
          fc.record({kind: fc.constant('negativeResults'), value: invalidNegativeCountArb}),
          fc.record({kind: fc.constant('badState'), value: invalidFacetValueStateArb}),
          fc.record({kind: fc.constant('emptyValueString'), value: fc.constant('')}),
          fc.record({
            kind: fc.constant('tooLongValueString'),
            value: fc.string({minLength: 1025, maxLength: 1025}),
          }),
          fc.record({
            kind: fc.constant('tooManyValues'),
            value: fc.constant(1001),
          })
        ),
        (state, mutation) => {
          const mutated = structuredClone(state);
          const aValue = {value: 'x', numberOfResults: 0, state: 'idle' as const};
          switch (mutation.kind) {
            case 'negativeResults':
              mutated.values = [{...aValue, numberOfResults: mutation.value as number}];
              break;
            case 'badState':
              mutated.values = [{...aValue, state: mutation.value as string}];
              break;
            case 'emptyValueString':
              mutated.values = [{...aValue, value: mutation.value as string}];
              break;
            case 'tooLongValueString':
              mutated.values = [{...aValue, value: mutation.value as string}];
              break;
            case 'tooManyValues':
              mutated.values = Array.from({length: mutation.value as number}, () => ({...aValue}));
              break;
          }
          expect(validateBoth('regular', mutated)).toBe(false);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('numeric facet REJECTS negative numberOfResults, invalid state, and oversized values array', () => {
    fc.assert(
      fc.property(
        validNumericStateArb,
        fc.oneof(
          fc.record({kind: fc.constant('negativeResults'), value: invalidNegativeCountArb}),
          fc.record({kind: fc.constant('badState'), value: invalidFacetValueStateArb}),
          fc.record({kind: fc.constant('tooManyValues'), value: fc.constant(501)})
        ),
        (state, mutation) => {
          const mutated = structuredClone(state);
          const aValue = {
            start: 0,
            end: 1,
            numberOfResults: 0,
            state: 'idle' as const,
          };
          switch (mutation.kind) {
            case 'negativeResults':
              mutated.values = [{...aValue, numberOfResults: mutation.value as number}];
              break;
            case 'badState':
              mutated.values = [{...aValue, state: mutation.value as string}];
              break;
            case 'tooManyValues':
              mutated.values = Array.from({length: mutation.value as number}, () => ({...aValue}));
              break;
          }
          expect(validateBoth('numeric', mutated)).toBe(false);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('date facet REJECTS negative numberOfResults and invalid state value', () => {
    fc.assert(
      fc.property(
        validDateStateArb,
        fc.oneof(
          fc.record({kind: fc.constant('negativeResults'), value: invalidNegativeCountArb}),
          fc.record({kind: fc.constant('badState'), value: invalidFacetValueStateArb})
        ),
        (state, mutation) => {
          const mutated = structuredClone(state);
          const aValue = {
            start: '2020-01-01',
            end: '2020-12-31',
            numberOfResults: 0,
            state: 'idle' as const,
          };
          switch (mutation.kind) {
            case 'negativeResults':
              mutated.values = [{...aValue, numberOfResults: mutation.value as number}];
              break;
            case 'badState':
              mutated.values = [{...aValue, state: mutation.value as string}];
              break;
          }
          expect(validateBoth('date', mutated)).toBe(false);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('category facet REJECTS negative numberOfResults on a path value', () => {
    fc.assert(
      fc.property(
        validCategoryStateArb,
        invalidNegativeCountArb,
        fc.constantFrom('ancestry', 'children'),
        (state, badCount, location) => {
          const mutated = structuredClone(state);
          const badValue = {path: ['Bad'], value: 'Bad', numberOfResults: badCount};
          if (location === 'ancestry') {
            mutated.values = {...mutated.values, ancestry: [badValue]};
          } else {
            mutated.values = {...mutated.values, children: [badValue]};
          }
          expect(validateBoth('category', mutated)).toBe(false);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });
});
