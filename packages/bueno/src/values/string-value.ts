import {ValueConfig, Value, isUndefined} from './value';
import {SchemaValue} from '../schema';

interface StringValueConfig extends ValueConfig<string> {
  emptyAllowed?: boolean;
  url?: boolean;
}

const defaultConfig: StringValueConfig = {
  emptyAllowed: true,
  url: false,
};

// Source: https://github.com/jquery-validation/jquery-validation/blob/c1db10a34c0847c28a5bd30e3ee1117e137ca834/src/core.js#L1349
const urlRegex = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

export class StringValue implements SchemaValue<string> {
  private value: Value<string>;
  private config: StringValueConfig;
  constructor(config: StringValueConfig = {}) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
    this.value = new Value(this.config);
  }

  public validate(value: string) {
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

    if (!this.config.emptyAllowed && !value.length) {
      return 'value is an empty string.';
    }

    if (this.config.url && !urlRegex.test(value)) {
      return 'value is not a valid URL.';
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

export function isString(value: unknown): value is string {
  return Object.prototype.toString.call(value) === '[object String]';
}
