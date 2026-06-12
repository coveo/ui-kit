import fc from 'fast-check';
import {validateRelativeDate} from './relative-date.js';

const validRelativeDateUnits = [
  'minute',
  'hour',
  'day',
  'week',
  'month',
  'quarter',
  'year',
] as const;

/**
 * Feature: headless-bueno-zod-migration, Property 6: Relative Date Conditional Validation
 * Validates: Requirements 6.2, 6.3
 *
 * For any RelativeDate object where period is 'past' or 'next', the schema rejects
 * the object if amount is missing or less than 1, or if unit is missing or not one of
 * the valid units. For any RelativeDate object where period is 'now', the schema accepts
 * the object regardless of amount and unit values.
 */
describe('Property 6: Relative Date Conditional Validation', () => {
  const validUnitArb = fc.constantFrom(...validRelativeDateUnits);
  const pastOrNextArb = fc.constantFrom('past' as const, 'next' as const);

  describe('period "now" accepts regardless of amount and unit', () => {
    it('accepts {period: "now"} with any amount/unit combination', () => {
      const nowDateArb = fc.record({
        period: fc.constant('now' as const),
        amount: fc.option(
          fc.nat({max: 1000}).map((n) => n + 1),
          {
            nil: undefined,
          }
        ),
        unit: fc.option(validUnitArb, {nil: undefined}),
      });

      fc.assert(
        fc.property(nowDateArb, (date) => {
          expect(() => validateRelativeDate(date)).not.toThrow();
        }),
        {numRuns: 100}
      );
    });
  });

  describe('period "past" or "next" with valid amount and unit accepts', () => {
    it('accepts {period: "past"|"next", amount: N (>=1), unit: valid_unit}', () => {
      // Constrain amount to avoid hitting the API minimum date (year 1401).
      // Max ~600 years in the past is safe from current year.
      const validPastOrNextArb = fc.record({
        period: pastOrNextArb,
        amount: fc.integer({min: 1, max: 500}),
        unit: validUnitArb,
      });

      fc.assert(
        fc.property(validPastOrNextArb, (date) => {
          expect(() => validateRelativeDate(date)).not.toThrow();
        }),
        {numRuns: 100}
      );
    });
  });

  describe('period "past" or "next" with amount < 1 rejects', () => {
    it('rejects {period: "past"|"next", amount: 0 or negative, unit: valid_unit}', () => {
      const invalidAmountArb = fc.record({
        period: pastOrNextArb,
        amount: fc.integer({min: -100, max: 0}),
        unit: validUnitArb,
      });

      fc.assert(
        fc.property(invalidAmountArb, (date) => {
          expect(() => validateRelativeDate(date)).toThrow();
        }),
        {numRuns: 100}
      );
    });
  });

  describe('period "past" or "next" with missing amount rejects', () => {
    it('rejects {period: "past"|"next"} when amount is missing', () => {
      const missingAmountArb = fc.record({
        period: pastOrNextArb,
        unit: validUnitArb,
      });

      fc.assert(
        fc.property(missingAmountArb, (date) => {
          expect(() => validateRelativeDate(date as any)).toThrow();
        }),
        {numRuns: 100}
      );
    });
  });

  describe('period "past" or "next" with missing unit rejects', () => {
    it('rejects {period: "past"|"next"} when unit is missing', () => {
      const missingUnitArb = fc.record({
        period: pastOrNextArb,
        amount: fc.integer({min: 1, max: 1000}),
      });

      fc.assert(
        fc.property(missingUnitArb, (date) => {
          expect(() => validateRelativeDate(date as any)).toThrow();
        }),
        {numRuns: 100}
      );
    });
  });

  describe('period "past" or "next" with invalid unit rejects', () => {
    it('rejects {period: "past"|"next", amount: valid, unit: invalid}', () => {
      const invalidUnitArb = fc
        .string({minLength: 1, maxLength: 20})
        .filter(
          (s) =>
            !validRelativeDateUnits.includes(
              s as (typeof validRelativeDateUnits)[number]
            )
        );

      const invalidUnitDateArb = fc.record({
        period: pastOrNextArb,
        amount: fc.integer({min: 1, max: 1000}),
        unit: invalidUnitArb,
      });

      fc.assert(
        fc.property(invalidUnitDateArb, (date) => {
          expect(() => validateRelativeDate(date as any)).toThrow();
        }),
        {numRuns: 100}
      );
    });
  });
});
