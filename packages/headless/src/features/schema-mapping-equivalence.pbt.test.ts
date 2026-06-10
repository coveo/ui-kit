import {z} from '@coveo/bueno/zod';
import fc from 'fast-check';

/**
 * Feature: headless-bueno-zod-migration, Property 1: Schema Mapping Equivalence
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.10, 3.11
 *
 * For any Bueno schema definition and any input value, the translated Zod schema
 * SHALL produce the same accept/reject verdict as the original Bueno schema.
 *
 * Since Bueno imports are removed, we verify Zod schemas correctly accept/reject
 * inputs according to documented Bueno behavior.
 */
describe('Property 1: Schema Mapping Equivalence', () => {
  describe('String schemas', () => {
    describe('z.string().check(z.minLength(1)) — required non-empty string', () => {
      const schema = z.string().check(z.minLength(1));

      it('rejects empty strings', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(false);
      });

      it('accepts any non-empty string', () => {
        fc.assert(
          fc.property(fc.string({minLength: 1}), (s) => {
            const result = schema.safeParse(s);
            expect(result.success).toBe(true);
          }),
          {numRuns: 100}
        );
      });

      it('rejects non-string values', () => {
        const nonStrings = fc.oneof(
          fc.integer(),
          fc.boolean(),
          fc.constant(null),
          fc.constant(undefined),
          fc.array(fc.anything()),
          fc.object()
        );

        fc.assert(
          fc.property(nonStrings, (value) => {
            const result = schema.safeParse(value);
            expect(result.success).toBe(false);
          }),
          {numRuns: 100}
        );
      });
    });

    describe('z.optional(z.string()) — optional string', () => {
      const schema = z.optional(z.string());

      it('accepts undefined', () => {
        const result = schema.safeParse(undefined);
        expect(result.success).toBe(true);
      });

      it('accepts any string including empty', () => {
        fc.assert(
          fc.property(fc.string(), (s) => {
            const result = schema.safeParse(s);
            expect(result.success).toBe(true);
          }),
          {numRuns: 100}
        );
      });

      it('rejects non-string, non-undefined values', () => {
        const invalid = fc.oneof(
          fc.integer(),
          fc.boolean(),
          fc.constant(null),
          fc.array(fc.anything()),
          fc.object()
        );

        fc.assert(
          fc.property(invalid, (value) => {
            const result = schema.safeParse(value);
            expect(result.success).toBe(false);
          }),
          {numRuns: 100}
        );
      });
    });

    describe('z.enum(values) — constrained string set', () => {
      const allowedValues = ['alpha', 'beta', 'gamma'] as const;
      const schema = z.enum(allowedValues);

      it('accepts only values in the set', () => {
        fc.assert(
          fc.property(fc.constantFrom(...allowedValues), (value) => {
            const result = schema.safeParse(value);
            expect(result.success).toBe(true);
          }),
          {numRuns: 100}
        );
      });

      it('rejects strings not in the set', () => {
        const notInSet = fc
          .string({minLength: 1})
          .filter(
            (s) => !allowedValues.includes(s as (typeof allowedValues)[number])
          );

        fc.assert(
          fc.property(notInSet, (value) => {
            const result = schema.safeParse(value);
            expect(result.success).toBe(false);
          }),
          {numRuns: 100}
        );
      });

      it('rejects non-string values', () => {
        const nonStrings = fc.oneof(
          fc.integer(),
          fc.boolean(),
          fc.constant(null),
          fc.constant(undefined)
        );

        fc.assert(
          fc.property(nonStrings, (value) => {
            const result = schema.safeParse(value);
            expect(result.success).toBe(false);
          }),
          {numRuns: 100}
        );
      });
    });

    describe('z.optional(z.string().check(z.minLength(1))) — optional non-empty string', () => {
      const schema = z.optional(z.string().check(z.minLength(1)));

      it('accepts undefined', () => {
        const result = schema.safeParse(undefined);
        expect(result.success).toBe(true);
      });

      it('accepts non-empty strings', () => {
        fc.assert(
          fc.property(fc.string({minLength: 1}), (s) => {
            const result = schema.safeParse(s);
            expect(result.success).toBe(true);
          }),
          {numRuns: 100}
        );
      });

      it('rejects empty string', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(false);
      });
    });

    describe('z.string().check(z.regex(pattern)) — string with regex constraint', () => {
      const pattern = /^[a-z]+$/;
      const schema = z.string().check(z.regex(pattern));

      it('accepts strings matching the pattern', () => {
        const validStrings = fc.stringMatching(/^[a-z]+$/);

        fc.assert(
          fc.property(validStrings, (s) => {
            const result = schema.safeParse(s);
            expect(result.success).toBe(true);
          }),
          {numRuns: 100}
        );
      });

      it('rejects strings not matching the pattern', () => {
        const invalidStrings = fc
          .string({minLength: 1})
          .filter((s) => !pattern.test(s));

        fc.assert(
          fc.property(invalidStrings, (s) => {
            const result = schema.safeParse(s);
            expect(result.success).toBe(false);
          }),
          {numRuns: 100}
        );
      });
    });
  });

  describe('Number schemas', () => {
    describe('z.number().check(z.minimum(N)) — required number with minimum', () => {
      const minValue = 5;
      const schema = z.number().check(z.minimum(minValue));

      it('rejects numbers below N', () => {
        fc.assert(
          fc.property(fc.integer({min: -1000, max: minValue - 1}), (n) => {
            const result = schema.safeParse(n);
            expect(result.success).toBe(false);
          }),
          {numRuns: 100}
        );
      });

      it('accepts numbers >= N', () => {
        fc.assert(
          fc.property(fc.integer({min: minValue, max: 10000}), (n) => {
            const result = schema.safeParse(n);
            expect(result.success).toBe(true);
          }),
          {numRuns: 100}
        );
      });

      it('rejects non-number values', () => {
        const nonNumbers = fc.oneof(
          fc.string(),
          fc.boolean(),
          fc.constant(null),
          fc.constant(undefined)
        );

        fc.assert(
          fc.property(nonNumbers, (value) => {
            const result = schema.safeParse(value);
            expect(result.success).toBe(false);
          }),
          {numRuns: 100}
        );
      });
    });

    describe('z.optional(z.number().check(z.minimum(N))) — optional number with minimum', () => {
      const minValue = 1;
      const schema = z.optional(z.number().check(z.minimum(minValue)));

      it('accepts undefined', () => {
        const result = schema.safeParse(undefined);
        expect(result.success).toBe(true);
      });

      it('accepts numbers >= N', () => {
        fc.assert(
          fc.property(fc.integer({min: minValue, max: 10000}), (n) => {
            const result = schema.safeParse(n);
            expect(result.success).toBe(true);
          }),
          {numRuns: 100}
        );
      });

      it('rejects numbers below N', () => {
        fc.assert(
          fc.property(fc.integer({min: -1000, max: minValue - 1}), (n) => {
            const result = schema.safeParse(n);
            expect(result.success).toBe(false);
          }),
          {numRuns: 100}
        );
      });

      it('rejects non-number, non-undefined values', () => {
        const invalid = fc.oneof(fc.string(), fc.boolean(), fc.constant(null));

        fc.assert(
          fc.property(invalid, (value) => {
            const result = schema.safeParse(value);
            expect(result.success).toBe(false);
          }),
          {numRuns: 100}
        );
      });
    });
  });

  describe('Boolean schemas', () => {
    describe('z.boolean() — required boolean', () => {
      const schema = z.boolean();

      it('accepts true and false', () => {
        fc.assert(
          fc.property(fc.boolean(), (b) => {
            const result = schema.safeParse(b);
            expect(result.success).toBe(true);
          }),
          {numRuns: 100}
        );
      });

      it('rejects non-boolean values', () => {
        const nonBooleans = fc.oneof(
          fc.string(),
          fc.integer(),
          fc.constant(null),
          fc.constant(undefined),
          fc.object()
        );

        fc.assert(
          fc.property(nonBooleans, (value) => {
            const result = schema.safeParse(value);
            expect(result.success).toBe(false);
          }),
          {numRuns: 100}
        );
      });
    });

    describe('z.optional(z.boolean()) — optional boolean', () => {
      const schema = z.optional(z.boolean());

      it('accepts undefined', () => {
        const result = schema.safeParse(undefined);
        expect(result.success).toBe(true);
      });

      it('accepts true and false', () => {
        fc.assert(
          fc.property(fc.boolean(), (b) => {
            const result = schema.safeParse(b);
            expect(result.success).toBe(true);
          }),
          {numRuns: 100}
        );
      });

      it('rejects non-boolean, non-undefined values', () => {
        const invalid = fc.oneof(
          fc.string(),
          fc.integer(),
          fc.constant(null),
          fc.object()
        );

        fc.assert(
          fc.property(invalid, (value) => {
            const result = schema.safeParse(value);
            expect(result.success).toBe(false);
          }),
          {numRuns: 100}
        );
      });
    });
  });

  describe('Array schemas', () => {
    describe('z.array(z.string().check(z.minLength(1))) — array of non-empty strings', () => {
      const schema = z.array(z.string().check(z.minLength(1)));

      it('accepts arrays of valid non-empty strings', () => {
        fc.assert(
          fc.property(fc.array(fc.string({minLength: 1})), (arr) => {
            const result = schema.safeParse(arr);
            expect(result.success).toBe(true);
          }),
          {numRuns: 100}
        );
      });

      it('accepts empty array', () => {
        const result = schema.safeParse([]);
        expect(result.success).toBe(true);
      });

      it('rejects arrays with empty strings', () => {
        fc.assert(
          fc.property(
            fc.array(fc.string({minLength: 1}), {minLength: 0}).chain((arr) =>
              fc.nat({max: arr.length}).map((idx) => {
                const copy = [...arr];
                copy.splice(idx, 0, '');
                return copy;
              })
            ),
            (arr) => {
              const result = schema.safeParse(arr);
              expect(result.success).toBe(false);
            }
          ),
          {numRuns: 100}
        );
      });

      it('rejects non-array values', () => {
        const nonArrays = fc.oneof(
          fc.string(),
          fc.integer(),
          fc.boolean(),
          fc.constant(null),
          fc.constant(undefined),
          fc.object()
        );

        fc.assert(
          fc.property(nonArrays, (value) => {
            const result = schema.safeParse(value);
            expect(result.success).toBe(false);
          }),
          {numRuns: 100}
        );
      });
    });

    describe('z.array(z.string()) with length constraints — bounded arrays', () => {
      const schema = z.array(z.string()).check(z.minLength(1), z.maxLength(5));

      it('accepts arrays of strings with length between 1 and 5', () => {
        fc.assert(
          fc.property(
            fc.array(fc.string(), {minLength: 1, maxLength: 5}),
            (arr) => {
              const result = schema.safeParse(arr);
              expect(result.success).toBe(true);
            }
          ),
          {numRuns: 100}
        );
      });

      it('rejects empty array (below minLength)', () => {
        const result = schema.safeParse([]);
        expect(result.success).toBe(false);
      });

      it('rejects arrays exceeding maxLength', () => {
        fc.assert(
          fc.property(
            fc.array(fc.string(), {minLength: 6, maxLength: 20}),
            (arr) => {
              const result = schema.safeParse(arr);
              expect(result.success).toBe(false);
            }
          ),
          {numRuns: 100}
        );
      });
    });
  });

  describe('Record/Object schemas', () => {
    describe('z.object({field: z.string()}) — required object fields', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      it('accepts objects with all required fields of correct type', () => {
        fc.assert(
          fc.property(fc.string(), fc.integer(), (name, age) => {
            const result = schema.safeParse({name, age});
            expect(result.success).toBe(true);
          }),
          {numRuns: 100}
        );
      });

      it('rejects objects missing required fields', () => {
        fc.assert(
          fc.property(fc.string(), (name) => {
            const result = schema.safeParse({name});
            expect(result.success).toBe(false);
          }),
          {numRuns: 100}
        );
      });

      it('rejects objects with wrong field types', () => {
        fc.assert(
          fc.property(fc.integer(), fc.string(), (name, age) => {
            const result = schema.safeParse({name, age});
            expect(result.success).toBe(false);
          }),
          {numRuns: 100}
        );
      });

      it('rejects non-object values', () => {
        const nonObjects = fc.oneof(
          fc.string(),
          fc.integer(),
          fc.boolean(),
          fc.constant(null),
          fc.constant(undefined)
        );

        fc.assert(
          fc.property(nonObjects, (value) => {
            const result = schema.safeParse(value);
            expect(result.success).toBe(false);
          }),
          {numRuns: 100}
        );
      });
    });

    describe('z.object with optional fields — mixed required/optional', () => {
      const schema = z.object({
        id: z.string().check(z.minLength(1)),
        label: z.optional(z.string()),
        count: z.optional(z.number().check(z.minimum(0))),
      });

      it('accepts objects with required field and optional fields present', () => {
        fc.assert(
          fc.property(
            fc.string({minLength: 1}),
            fc.string(),
            fc.nat(),
            (id, label, count) => {
              const result = schema.safeParse({id, label, count});
              expect(result.success).toBe(true);
            }
          ),
          {numRuns: 100}
        );
      });

      it('accepts objects with required field only (optionals omitted)', () => {
        fc.assert(
          fc.property(fc.string({minLength: 1}), (id) => {
            const result = schema.safeParse({id});
            expect(result.success).toBe(true);
          }),
          {numRuns: 100}
        );
      });

      it('rejects objects missing required field', () => {
        fc.assert(
          fc.property(fc.string(), fc.nat(), (label, count) => {
            const result = schema.safeParse({label, count});
            expect(result.success).toBe(false);
          }),
          {numRuns: 100}
        );
      });

      it('rejects objects with empty required field', () => {
        const result = schema.safeParse({id: ''});
        expect(result.success).toBe(false);
      });
    });
  });
});
