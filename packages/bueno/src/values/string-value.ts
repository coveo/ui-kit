import type {SchemaValue} from '../schema.js';
import {isUndefined, Value, type ValueConfig} from './value.js';

interface StringValueConfig<T extends string> extends ValueConfig<T> {
  emptyAllowed?: boolean;
  url?: boolean;
  regex?: RegExp;
  constrainTo?: readonly T[];
  ISODate?: boolean;
}

// Source: https://github.com/jquery-validation/jquery-validation/blob/c1db10a34c0847c28a5bd30e3ee1117e137ca834/src/core.js#L1349
const ISODateStringRegex =
  /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i;

export class StringValue<T extends string = string>
  implements SchemaValue<string>
{
  private value: Value<T>;
  private config: StringValueConfig<T>;
  constructor(config: StringValueConfig<T> = {}) {
    this.config = {
      emptyAllowed: true,
      url: false,
      ...config,
    };
    this.value = new Value(this.config);
  }

  public validate(value: T) {
    const {emptyAllowed, url, regex, constrainTo, ISODate} = this.config;
    const valueValidation = this.value.validate(value);
    if (valueValidation) {
      return valueValidation;
    }

    if (isUndefined(value)) {
      return null;
    }

    if (!isString(value)) {
      return 'value is not a string.';
    }

    if (!emptyAllowed && !value.length) {
      return 'value is an empty string.';
    }

    if (url) {
      try {
        new URL(value);
      } catch (_) {
        return 'value is not a valid URL.';
      }
    }

    if (regex && !regex.test(value)) {
      return `value did not match provided regex ${regex}`;
    }

    if (constrainTo && !constrainTo.includes(value)) {
      const values = constrainTo.join(', ');
      return `value should be one of: ${values}.`;
    }

    if (
      ISODate &&
      !(
        ISODateStringRegex.test(value) &&
        new Date(value).toString() !== 'Invalid Date'
      )
    ) {
      return 'value is not a valid ISO8601 date string';
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

export function isString(value: unknown): value is string {
  return Object.prototype.toString.call(value) === '[object String]';
}
