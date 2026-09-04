import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020, {type ValidateFunction} from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {
  CategoryFacetSearchSchema,
  CategoryFacetStateSchema,
  CategoryFacetValueSchema,
  CategoryFacetValuesSchema,
  DateFacetApplyCustomRangePayloadSchema,
  DateFacetStateSchema,
  DateFacetValueSchema,
  NumericFacetApplyCustomRangePayloadSchema,
  NumericFacetStateSchema,
  NumericFacetValueSchema,
  RegularFacetSearchSchema,
  RegularFacetStateSchema,
  RegularFacetValueSchema,
} from '../src/index.js';

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

function getValidator(schemaId: string): ValidateFunction {
  const validate = ajv.getSchema(schemaId);
  if (!validate) {
    throw new Error(`Ajv did not register ${schemaId}`);
  }
  return validate;
}

/**
 * fast-check 4 lets `fc.record` emit null-prototype objects (roughly half the
 * time). These arbitraries stand in for JSON payloads, which are always plain
 * objects, and the no-mutation check below snapshots with `structuredClone`,
 * which always returns plain objects — so a null prototype fails the strict
 * comparison without any mutation having occurred.
 */
function record<T, K extends keyof T = keyof T>(model: {
  [P in keyof T]: fc.Arbitrary<T[P]>;
}): fc.Arbitrary<fc.RecordValue<T, K>> {
  return fc.record<T, K>(model, {noNullPrototype: true});
}

const facetValueStateArb = fc.constantFrom('idle', 'selected', 'excluded');
const selectableFacetValueStateArb = fc.constantFrom('idle', 'selected');

// --- Regular facet arbitraries ---------------------------------------------

const regularFacetValueArb = record({
  value: fc.string({minLength: 1, maxLength: 64}),
  numberOfResults: fc.integer({min: 0, max: 999999999}),
  state: facetValueStateArb,
});

const regularFacetSearchResultArb = record({
  value: fc.string({minLength: 1, maxLength: 64}),
  numberOfResults: fc.integer({min: 0, max: 999999999}),
});

const regularFacetSearchArb = record({
  query: fc.string({minLength: 0, maxLength: 64}),
  canShowMoreResults: fc.boolean(),
  results: fc.array(regularFacetSearchResultArb, {maxLength: 4}),
});

const regularFacetStateArb = record({
  field: fc.string({minLength: 1, maxLength: 64}),
  displayName: fc.string({minLength: 1, maxLength: 64}),
  values: fc.array(regularFacetValueArb, {maxLength: 4}),
  canShowMoreValues: fc.boolean(),
  canShowLessValues: fc.boolean(),
  facetSearch: regularFacetSearchArb,
});

// --- Numeric facet arbitraries ----------------------------------------------

const numericFacetValueArb = record({
  start: fc.double({noNaN: true, noDefaultInfinity: true}),
  end: fc.double({noNaN: true, noDefaultInfinity: true}),
  numberOfResults: fc.integer({min: 0, max: 999999999}),
  state: selectableFacetValueStateArb,
});

const numericFacetStateArb = record({
  field: fc.string({minLength: 1, maxLength: 64}),
  displayName: fc.string({minLength: 1, maxLength: 64}),
  values: fc.array(numericFacetValueArb, {maxLength: 4}),
  customRange: fc.constant(null),
  hasActiveValues: fc.boolean(),
  canShowMoreValues: fc.boolean(),
  canShowLessValues: fc.boolean(),
});

const numericApplyCustomRangePayloadArb = record({
  start: fc.double({noNaN: true, noDefaultInfinity: true}),
  end: fc.double({noNaN: true, noDefaultInfinity: true}),
});

// --- Date facet arbitraries -------------------------------------------------

const dateFacetValueArb = record({
  start: fc.string({minLength: 1, maxLength: 32}),
  end: fc.string({minLength: 1, maxLength: 32}),
  numberOfResults: fc.integer({min: 0, max: 999999999}),
  state: selectableFacetValueStateArb,
});

