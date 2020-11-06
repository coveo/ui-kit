import {SchemaValue} from '../schema';
import {PrimitivesValues, ValueConfig, isNullOrUndefined, Value} from './value';
import {StringValue, isString} from './string-value';
import {BooleanValue, isBoolean} from './boolean-value';
import {NumberValue, isNumber} from './number-value';

type RecordWithPrimitiveValues = Record<string, PrimitivesValues>;
type ComplexRecord = Record<
  string,
  PrimitivesValues | RecordWithPrimitiveValues | ArrayValue
>;

type RecordValueConfig = Record<
  string,
  BooleanValue | StringValue | NumberValue | RecordValue | ArrayValue
>;

export class RecordValue implements SchemaValue<ComplexRecord> {
  constructor(private values: RecordValueConfig = {}) {}

  public validate(input: unknown): string | null {
    if (!isRecord(input)) {
      return 'value is not an object';
    }

    if (Object.keys(input).length > Object.keys(this.values).length) {
      return 'value contains unknown keys';
    }

    for (const [k, v] of Object.entries(this.values)) {
      if (v.required && isNullOrUndefined(input[k])) {
        return `value does not contain ${k}`;
      }
    }

    let out = '';

    for (const [k, v] of Object.entries(input)) {
      const invalidKey = new StringValue({required: true}).validate(k);
      if (invalidKey !== null) {
        return invalidKey;
      }

      let invalidValue = null;

      if (isBoolean(v)) {
        invalidValue = (this.values[k] as BooleanValue).validate(v);
      } else if (isString(v)) {
        invalidValue = (this.values[k] as StringValue).validate(v);
      } else if (isNumber(v)) {
        invalidValue = (this.values[k] as NumberValue).validate(v);
      } else if (isArray(v)) {
        invalidValue = (this.values[k] as ArrayValue).validate(v);
      }

      if (invalidValue !== null) {
        out += ' ' + invalidValue;
      }
    }

    return out === '' ? null : out;
  }

  public get default() {
    return undefined;
  }

  public required() {
    return false;
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
  implements SchemaValue<T[]> {
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
          out += ' ' + isInvalid;
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
    return this.value.required();
  }
}

export function isArray(value: unknown): value is Array<PrimitivesValues> {
  return Array.isArray(value);
}
