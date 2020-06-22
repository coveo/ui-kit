import {ValueConfig, Value, isUndefined} from './value';
import {SchemaValue} from '../schema';

type StringValueConfig = ValueConfig<string>;

export class StringValue implements SchemaValue<string> {
  private value: Value<string>;
  constructor(config: StringValueConfig = {}) {
    this.value = new Value(config);
  }

  public validate(value: string) {
    const valueValidation = this.value.validate(value);
    if (valueValidation) {
      return valueValidation;
    }

    if (!isStringOrUndefined(value)) {
      return 'value is not a string.';
    }

    return null;
  }

  public get default() {
    return this.value.default;
  }

  public get required() {
    return this.value.required();
  }
}

export function isStringOrUndefined(
  value: unknown
): value is undefined | string {
  return isUndefined(value) || isString(value);
}

export function isString(value: unknown): value is string {
  return Object.prototype.toString.call(value) === '[object String]';
}
