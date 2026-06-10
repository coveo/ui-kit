import * as z from '@coveo/bueno/zod';
import fc from 'fast-check';
import {
  nonEmptyString,
  nonEmptyStringArray,
  nonRequiredEmptyAllowedString,
  optionalNonEmptyVersionString,
  optionalTrackingId,
  requiredEmptyAllowedString,
  requiredNonEmptyString,
  requiredTrackingId,
  serializeSchemaValidationError,
  validatePayload,
  validatePayloadAndThrow,
} from './validate-payload.js';

/**
 * Feature: headless-bueno-zod-migration, Property 2: validatePayload Contract
 * Validates: Requirements 2.1, 2.2
 *
 * For any Zod schema and any payload, `validatePayload(payload, schema)` returns
 * `{payload}` with no error when valid, and `{payload, error}` where error is a
 * valid SerializedError when invalid.
 */
describe('Property 2: validatePayload Contract', () => {
  const schema = z.object({name: z.string()});

  it('returns {payload} with no error for valid payloads', () => {
    fc.assert(
      fc.property(fc.string(), (name) => {
        const result = validatePayload({name}, schema);
        expect(result.payload).toEqual({name});
        expect(result.error).toBeUndefined();
      }),
      {numRuns: 100}
    );
  });

  it('returns {payload, error} with SerializedError shape for invalid payloads', () => {
    const invalidPayloads = fc.oneof(
      fc.integer(),
      fc.boolean(),
      fc.constant(null),
      fc.constant(undefined),
      fc.record({name: fc.integer()}),
      fc.record({name: fc.boolean()}),
      fc.record({name: fc.constant(null)})
    );

    fc.assert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fc.property(invalidPayloads, (payload: any) => {
        const result = validatePayload(payload, schema as any);
        expect(result.payload).toEqual(payload);
        expect(result.error).toBeDefined();
        expect(typeof result.error!.message).toBe('string');
        expect(typeof result.error!.name).toBe('string');
      }),
      {numRuns: 100}
    );
  });

  it('validatePayloadAndThrow throws on invalid input', () => {
    const invalidPayloads = fc.oneof(
      fc.integer(),
      fc.boolean(),
      fc.constant(null),
      fc.constant(undefined),
      fc.record({name: fc.integer()})
    );

    fc.assert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fc.property(invalidPayloads, (payload: any) => {
        expect(() => validatePayloadAndThrow(payload, schema as any)).toThrow();
      }),
      {numRuns: 100}
    );
  });

  it('validatePayloadAndThrow returns {payload} for valid input', () => {
    fc.assert(
      fc.property(fc.string(), (name) => {
        const result = validatePayloadAndThrow({name}, schema);
        expect(result.payload).toEqual({name});
      }),
      {numRuns: 100}
    );
  });
});

/**
 * Feature: headless-bueno-zod-migration, Property 3: Pre-built Schema Equivalence
 * Validates: Requirements 2.3, 2.4, 2.5
 *
 * For any string value, pre-built Zod schemas accept the value if and only if
 * the original Bueno pre-built instances would have accepted it.
 */
