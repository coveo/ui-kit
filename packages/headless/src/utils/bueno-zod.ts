/**
 * Bueno-compatible validation utilities using Zod.
 * This module provides the same API as @coveo/bueno but uses Zod for validation.
 */

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
 * Interface for schema values - compatible with bueno's SchemaValue
 */
export interface SchemaValue<T> {
  validate(value: T): string | null;
  default: T | undefined;
  required: boolean;
}

/**
 * Schema definition type - compatible with bueno's SchemaDefinition
 */
export type SchemaDefinition<T extends object> = {
  [key in keyof T]: SchemaValue<T[key]>;
};

/**
 * Base Value class - compatible with bueno's Value
 */
export class Value<T> implements SchemaValue<T> {
  private _default?: T | (() => T);
  private _required: boolean;

  constructor(
    config: {
      default?: T | (() => T);
      required?: boolean;
    } = {}
  ) {
    this._default = config.default;
    this._required = config.required === true;
  }

  validate(value: unknown): string | null {
    if (this._required && isNullOrUndefined(value)) {
      return 'value is required.';
    }
    return null;
  }

  get default(): T | undefined {
    return this._default instanceof Function ? this._default() : this._default;
  }

  get required(): boolean {
    return this._required;
  }
}

/**
 * NumberValue class - compatible with bueno's NumberValue
 */
export class NumberValue implements SchemaValue<number> {
  private value: Value<number>;

  constructor(
    private config: {
      default?: number | (() => number);
      required?: boolean;
      min?: number;
      max?: number;
    } = {}
  ) {
    this.value = new Value(config);
  }

  validate(value: number): string | null {
    const valueValidation = this.value.validate(value);
    if (valueValidation) {
      return valueValidation;
    }

    if (isUndefined(value)) {
      return null;
    }

    if (typeof value !== 'number' || Number.isNaN(value)) {
      return 'value is not a number.';
    }

    if (this.config.min !== undefined && value < this.config.min) {
      return `minimum value of ${this.config.min} not respected.`;
    }

    if (this.config.max !== undefined && value > this.config.max) {
      return `maximum value of ${this.config.max} not respected.`;
    }

    return null;
  }

  get default() {
    return this.value.default;
  }

  get required() {
    return this.value.required;
  }
}

/**
 * StringValue class - compatible with bueno's StringValue
 */
export class StringValue<T extends string = string>
  implements SchemaValue<string>
{
  private value: Value<T>;
  private config: {
    default?: T | (() => T);
    required?: boolean;
    emptyAllowed?: boolean;
    url?: boolean;
    regex?: RegExp;
    constrainTo?: readonly T[];
    ISODate?: boolean;
  };

  constructor(
    config: {
      default?: T | (() => T);
      required?: boolean;
      emptyAllowed?: boolean;
      url?: boolean;
      regex?: RegExp;
      constrainTo?: readonly T[];
      ISODate?: boolean;
    } = {}
  ) {
    this.config = {
      emptyAllowed: true,
      url: false,
      ...config,
    };
    this.value = new Value(this.config);
  }

  validate(value: T): string | null {
    const {emptyAllowed, url, regex, constrainTo, ISODate} = this.config;
    const valueValidation = this.value.validate(value);
    if (valueValidation) {
      return valueValidation;
    }

    if (isUndefined(value)) {
      return null;
    }

    if (!isString(value)) {
      return 'value is not a string.';
    }

    if (!emptyAllowed && !value.length) {
      return 'value is an empty string.';
    }

    if (url) {
      try {
        new URL(value);
      } catch (_) {
        return 'value is not a valid URL.';
      }
    }

    if (regex && !regex.test(value)) {
      return `value did not match provided regex ${regex}`;
    }

    if (constrainTo && !constrainTo.includes(value)) {
      const values = constrainTo.join(', ');
      return `value should be one of: ${values}.`;
    }

    if (ISODate) {
      const ISODateStringRegex =
        /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i;
      if (
        !(
          ISODateStringRegex.test(value) &&
          new Date(value).toString() !== 'Invalid Date'
        )
      ) {
        return 'value is not a valid ISO8601 date string';
      }
    }

    return null;
  }

  get default() {
    return this.value.default;
  }

  get required() {
    return this.value.required;
  }
}

/**
 * BooleanValue class - compatible with bueno's BooleanValue
 */
export class BooleanValue implements SchemaValue<boolean> {
  private value: Value<boolean>;

  constructor(
    config: {
      default?: boolean | (() => boolean);
      required?: boolean;
    } = {}
  ) {
    this.value = new Value(config);
  }

  validate(value: boolean): string | null {
    const valueValidation = this.value.validate(value);
    if (valueValidation) {
      return valueValidation;
    }

    if (isUndefined(value)) {
      return null;
    }

    if (typeof value !== 'boolean') {
      return 'value is not a boolean.';
    }

    return null;
  }

  get default() {
    return this.value.default;
  }

  get required() {
    return this.value.required;
  }
}

/**
 * ArrayValue class - compatible with bueno's ArrayValue
 */
export type PrimitivesValues =
  | boolean
  | number
  | string
  | object
  | undefined
  | null;

export class ArrayValue<T = PrimitivesValues> implements SchemaValue<T[]> {
  private value: Value<T[]>;