const dateFacetStateArb = record({
  field: fc.string({minLength: 1, maxLength: 64}),
  displayName: fc.string({minLength: 1, maxLength: 64}),
  values: fc.array(dateFacetValueArb, {maxLength: 4}),
  customRange: fc.constant(null),
  hasActiveValues: fc.boolean(),
  canShowMoreValues: fc.boolean(),
  canShowLessValues: fc.boolean(),
});

const dateApplyCustomRangePayloadArb = record({
  start: fc.string({minLength: 1, maxLength: 32}),
  end: fc.string({minLength: 1, maxLength: 32}),
});

// --- Category facet arbitraries ---------------------------------------------

const categoryFacetPathValueArb = record({
  path: fc.array(fc.string({minLength: 1, maxLength: 16}), {maxLength: 3}),
  value: fc.string({minLength: 1, maxLength: 32}),
  numberOfResults: fc.integer({min: 0, max: 999999999}),
});

const categoryFacetValuesArb = record({
  ancestry: fc.array(categoryFacetPathValueArb, {maxLength: 3}),
  selected: fc.oneof(fc.constant(null), categoryFacetPathValueArb),
  children: fc.array(categoryFacetPathValueArb, {maxLength: 3}),
});

const categoryFacetSearchArb = record({
  query: fc.string({minLength: 0, maxLength: 64}),
  canShowMoreResults: fc.boolean(),
  results: fc.array(categoryFacetPathValueArb, {maxLength: 4}),
});

const categoryFacetStateArb = record({
  field: fc.string({minLength: 1, maxLength: 64}),
  displayName: fc.string({minLength: 1, maxLength: 64}),
  values: categoryFacetValuesArb,
  canShowMoreValues: fc.boolean(),
  canShowLessValues: fc.boolean(),
  facetSearch: categoryFacetSearchArb,
});

// --- Pollution helper -------------------------------------------------------

/**
 * Collects references to every closed object reachable from `root` (the root
 * included). "Closed" objects are the plain object nodes whose schemas declare
 * `additionalProperties: false`; every object node produced by the arbitraries
 * above qualifies, so we treat all reachable plain objects as pollution targets.
 */
function collectClosedObjects(root: unknown): Array<Record<string, unknown>> {
  const targets: Array<Record<string, unknown>> = [];
  // Iterative walk: fast-check 4 generates deeper values than 3 did, which
  // overflowed the call stack when this was recursive.
  const queue: unknown[] = [root];
  while (queue.length > 0) {
    const node = queue.pop();
    if (Array.isArray(node)) {
      queue.push(...node);
      continue;
    }
    if (node !== null && typeof node === 'object') {
      const record = node as Record<string, unknown>;
      targets.push(record);
      for (const key of Object.keys(record)) {
        queue.push(record[key]);
      }
    }
  }
  return targets;
}

interface Scenario {
  name: string;
  schemaId: string;
  zodSchema: {safeParse: (value: unknown) => {success: boolean}};
  arbitrary: fc.Arbitrary<Record<string, unknown>>;
}

