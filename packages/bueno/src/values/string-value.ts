import {ValueConfig, Value} from './value';
import {SchemaValue} from '../schema';

type StringValueConfig = ValueConfig<string>;

export class StringValue implements SchemaValue<string> {
  private value: Value<string>;
  constructor(config: StringValueConfig = {}) {
    this.value = new Value(config);
  }

  public validate(value: string) {
    this.value.validate(value);
  }

  public get default() {
    return this.value.default;
  }
}
