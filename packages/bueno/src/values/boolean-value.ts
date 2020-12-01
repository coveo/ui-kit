import {ValueConfig, Value, isUndefined} from './value';
import {SchemaValue} from '../schema';

type BooleanValueConfig = ValueConfig<boolean>;

export class BooleanValue implements SchemaValue<boolean> {
  private value: Value<boolean>;
  constructor(config: BooleanValueConfig = {}) {
    this.value = new Value(config);
  }

  public validate(value: boolean) {
    const valueValidation = this.value.validate(value);
    if (valueValidation) {
      return valueValidation;
    }

    if (!isBooleanOrUndefined(value)) {
      return 'value is not a boolean.';
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

export function isBooleanOrUndefined(
  value: unknown
): value is undefined | boolean {
  return isUndefined(value) || isBoolean(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}
