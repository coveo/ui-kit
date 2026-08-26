import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import fc from 'fast-check';
import type {ZodType} from 'zod';
import {describe, expect, it} from 'vitest';
import {
  CategoryFacetSchema,
  CategoryFacetSelectPathPayloadSchema,
  CategoryFacetSearchPayloadSchema,
  DateFacetApplyCustomRangePayloadSchema,
  DateFacetToggleSelectPayloadSchema,
  NumericFacetApplyCustomRangePayloadSchema,
  NumericFacetToggleSelectPayloadSchema,
  RegularFacetSchema,
  RegularFacetToggleExcludePayloadSchema,
  RegularFacetToggleSelectPayloadSchema,
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
    ajv.addSchema({$id: fileUrl, $ref: (schema as {$id: string}).$id});
  }
}

function ajvValidatorFor(schemaId: string) {
  const validate = ajv.getSchema(schemaId);
  expect(validate, `Ajv did not register ${schemaId}`).toBeDefined();
  return validate!;
}

const NUM_RUNS = 200;

// A property name that is guaranteed not to be a member of any payload schema.
// Prototype-mutating keys (__proto__, constructor, prototype) are excluded: via
// object-literal computed-key syntax they do not create a genuine own enumerable
// property, so they would not exercise the "extra property" rejection path.
const undefinedPropertyArb = fc
  .string({minLength: 1, maxLength: 20})
  .filter(
    (key) =>
      !['query', 'ranges', 'start', 'end'].includes(key) &&
      !['__proto__', 'constructor', 'prototype'].includes(key)
  );

interface PayloadCase {
  name: string;
  schemaId: string;
  zodSchema: ZodType;
  validArb: fc.Arbitrary<unknown>;
  invalidArb: fc.Arbitrary<unknown>;
}

// --- Regular facet `search` payload: { query: string, 0..1024 } ---
const regularSearchValidArb = fc.record({
  query: fc.oneof(
    fc.string({minLength: 0, maxLength: 1024}),
    fc.constant(''),
    fc.string({minLength: 1024, maxLength: 1024})
  ),
});

const regularSearchInvalidArb = fc.oneof(
  // query too long (> 1024)
  fc.record({query: fc.string({minLength: 1025, maxLength: 1100})}),
  // query wrong type
  fc.record({query: fc.oneof(fc.integer(), fc.boolean(), fc.constant(null))}),
  // missing required query
  fc.constant({}),
  // undefined extra property alongside a valid query
  fc.record({query: fc.string({maxLength: 1024}), extra: undefinedPropertyArb.map(() => 'x')}),
  undefinedPropertyArb.map((key) => ({query: 'ok', [key]: 'value'}))
);

// --- Category facet `search` payload: { query: string, maxLength 256 } ---
const categorySearchValidArb = fc.record({
  query: fc.oneof(
    fc.string({minLength: 0, maxLength: 256}),
    fc.constant(''),
    fc.string({minLength: 256, maxLength: 256})
  ),
});

const categorySearchInvalidArb = fc.oneof(
  // query too long (> 256)
  fc.record({query: fc.string({minLength: 257, maxLength: 400})}),
  // query wrong type
  fc.record({query: fc.oneof(fc.integer(), fc.boolean(), fc.constant(null))}),
  // missing required query
  fc.constant({}),
  // undefined extra property alongside a valid query
  undefinedPropertyArb.map((key) => ({query: 'ok', [key]: 'value'}))
);

// --- Numeric applyCustomRange payload: { start:number, end:number } ---
const numericApplyCustomRangeValidArb = fc.record({
  start: fc.double({noNaN: true, noDefaultInfinity: true}),
  end: fc.double({noNaN: true, noDefaultInfinity: true}),
});

const numericApplyCustomRangeInvalidArb = fc.oneof(
  // start wrong type
  fc.record({start: fc.string(), end: fc.double({noNaN: true})}),
  // missing required end
  fc.record({start: fc.double({noNaN: true})}),
  // missing all
  fc.constant({}),
  // undefined extra property
  fc.record({
    start: fc.double({noNaN: true, noDefaultInfinity: true}),
    end: fc.double({noNaN: true, noDefaultInfinity: true}),
    extra: fc.string(),
  })
);