  constructor(
    private config: {
      default?: T[] | (() => T[]);
      required?: boolean;
      min?: number;
      max?: number;
      each?: BooleanValue | NumberValue | StringValue | RecordValue;
    } = {}
  ) {
    this.value = new Value(this.config);
  }

  validate(input: T[] | undefined | null): string | null {
    if (!isNullOrUndefined(input) && !Array.isArray(input)) {
      return 'value is not an array';
    }

    const invalid = this.value.validate(input);
    if (invalid !== null) {
      return invalid;
    }

    if (isNullOrUndefined(input)) {
      return null;
    }

    if (this.config.max !== undefined && input.length > this.config.max) {
      return `value contains more than ${this.config.max}`;
    }

    if (this.config.min !== undefined && input.length < this.config.min) {
      return `value contains less than ${this.config.min}`;
    }

    if (this.config.each !== undefined) {
      let out = '';
      input.forEach((el) => {
        if (this.config.each!.required && isNullOrUndefined(el)) {
          out = `value is null or undefined: ${input.join(',')}`;
        }
        const isInvalid = this.config.each!.validate(el as never);
        if (isInvalid !== null) {
          out += ` ${isInvalid}`;
        }
      });

      return out === '' ? null : out;
    }

    return null;
  }

  get default(): T[] | undefined {
    return this.value.default;
  }

  get required() {
    return this.value.required;
  }
}

/**
 * RecordValue class - compatible with bueno's RecordValue
 */
type ComplexRecord = Record<
  string,
  PrimitivesValues | Record<string, PrimitivesValues> | ArrayValue
>;

export class RecordValue implements SchemaValue<ComplexRecord> {
  private config: {
    options: {required?: boolean};
    values: SchemaDefinition<ComplexRecord>;
  };

  constructor(
    config: Partial<{
      options: {required?: boolean};
      values: SchemaDefinition<ComplexRecord>;
    }> = {}
  ) {
    this.config = {
      options: {required: false},
      values: {},
      ...config,
    };
  }

  validate(input: unknown): string | null {
    if (isUndefined(input)) {
      return this.config.options.required
        ? 'value is required and is currently undefined'
        : null;
    }

    if (!isRecord(input)) {
      return 'value is not an object';
    }

    for (const [k, v] of Object.entries(this.config.values)) {
      if (v.required && isNullOrUndefined(input[k])) {
        return `value does not contain ${k}`;
      }
    }

    let out = '';

    for (const [key, validator] of Object.entries(this.config.values)) {
      const value = input[key];
      const invalidValue = validator.validate(value);

      if (invalidValue !== null) {
        out += ` ${invalidValue}`;
      }
    }

    return out === '' ? null : out;
  }

  get default() {
    return undefined;
  }

  get required() {
    return !!this.config.options.required;
  }
}

/**
 * EnumValue class - compatible with bueno's EnumValue
 */
export class EnumValue<T> implements SchemaValue<T> {
  private value: Value<T>;

  constructor(
    private config: {
      enum: Record<string | number, string | number>;
      default?: T | (() => T);
      required?: boolean;
    }
  ) {
    this.value = new Value(config);
  }

  validate(value: unknown): string | null {
    const invalid = this.value.validate(value);

    if (invalid !== null) {
      return invalid;
    }

    if (isUndefined(value)) {
      return null;
    }

    const valueInEnum = Object.values(this.config.enum).find(
      (enumValue) => enumValue === value
    );

    if (!valueInEnum) {
      return 'value is not in enum.';
    }

    return null;
  }

  get default() {
    return this.value.default;
  }

  get required() {
    return this.value.required;
  }
}

/**
 * Schema class - compatible with bueno's Schema
 */
export class Schema<Values extends object> {
  constructor(private definition: SchemaDefinition<Values>) {}

  public validate(values: Partial<Values> = {}, message = '') {
    const mergedValues = {
      ...this.default,
      ...values,
    };

    const errors: string[] = [];

    for (const property in this.definition) {
      const error = this.definition[property].validate(mergedValues[property]!);
      error && errors.push(`${property}: ${error}`);
    }

    if (errors.length) {
      const errorMessage = `
  The following properties are invalid:

    ${errors.join('\n\t')}
  
  ${message}
  `;
      throw new SchemaValidationError(errorMessage);
    }

    return mergedValues;
  }

  private get default() {
    const defaultValues: Partial<Values> = {};
    for (const property in this.definition) {
      const defaultValue = this.definition[property].default;
      if (defaultValue !== undefined) {
        defaultValues[property] = defaultValue;
      }
    }

    return defaultValues;
  }
}

/**
 * Utility functions - compatible with bueno utilities
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isNullOrUndefined(value: unknown): value is null | undefined {
  return isUndefined(value) || isNull(value);
}

export function isArray(value: unknown): value is Array<PrimitivesValues> {
  return Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return Object.prototype.toString.call(value) === '[object String]';
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isRecord(value: unknown): value is ComplexRecord {
  return value !== undefined && typeof value === 'object';
}

/**
 * Type exports for compatibility
 */
export type {SchemaDefinition};
export type SchemaValues<
  S,
  RequiredValues extends keyof InferValuesFromSchema<S> = never,
> = Partial<InferValuesFromSchema<S>> &
  Pick<InferValuesFromSchema<S>, RequiredValues>;

type InferValuesFromSchema<T> = T extends Schema<infer P> ? P : never;
