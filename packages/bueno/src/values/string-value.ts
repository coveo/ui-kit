import {ValueConfig, Value} from './value';
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

    if (
      value !== undefined &&
      Object.prototype.toString.call(value) !== '[object String]'
    ) {
      return 'value is not a string.';
    }

    return null;
  }

  public get default() {
    return this.value.default;
  }
}
