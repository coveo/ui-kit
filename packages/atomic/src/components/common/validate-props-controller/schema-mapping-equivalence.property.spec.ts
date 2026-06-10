import fc from 'fast-check';
import {z} from '@coveo/bueno/zod';
import {StringValue, NumberValue, BooleanValue} from '@coveo/bueno';
import {describe, it, expect} from 'vitest';

/**
 * Feature: atomic-bueno-zod-migration, Property 1: Schema Mapping Equivalence
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
 *
 * For any Bueno schema definition (using StringValue with constrainTo, NumberValue
 * with min/max, BooleanValue) and for any input value, the translated Zod schema
 * SHALL produce the same accept/reject verdict as the original Bueno schema.
 */
describe('Property 1: Schema Mapping Equivalence', () => {
  describe('StringValue({constrainTo}) vs z.enum()', () => {
    const constrainedValues = ['a', 'b', 'c'] as const;
    const buenoSchema = new StringValue({constrainTo: [...constrainedValues]});
    const zodSchema = z.enum(constrainedValues);

    it('when a string is provided, both accept/reject the same values', () => {
      fc.assert(
        fc.property(fc.string(), (str) => {
          const buenoResult = buenoSchema.validate(str as 'a' | 'b' | 'c');
          const buenoRejects = buenoResult !== null;

          const zodResult = zodSchema.safeParse(str);
          const zodRejects = !zodResult.success;

          expect(zodRejects).toBe(buenoRejects);
        }),
        {numRuns: 100}
      );
    });

    it('both accept values that are in the constrainTo set', () => {
      fc.assert(
        fc.property(fc.constantFrom(...constrainedValues), (validValue) => {
          const buenoResult = buenoSchema.validate(validValue);
          const zodResult = zodSchema.safeParse(validValue);

          expect(buenoResult).toBeNull();
          expect(zodResult.success).toBe(true);
        }),
        {numRuns: 100}
      );
    });

    it('both reject strings not in the constrainTo set', () => {
      fc.assert(
        fc.property(
          fc
            .string()
            .filter((s) => !constrainedValues.includes(s as 'a' | 'b' | 'c')),
          (invalidValue) => {
            const buenoResult = buenoSchema.validate(
              invalidValue as 'a' | 'b' | 'c'
            );
            const zodResult = zodSchema.safeParse(invalidValue);

            expect(buenoResult).not.toBeNull();
            expect(zodResult.success).toBe(false);
          }
        ),
        {numRuns: 100}
      );
    });
  });

  describe('NumberValue({min, max}) vs z.number().check(z.minimum(N), z.maximum(M))', () => {
    const min = 0;
    const max = 100;
    const buenoSchema = new NumberValue({min, max});
    const zodSchema = z.number().check(z.minimum(min), z.maximum(max));

    it('both accept/reject the same numbers for given min/max bounds', () => {
      fc.assert(
        fc.property(fc.double({noNaN: true}), (num) => {
          const buenoResult = buenoSchema.validate(num);
          const buenoRejects = buenoResult !== null;

          const zodResult = zodSchema.safeParse(num);
          const zodRejects = !zodResult.success;

          expect(zodRejects).toBe(buenoRejects);
        }),
        {numRuns: 100}
      );
    });

    it('both accept numbers within range [min, max]', () => {
      fc.assert(
        fc.property(fc.double({min, max, noNaN: true}), (validNum) => {
          const buenoResult = buenoSchema.validate(validNum);
          const zodResult = zodSchema.safeParse(validNum);

          expect(buenoResult).toBeNull();
          expect(zodResult.success).toBe(true);
        }),
        {numRuns: 100}
      );
    });

    it('both reject numbers below min', () => {
      fc.assert(
        fc.property(
          fc.double({max: min - 0.001, noNaN: true, min: -1e10}),
          (belowMin) => {
            const buenoResult = buenoSchema.validate(belowMin);
            const zodResult = zodSchema.safeParse(belowMin);

            expect(buenoResult).not.toBeNull();
            expect(zodResult.success).toBe(false);
          }
        ),
        {numRuns: 100}
      );
    });

    it('both reject numbers above max', () => {
      fc.assert(
        fc.property(
          fc.double({min: max + 0.001, noNaN: true, max: 1e10}),
          (aboveMax) => {
            const buenoResult = buenoSchema.validate(aboveMax);
            const zodResult = zodSchema.safeParse(aboveMax);

            expect(buenoResult).not.toBeNull();
            expect(zodResult.success).toBe(false);
          }
        ),
        {numRuns: 100}
      );
    });
  });

  describe('BooleanValue() vs z.boolean()', () => {
    const buenoSchema = new BooleanValue();
    const zodSchema = z.boolean();

    it('both accept true and false', () => {
      fc.assert(
        fc.property(fc.boolean(), (val) => {
          const buenoResult = buenoSchema.validate(val);
          const zodResult = zodSchema.safeParse(val);

          expect(buenoResult).toBeNull();
          expect(zodResult.success).toBe(true);
        }),
        {numRuns: 100}
      );
    });

    it('both reject non-boolean values', () => {
      const nonBooleanArb = fc.oneof(
        fc.string(),
        fc.integer(),
        fc.constant(null),
        fc.array(fc.integer())
      );

      fc.assert(
        fc.property(nonBooleanArb, (val) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const buenoResult = buenoSchema.validate(val as any);
          const buenoRejects = buenoResult !== null;

          const zodResult = zodSchema.safeParse(val);
          const zodRejects = !zodResult.success;

          expect(zodRejects).toBe(buenoRejects);
        }),
        {numRuns: 100}
      );
    });
  });
});
