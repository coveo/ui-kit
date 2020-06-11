import {ValueConfig, Value} from './value';
import {SchemaValue} from '../schema';

type BooleanValueConfig = ValueConfig<boolean>;

export class BooleanValue implements SchemaValue<boolean> {
  private value: Value<boolean>;
  constructor(config: BooleanValueConfig = {}) {
    this.value = new Value(config);
  }

  public validate(value: boolean) {
    this.value.validate(value);
  }

  public get default() {
    return this.value.default;
  }
}