// --- Date applyCustomRange payload: { start:string, end:string } ---
const dateApplyCustomRangeValidArb = fc.record({
  start: fc.string(),
  end: fc.string(),
});

const dateApplyCustomRangeInvalidArb = fc.oneof(
  // start wrong type
  fc.record({start: fc.integer(), end: fc.string()}),
  // missing required end
  fc.record({start: fc.string()}),
  // missing all
  fc.constant({}),
  // undefined extra property
  fc.record({
    start: fc.string(),
    end: fc.string(),
    extra: fc.string(),
  })
);

// --- Regular facet toggle payloads: { value: string, 1..1024 } ---
const regularToggleValidArb = fc.record({
  value: fc.oneof(
    fc.string({minLength: 1, maxLength: 1024}),
    fc.string({minLength: 1024, maxLength: 1024})
  ),
});

const regularToggleInvalidArb = fc.oneof(
  // value too short (empty, violates minLength 1)
  fc.record({value: fc.constant('')}),
  // value too long (> 1024)
  fc.record({value: fc.string({minLength: 1025, maxLength: 1100})}),
  // value wrong type
  fc.record({value: fc.oneof(fc.integer(), fc.boolean(), fc.constant(null))}),
  // missing required value
  fc.constant({}),
  // undefined extra property alongside a valid value
  fc.record({value: fc.string({minLength: 1, maxLength: 1024}), extra: fc.constant('x')})
);

// --- Numeric facet toggleSelect payload: { start:number, end:number } ---
const numericToggleValidArb = fc.record({
  start: fc.double({noNaN: true, noDefaultInfinity: true}),
  end: fc.double({noNaN: true, noDefaultInfinity: true}),
});

const numericToggleInvalidArb = fc.oneof(
  // start wrong type
  fc.record({start: fc.string(), end: fc.double({noNaN: true})}),
  // missing required end
  fc.record({start: fc.double({noNaN: true})}),
  // missing all
  fc.constant({}),
  // undefined extra property
  fc.record({
    start: fc.double({noNaN: true, noDefaultInfinity: true}),
    end: fc.double({noNaN: true, noDefaultInfinity: true}),
    extra: fc.constant('x'),
  })
);

// --- Date facet toggleSelect payload: { start:string, end:string } ---
const dateToggleValidArb = fc.record({
  start: fc.string(),
  end: fc.string(),
});

const dateToggleInvalidArb = fc.oneof(
  // start wrong type
  fc.record({start: fc.integer(), end: fc.string()}),
  // missing required end
  fc.record({start: fc.string()}),
  // missing all
  fc.constant({}),
  // undefined extra property
  fc.record({
    start: fc.string(),
    end: fc.string(),
    extra: fc.constant('x'),
  })
);

// --- Category facet toggleSelect payload: { path: string[] } ---
const categoryToggleValidArb = fc.record({
  path: fc.array(fc.string(), {minLength: 0, maxLength: 8}),
});

const categoryToggleInvalidArb = fc.oneof(
  // path wrong type (not an array)
  fc.record({path: fc.oneof(fc.string(), fc.integer(), fc.constant(null))}),
  // path items wrong type
  fc.record({path: fc.array(fc.integer(), {minLength: 1, maxLength: 4})}),
  // missing required path
  fc.constant({}),
  // undefined extra property
  fc.record({path: fc.array(fc.string(), {maxLength: 4}), extra: fc.constant('x')})
);

