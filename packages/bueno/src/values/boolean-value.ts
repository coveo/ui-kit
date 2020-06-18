import {ValueConfig, Value} from './value';
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

    if (value !== undefined && typeof value !== 'boolean') {
      return 'value is not a boolean.';
    }

    return null;
  }

  public get default() {
    return this.value.default;
  }
}