describe('Property 3: Pre-built Schema Equivalence', () => {
  describe('requiredNonEmptyString', () => {
    it('accepts any non-empty string', () => {
      fc.assert(
        fc.property(fc.string({minLength: 1}), (s) => {
          const result = requiredNonEmptyString.safeParse(s);
          expect(result.success).toBe(true);
        }),
        {numRuns: 100}
      );
    });

    it('rejects empty string', () => {
      const result = requiredNonEmptyString.safeParse('');
      expect(result.success).toBe(false);
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
          const result = requiredNonEmptyString.safeParse(value);
          expect(result.success).toBe(false);
        }),
        {numRuns: 100}
      );
    });
  });

  describe('nonEmptyString (optional, non-empty)', () => {
    it('accepts undefined', () => {
      const result = nonEmptyString.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it('accepts non-empty strings', () => {
      fc.assert(
        fc.property(fc.string({minLength: 1}), (s) => {
          const result = nonEmptyString.safeParse(s);
          expect(result.success).toBe(true);
        }),
        {numRuns: 100}
      );
    });

    it('rejects empty string', () => {
      const result = nonEmptyString.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('requiredEmptyAllowedString', () => {
    it('accepts any string including empty', () => {
      fc.assert(
        fc.property(fc.string(), (s) => {
          const result = requiredEmptyAllowedString.safeParse(s);
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
        fc.constant(undefined)
      );

      fc.assert(
        fc.property(nonStrings, (value) => {
          const result = requiredEmptyAllowedString.safeParse(value);
          expect(result.success).toBe(false);
        }),
        {numRuns: 100}
      );
    });
  });

  describe('nonRequiredEmptyAllowedString', () => {
    it('accepts undefined', () => {
      const result = nonRequiredEmptyAllowedString.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it('accepts any string including empty', () => {
      fc.assert(
        fc.property(fc.string(), (s) => {
          const result = nonRequiredEmptyAllowedString.safeParse(s);
          expect(result.success).toBe(true);
        }),
        {numRuns: 100}
      );
    });
  });

  describe('nonEmptyStringArray', () => {
    it('accepts arrays of non-empty strings', () => {
      fc.assert(
        fc.property(fc.array(fc.string({minLength: 1})), (arr) => {
          const result = nonEmptyStringArray.safeParse(arr);
          expect(result.success).toBe(true);
        }),
        {numRuns: 100}
      );
    });

    it('rejects arrays containing empty strings', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({minLength: 1}), {minLength: 1}).chain((arr) =>
            fc.nat({max: arr.length}).map((idx) => {
              const copy = [...arr];
              copy.splice(idx, 0, '');
              return copy;
            })
          ),
          (arr) => {
            const result = nonEmptyStringArray.safeParse(arr);
            expect(result.success).toBe(false);
          }
        ),
        {numRuns: 100}
      );
    });
  });

  describe('optionalNonEmptyVersionString', () => {
    it('accepts undefined', () => {
      const result = optionalNonEmptyVersionString.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it('accepts valid semver-like strings', () => {
      fc.assert(
        fc.property(
          fc.tuple(fc.nat({max: 999}), fc.nat({max: 999}), fc.nat({max: 999})),
          ([major, minor, patch]) => {
            const version = `${major}.${minor}.${patch}`;
            const result = optionalNonEmptyVersionString.safeParse(version);
            expect(result.success).toBe(true);
          }
        ),
        {numRuns: 100}
      );
    });

    it('rejects strings not matching version pattern', () => {
      const invalidVersions = fc.oneof(
        fc.constant('1.2'),
        fc.constant('abc'),
        fc.constant('1.2.3.4'),
        fc.constant('')
      );

      fc.assert(
        fc.property(invalidVersions, (s) => {
          const result = optionalNonEmptyVersionString.safeParse(s);
          expect(result.success).toBe(false);
        }),
        {numRuns: 100}
      );
    });
  });

  describe('optionalTrackingId', () => {
    it('accepts undefined', () => {
      const result = optionalTrackingId.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it('accepts valid tracking IDs (alphanumeric, dashes, underscores, dots, 1-100 chars)', () => {
      const validTrackingId = fc.stringMatching(/^[a-zA-Z0-9_\-.]{1,100}$/);

      fc.assert(
        fc.property(validTrackingId, (id) => {
          const result = optionalTrackingId.safeParse(id);
          expect(result.success).toBe(true);
        }),
        {numRuns: 100}
      );
    });

    it('rejects empty string', () => {
      const result = optionalTrackingId.safeParse('');
      expect(result.success).toBe(false);
    });

    it('rejects strings with invalid characters', () => {
      const invalidChars = fc
        .string({minLength: 1, maxLength: 50})
        .filter((s) => !/^[a-zA-Z0-9_\-.]+$/.test(s));

      fc.assert(
        fc.property(invalidChars, (s) => {
          const result = optionalTrackingId.safeParse(s);
          expect(result.success).toBe(false);
        }),
        {numRuns: 100}
      );
    });
  });

  describe('requiredTrackingId', () => {
    it('accepts valid tracking IDs', () => {
      const validTrackingId = fc.stringMatching(/^[a-zA-Z0-9_\-.]{1,100}$/);

      fc.assert(
        fc.property(validTrackingId, (id) => {
          const result = requiredTrackingId.safeParse(id);
          expect(result.success).toBe(true);
        }),
        {numRuns: 100}
      );
    });

    it('rejects undefined', () => {
      const result = requiredTrackingId.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('rejects empty string', () => {
      const result = requiredTrackingId.safeParse('');
      expect(result.success).toBe(false);
    });
  });
});

/**
 * Feature: headless-bueno-zod-migration, Property 4: Error Serialization Shape
 * Validates: Requirements 2.6
 *
 * For any ZodError instance, `serializeSchemaValidationError(error)` produces
 * an object with message, name, stack properties conforming to SerializedError.
 */
describe('Property 4: Error Serialization Shape', () => {
  it('produces valid SerializedError from ZodError instances', () => {
    const schema = z.object({value: z.string()});

    const invalidValues = fc.oneof(
      fc.integer(),
      fc.boolean(),
      fc.constant(null),
      fc.record({value: fc.integer()}),
      fc.record({value: fc.boolean()}),
      fc.record({value: fc.constant(null)})
    );

    fc.assert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fc.property(invalidValues, (payload: any) => {
        const result = schema.safeParse(payload);
        if (!result.success) {
          const serialized = serializeSchemaValidationError(result.error);
          expect(typeof serialized.message).toBe('string');
          expect(typeof serialized.name).toBe('string');
          expect(
            serialized.stack === undefined ||
              typeof serialized.stack === 'string'
          ).toBe(true);
        }
      }),
      {numRuns: 100}
    );
  });

  it('produces valid SerializedError from generic Error instances', () => {
    fc.assert(
      fc.property(fc.string({minLength: 1}), (msg) => {
        const error = new Error(msg);
        const serialized = serializeSchemaValidationError(error);
        expect(serialized.message).toBe(msg);
        expect(serialized.name).toBe('Error');
        expect(
          serialized.stack === undefined || typeof serialized.stack === 'string'
        ).toBe(true);
      }),
      {numRuns: 100}
    );
  });
});
