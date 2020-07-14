import {SchemaValue} from '../schema';
import {Value, ValueConfig, isUndefined} from './value';

export interface EnumValueConfig<T> extends ValueConfig<T> {
  enum: Record<string | number, string | number>;
}

export class EnumValue<T> implements SchemaValue<T> {
  private value: Value<T>;

  constructor(private config: EnumValueConfig<T>) {
    this.value = new Value(config);
  }

  public validate(value: unknown) {
    const invalid = this.value.validate(value);

    if (invalid !== null) {
      return invalid;
    }

    if (isUndefined(value)) {
      return null;
    }

    const valueInEnum = Object.values(this.config.enum).find(
      (enumValue) => enumValue === value
    );

    if (!valueInEnum) {
      return 'value is not in enum.';
    }

    return null;
  }

  public get default() {
    return this.value.default;
  }
}
