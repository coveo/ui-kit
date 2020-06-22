import {SchemaValue} from '../schema';
import {StringValue, isString} from './string-value';
import {BooleanValue, isBoolean} from './boolean-value';
import {NumberValue, isNumber} from './number-value';
import {isNullOrUndefined} from './value';

type PrimitivesValues = boolean | number | string | undefined | null;
type RecordWithPrimitiveValues = Record<string, PrimitivesValues>;
type ComplexRecord = Record<
  string,
  PrimitivesValues | RecordWithPrimitiveValues
>;

type RecordValueConfig = Record<
  string,
  BooleanValue | StringValue | NumberValue | RecordValue
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
