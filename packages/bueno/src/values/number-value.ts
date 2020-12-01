import {ValueConfig, Value, isUndefined} from './value';
import {SchemaValue} from '../schema';

interface NumberValueConfig extends ValueConfig<number> {
  min?: number;
  max?: number;
}

export class NumberValue implements SchemaValue<number> {
  private value: Value<number>;
  constructor(private config: NumberValueConfig = {}) {
    this.value = new Value(config);
  }

  public validate(value: number) {
    const valueValidation = this.value.validate(value);
    if (valueValidation) {
      return valueValidation;
    }

    if (!isNumberOrUndefined(value)) {
      return 'value is not a number.';
    }

    if (value < this.config.min!) {
      return `minimum value of ${this.config.min} not respected.`;
    }

    if (value > this.config.max!) {
      return `maximum value of ${this.config.max} not respected.`;
    }

    return null;
  }

  public get default() {
    return this.value.default;
  }

  public get required() {
    return this.value.required;
  }
}

export function isNumberOrUndefined(
  value: unknown
): value is number | undefined {
  return isUndefined(value) || isNumber(value);
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}