const scenarios: Scenario[] = [
  {
    name: 'RegularFacetState',
    schemaId:
      'https://schema.thermidor.coveo.com/components/regular-facet.schema.json#/$defs/RegularFacetState',
    zodSchema: RegularFacetStateSchema,
    arbitrary: regularFacetStateArb,
  },
  {
    name: 'RegularFacetValue',
    schemaId:
      'https://schema.thermidor.coveo.com/components/regular-facet.schema.json#/$defs/RegularFacetValue',
    zodSchema: RegularFacetValueSchema,
    arbitrary: regularFacetValueArb,
  },
  {
    name: 'RegularFacetSearch',
    schemaId:
      'https://schema.thermidor.coveo.com/components/regular-facet.schema.json#/$defs/RegularFacetSearch',
    zodSchema: RegularFacetSearchSchema,
    arbitrary: regularFacetSearchArb,
  },
  {
    name: 'NumericFacetState',
    schemaId:
      'https://schema.thermidor.coveo.com/components/numeric-facet.schema.json#/$defs/NumericFacetState',
    zodSchema: NumericFacetStateSchema,
    arbitrary: numericFacetStateArb,
  },
  {
    name: 'NumericFacetValue',
    schemaId:
      'https://schema.thermidor.coveo.com/components/numeric-facet.schema.json#/$defs/NumericFacetValue',
    zodSchema: NumericFacetValueSchema,
    arbitrary: numericFacetValueArb,
  },
  {
    name: 'NumericFacet applyCustomRange payload',
    schemaId:
      'https://schema.thermidor.coveo.com/components/numeric-facet.schema.json#/$defs/NumericFacetApplyCustomRangeAction/properties/payload',
    zodSchema: NumericFacetApplyCustomRangePayloadSchema,
    arbitrary: numericApplyCustomRangePayloadArb,
  },
  {
    name: 'DateFacetState',
    schemaId:
      'https://schema.thermidor.coveo.com/components/date-facet.schema.json#/$defs/DateFacetState',
    zodSchema: DateFacetStateSchema,
    arbitrary: dateFacetStateArb,
  },
  {
    name: 'DateFacetValue',
    schemaId:
      'https://schema.thermidor.coveo.com/components/date-facet.schema.json#/$defs/DateFacetValue',
    zodSchema: DateFacetValueSchema,
    arbitrary: dateFacetValueArb,
  },
  {
    name: 'DateFacet applyCustomRange payload',
    schemaId:
      'https://schema.thermidor.coveo.com/components/date-facet.schema.json#/$defs/DateFacetApplyCustomRangeAction/properties/payload',
    zodSchema: DateFacetApplyCustomRangePayloadSchema,
    arbitrary: dateApplyCustomRangePayloadArb,
  },
  {
    name: 'CategoryFacetState',
    schemaId:
      'https://schema.thermidor.coveo.com/components/category-facet.schema.json#/$defs/CategoryFacetState',
    zodSchema: CategoryFacetStateSchema,
    arbitrary: categoryFacetStateArb,
  },
  {
    name: 'CategoryFacetValue',
    schemaId:
      'https://schema.thermidor.coveo.com/components/category-facet.schema.json#/$defs/CategoryFacetValue',
    zodSchema: CategoryFacetValueSchema,
    arbitrary: categoryFacetPathValueArb,
  },
  {
    name: 'CategoryFacetSearch',
    schemaId:
      'https://schema.thermidor.coveo.com/components/category-facet.schema.json#/$defs/CategoryFacetSearch',
    zodSchema: CategoryFacetSearchSchema,
    arbitrary: categoryFacetSearchArb,
  },
];

// Feature: commerce-facet-schemas, Property 2: Unknown properties are rejected without mutating the input
describe('Feature: commerce-facet-schemas, Property 2: Unknown properties are rejected without mutating the input', () => {
  const NUM_RUNS = 100;

  for (const scenario of scenarios) {
    it(`${scenario.name}: rejects an injected unknown property without mutating the input`, () => {
      const validate = getValidator(scenario.schemaId);
      fc.assert(
        fc.property(
          scenario.arbitrary,
          // A property name never used by any facet schema.
          fc.string({minLength: 1, maxLength: 24}).map((s) => `zzz_unknown_${s}`),
          fc.nat(),
          fc.jsonValue(),
          (document, unknownKey, targetSelector, injectedValue) => {
            const targets = collectClosedObjects(document);
            const target = targets[targetSelector % targets.length];
            // Ensure the injected key is genuinely absent so we are testing an
            // unknown property, not overwriting a defined one.
            fc.pre(!(unknownKey in target));

            target[unknownKey] = injectedValue;

            const snapshot = structuredClone(document);

            const ajvResult = validate(document);
            expect(ajvResult, `Ajv should reject unknown property "${unknownKey}"`).toBe(false);

            const zodResult = scenario.zodSchema.safeParse(document).success;
            expect(zodResult, `Zod should reject unknown property "${unknownKey}"`).toBe(false);

            // Parity between the two validators.
            expect(zodResult).toBe(ajvResult);

            // The validation calls must not have mutated the input document.
            expect(document).toStrictEqual(snapshot);
          }
        ),
        {numRuns: NUM_RUNS}
      );
    });
  }
});
