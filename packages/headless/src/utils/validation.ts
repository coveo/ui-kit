import {type ZodSchema, z} from 'zod';

/**
 * Error thrown when validation fails.
 * Compatible with bueno's SchemaValidationError.
 */
export class SchemaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}

/**
 * Validates data against a Zod schema and throws a SchemaValidationError on failure.
 * This provides a bueno-like API for validation.
 *
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @param context - Optional context message for error reporting
 * @returns The validated and parsed data
 * @throws {SchemaValidationError} When validation fails
 */
export function validateSchema<T>(
  schema: ZodSchema<T>,
  data: unknown,
  context = ''
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((err) => {
      const path = err.path.join('.');
      return `${path}: ${err.message}`;
    });

    const message = `
  The following properties are invalid:

    ${errors.join('\n\t')}
  
  ${context}
  `;

    throw new SchemaValidationError(message);
  }

  return result.data;
}

/**
 * Type guard functions compatible with bueno utilities
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isArray(value: unknown): value is Array<unknown> {
  return Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return Object.prototype.toString.call(value) === '[object String]';
}

/**
 * Helper to create a Zod schema with default values similar to bueno's Schema
 */
export function createSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).partial();
}
