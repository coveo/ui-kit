import {PrimitivesValues, ValueConfig, isNullOrUndefined, Value} from './value';
import {SchemaValue} from '../schema';
import {BooleanValue, isBoolean} from './boolean-value';
import {NumberValue, isNumber} from './number-value';
import {StringValue, isString} from './string-value';

interface ArrayValueConfig extends ValueConfig<PrimitivesValues[]> {
  min?: number;
  max?: number;
  each?: BooleanValue | NumberValue | StringValue;
}

export class ArrayValue implements SchemaValue<PrimitivesValues[]> {
  private value: Value<PrimitivesValues[]>;
  constructor(private config: ArrayValueConfig = {}) {
    this.value = new Value(this.config);
  }

  validate(input: PrimitivesValues[] | undefined | null) {
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
    v: PrimitivesValues,
    validator: BooleanValue | StringValue | NumberValue
  ) {
    if (isBoolean(v)) {
      return (validator as BooleanValue).validate(v);
    } else if (isString(v)) {
      return (validator as StringValue).validate(v);
    } else if (isNumber(v)) {
      return (validator as NumberValue).validate(v);
    }

    return 'value is not a primitive value';
  }

  public get default() {
    return undefined;
  }
}
