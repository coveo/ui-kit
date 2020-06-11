import {SchemaValue} from '../schema';

export interface ValueConfig<T> {
  default?: (() => T) | T;
  required?: boolean;
}

export class Value<T> implements SchemaValue<T> {
  constructor(private baseConfig: ValueConfig<T> = {}) {}

  public validate(value: T) {
    if (this.baseConfig.required && value === undefined) {
      throw new Error('value is required.');
    }
  }

  public get default() {
    return this.baseConfig.default instanceof Function
      ? this.baseConfig.default()
      : this.baseConfig.default;
  }
}
