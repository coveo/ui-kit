import {ValueConfig, Value} from './value';
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
    this.value.validate(value);

    if (this.config.min !== undefined && value < this.config.min) {
      throw new Error(`minimum value of ${this.config.min} not respected.`);
    }

    if (this.config.max !== undefined && value > this.config.max) {
      throw new Error(`maximum value of ${this.config.max} not respected.`);
    }
  }

  public get default() {
    return this.value.default;
  }
}