const cases: PayloadCase[] = [
  {
    name: 'regular facet toggleSelect payload',
    schemaId:
      'https://schema.thermidor.coveo.com/components/regular-facet.schema.json#/$defs/RegularFacetToggleSelectAction/properties/payload',
    zodSchema: RegularFacetToggleSelectPayloadSchema,
    validArb: regularToggleValidArb,
    invalidArb: regularToggleInvalidArb,
  },
  {
    name: 'regular facet toggleExclude payload',
    schemaId:
      'https://schema.thermidor.coveo.com/components/regular-facet.schema.json#/$defs/RegularFacetToggleExcludeAction/properties/payload',
    zodSchema: RegularFacetToggleExcludePayloadSchema,
    validArb: regularToggleValidArb,
    invalidArb: regularToggleInvalidArb,
  },
  {
    name: 'numeric facet toggleSelect payload',
    schemaId:
      'https://schema.thermidor.coveo.com/components/numeric-facet.schema.json#/$defs/NumericFacetToggleSelectAction/properties/payload',
    zodSchema: NumericFacetToggleSelectPayloadSchema,
    validArb: numericToggleValidArb,
    invalidArb: numericToggleInvalidArb,
  },
  {
    name: 'date facet toggleSelect payload',
    schemaId:
      'https://schema.thermidor.coveo.com/components/date-facet.schema.json#/$defs/DateFacetToggleSelectAction/properties/payload',
    zodSchema: DateFacetToggleSelectPayloadSchema,
    validArb: dateToggleValidArb,
    invalidArb: dateToggleInvalidArb,
  },
  {
    name: 'category facet selectPath payload',
    schemaId:
      'https://schema.thermidor.coveo.com/components/category-facet.schema.json#/$defs/CategoryFacetSelectPathAction/properties/payload',
    zodSchema: CategoryFacetSelectPathPayloadSchema,
    validArb: categoryToggleValidArb,
    invalidArb: categoryToggleInvalidArb,
  },
  {
    name: 'regular facet search payload',
    schemaId:
      'https://schema.thermidor.coveo.com/components/regular-facet.schema.json#/$defs/RegularFacetSearchAction/properties/payload',
    zodSchema: RegularFacetSchema.shape.actions.shape.search.shape.payload,
    validArb: regularSearchValidArb,
    invalidArb: regularSearchInvalidArb,
  },
  {
    name: 'category facet search payload',
    schemaId:
      'https://schema.thermidor.coveo.com/components/category-facet.schema.json#/$defs/CategoryFacetSearchAction/properties/payload',
    zodSchema: CategoryFacetSearchPayloadSchema,
    validArb: categorySearchValidArb,
    invalidArb: categorySearchInvalidArb,
  },
  {
    name: 'numeric facet applyCustomRange payload',
    schemaId:
      'https://schema.thermidor.coveo.com/components/numeric-facet.schema.json#/$defs/NumericFacetApplyCustomRangeAction/properties/payload',
    zodSchema: NumericFacetApplyCustomRangePayloadSchema,
    validArb: numericApplyCustomRangeValidArb,
    invalidArb: numericApplyCustomRangeInvalidArb,
  },
  {
    name: 'date facet applyCustomRange payload',
    schemaId:
      'https://schema.thermidor.coveo.com/components/date-facet.schema.json#/$defs/DateFacetApplyCustomRangeAction/properties/payload',
    zodSchema: DateFacetApplyCustomRangePayloadSchema,
    validArb: dateApplyCustomRangeValidArb,
    invalidArb: dateApplyCustomRangeInvalidArb,
  },
];

/**
 * Feature: commerce-facet-schemas, Property 3: Action payload validity
 *
 * For any facet action that carries a payload (`search`, `applyCustomRange`, `toggleSelect`, etc.) and for any
 * generated payload conforming to that action's documented shape and bounds,
 * validation accepts the payload; and for any payload that violates a documented
 * bound (query length, numeric/date range field types, `ranges` minItems) or
 * contains a property not defined by the payload schema, validation rejects the
 * payload. Validated against both Ajv (2020-12) and the generated Zod payload
 * schemas, which must agree.
 *
 * Validates: Requirements 1.9, 2.9, 3.7, 4.8, 6.4
 */
describe('Feature: commerce-facet-schemas, Property 3: Action payload validity', () => {
  for (const testCase of cases) {
    const ajvValidate = ajvValidatorFor(testCase.schemaId);

    it(`${testCase.name} accepts conforming payloads`, () => {
      fc.assert(
        fc.property(testCase.validArb, (payload) => {
          expect(ajvValidate(payload)).toBe(true);
          expect(testCase.zodSchema.safeParse(payload).success).toBe(true);
        }),
        {numRuns: NUM_RUNS}
      );
    });

    it(`${testCase.name} rejects bound/extra-property violations`, () => {
      fc.assert(
        fc.property(testCase.invalidArb, (payload) => {
          expect(ajvValidate(payload)).toBe(false);
          expect(testCase.zodSchema.safeParse(payload).success).toBe(false);
        }),
        {numRuns: NUM_RUNS}
      );
    });
  }
});
