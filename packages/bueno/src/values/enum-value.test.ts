import {beforeEach, describe, expect, it} from 'vitest';
import {EnumValue, type EnumValueConfig} from './enum-value.js';

describe('Enum value', () => {
  enum Letter {
    A = 'a',
  }

  let config: EnumValueConfig<Letter>;

  function buildEnumValidator() {
    return new EnumValue<Letter>(config);
  }

  beforeEach(() => {
    config = {
      enum: Letter,
    };
  });

  it('when the value is in the enum, #validate returns null', () => {
    const validator = buildEnumValidator();
    expect(validator.validate(Letter.A)).toBe(null);
  });

  it('when the value is undefined and #required is false, #validate returns null', () => {
    config.required = false;
    const validator = buildEnumValidator();
    expect(validator.validate(undefined)).toBe(null);
  });

  it('when the value is undefined and #required is true, #validate returns a string', () => {
    config.required = true;
    const validator = buildEnumValidator();
    expect(validator.validate(undefined)).toBe('value is required.');
  });

  it('when the value is not in the enum, #validate returns a string', () => {
    const validator = buildEnumValidator();
    expect(validator.validate('b')).toBe('value is not in enum.');
  });
});
