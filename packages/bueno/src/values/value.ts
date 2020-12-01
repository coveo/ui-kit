import {SchemaValue} from '../schema';

export type PrimitivesValues =
  | boolean
  | number
  | string
  | object
  | undefined
  | null;

export interface ValueConfig<T> {
  default?: (() => T) | T;
  required?: boolean;
}

export class Value<T> implements SchemaValue<T> {
  constructor(private baseConfig: ValueConfig<T> = {}) {}

  public validate(value: unknown) {
    if (this.baseConfig.required && isNullOrUndefined(value)) {
      return 'value is required.';
    }

    return null;
  }

  public get default() {
    return this.baseConfig.default instanceof Function
      ? this.baseConfig.default()
      : this.baseConfig.default;
  }

  public get required() {
    return this.baseConfig.required === true;
  }
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isNullOrUndefined(value: unknown): value is null | undefined {
  return isUndefined(value) || isNull(value);
}
