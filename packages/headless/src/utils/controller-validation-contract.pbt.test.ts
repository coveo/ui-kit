import {z} from '@coveo/bueno/zod';
import fc from 'fast-check';
import {describe, expect, it, vi} from 'vitest';
import {buildMockSearchEngine} from '../test/mock-engine-v2.js';
import {createMockState} from '../test/mock-state.js';
import {validateInitialState, validateOptions} from './validate-payload.js';

/**
 * Feature: headless-bueno-zod-migration, Property 5: Controller Validation Contract
 * Validates: Requirements 2.7, 4.2, 4.3, 4.4
 *
 * For any Zod object schema and for any options/initialState object,
 * `validateOptions`/`validateInitialState` SHALL return the parsed value when
 * the object satisfies the schema, and SHALL throw an error and call
 * `engine.logger.error` with a message containing the function name when the
 * object does not satisfy the schema.
 */
describe('Property 5: Controller Validation Contract', () => {
  function buildEngine() {
    return buildMockSearchEngine(createMockState());
  }

  const schema = z.object({
    name: z.string(),
    count: z.number(),
  });

  const fnNameArb = fc
    .string({minLength: 1, maxLength: 50})
    .filter((s) => s.trim().length > 0);

  describe('validateOptions', () => {
    it('returns the parsed object without throwing for valid objects', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.integer(),
          fnNameArb,
          (name, count, fnName) => {
            const engine = buildEngine();
            const obj = {name, count};
            const result = validateOptions(engine, schema, obj, fnName);
            expect(result).toEqual({name, count});
            expect(engine.logger.error).not.toHaveBeenCalled();
          }
        ),
        {numRuns: 100}
      );
    });

    it('throws and calls engine.logger.error for invalid objects', () => {
      const invalidPayloads = fc.oneof(
        fc.record({name: fc.integer(), count: fc.integer()}),
        fc.record({name: fc.string(), count: fc.string()}),
        fc.record({name: fc.boolean(), count: fc.boolean()}),
        fc.record({name: fc.constant(null), count: fc.constant(null)})
      );

      fc.assert(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fc.property(invalidPayloads, fnNameArb, (payload: any, fnName) => {
          const engine = buildEngine();
          expect(() =>
            validateOptions(engine, schema, payload, fnName)
          ).toThrow();
          expect(engine.logger.error).toHaveBeenCalled();
          const errorArg = engine.logger.error.mock.calls[0][0];
          expect(errorArg.message).toContain(fnName);
          expect(errorArg.message).toContain('Check the options of');
        }),
        {numRuns: 100}
      );
    });

    it('returns undefined when obj is undefined', () => {
      fc.assert(
        fc.property(fnNameArb, (fnName) => {
          const engine = buildEngine();
          const result = validateOptions(engine, schema, undefined, fnName);
          expect(result).toBeUndefined();
          expect(engine.logger.error).not.toHaveBeenCalled();
        }),
        {numRuns: 100}
      );
    });
  });

  describe('validateInitialState', () => {
    it('returns the parsed object without throwing for valid objects', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.integer(),
          fnNameArb,
          (name, count, fnName) => {
            const engine = buildEngine();
            const obj = {name, count};
            const result = validateInitialState(engine, schema, obj, fnName);
            expect(result).toEqual({name, count});
            expect(engine.logger.error).not.toHaveBeenCalled();
          }
        ),
        {numRuns: 100}
      );
    });

    it('throws and calls engine.logger.error for invalid objects', () => {
      const invalidPayloads = fc.oneof(
        fc.record({name: fc.integer(), count: fc.integer()}),
        fc.record({name: fc.string(), count: fc.string()}),
        fc.record({name: fc.boolean(), count: fc.boolean()}),
        fc.record({name: fc.constant(null), count: fc.constant(null)})
      );

      fc.assert(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fc.property(invalidPayloads, fnNameArb, (payload: any, fnName) => {
          const engine = buildEngine();
          expect(() =>
            validateInitialState(engine, schema, payload, fnName)
          ).toThrow();
          expect(engine.logger.error).toHaveBeenCalled();
          const errorArg = engine.logger.error.mock.calls[0][0];
          expect(errorArg.message).toContain(fnName);
          expect(errorArg.message).toContain('Check the initialState of');
        }),
        {numRuns: 100}
      );
    });

    it('returns undefined when obj is undefined', () => {
      fc.assert(
        fc.property(fnNameArb, (fnName) => {
          const engine = buildEngine();
          const result = validateInitialState(
            engine,
            schema,
            undefined,
            fnName
          );
          expect(result).toBeUndefined();
          expect(engine.logger.error).not.toHaveBeenCalled();
        }),
        {numRuns: 100}
      );
    });
  });
});
