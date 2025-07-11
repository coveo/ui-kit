import type {SchemaDefinition, SchemaValue} from '../schema.js';
import {type BooleanValue, isBoolean} from './boolean-value.js';
import {isNumber, type NumberValue} from './number-value.js';
import {isString, type StringValue} from './string-value.js';
import {
  isNullOrUndefined,
  isUndefined,
  type PrimitivesValues,
  Value,
  type ValueConfig,
} from './value.js';

type RecordWithPrimitiveValues = Record<string, PrimitivesValues>;
type ComplexRecord = Record<
  string,
  PrimitivesValues | RecordWithPrimitiveValues | ArrayValue
>;

type RecordValueConfig = {
  options: ValueConfig<ComplexRecord>;
  values: SchemaDefinition<ComplexRecord>;
};

export class RecordValue implements SchemaValue<ComplexRecord> {
  private config: RecordValueConfig;
  constructor(config: Partial<RecordValueConfig> = {}) {
    this.config = {
      options: {required: false},
      values: {},
      ...config,
    };
  }

  public validate(input: unknown): string | null {
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

  public get default() {
    return undefined;
  }

  public get required() {
    return !!this.config.options.required;
  }
}

export function isRecord(value: unknown): value is ComplexRecord {
  return value !== undefined && typeof value === 'object';
}

interface ArrayValueConfig<T extends PrimitivesValues = PrimitivesValues>
  extends ValueConfig<T[]> {
  min?: number;
  max?: number;
  each?: BooleanValue | NumberValue | StringValue | RecordValue;
}

export class ArrayValue<T extends PrimitivesValues = PrimitivesValues>
  implements SchemaValue<T[]>
{
  private value: Value<T[]>;
  constructor(private config: ArrayValueConfig<T> = {}) {
    this.value = new Value(this.config);
  }

  validate(input: T[] | undefined | null) {
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
        const isInvalid = this.validatePrimitiveValue(el, this.config.each!);
        if (isInvalid !== null) {
          out += ` ${isInvalid}`;
        }
      });

      return out === '' ? null : out;
    }

    return null;
  }

  private validatePrimitiveValue(
    v: T,
    validator: BooleanValue | StringValue | NumberValue | RecordValue
  ) {
    if (isBoolean(v)) {
      return (validator as BooleanValue).validate(v);
    } else if (isString(v)) {
      return (validator as StringValue).validate(v);
    } else if (isNumber(v)) {
      return (validator as NumberValue).validate(v);
    } else if (isRecord(v)) {
      return (validator as RecordValue).validate(v);
    }

    return 'value is not a primitive value';
  }

  public get default() {
    return undefined;
  }

  public get required() {
    return this.value.required;
  }
}

export function isArray(value: unknown): value is Array<PrimitivesValues> {
  return Array.isArray(value);
}
