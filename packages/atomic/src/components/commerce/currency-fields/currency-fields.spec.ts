import {describe, expect, it} from 'vitest';
import {isCurrencyField} from './currency-fields';

describe('isCurrencyField', () => {
  it('should return true for ec_price with no custom fields', () => {
    expect(isCurrencyField('ec_price')).toBe(true);
  });

  it('should return true for ec_promo_price with an empty list', () => {
    expect(isCurrencyField('ec_promo_price', [])).toBe(true);
  });

  it('should return true for a listed custom field', () => {
    expect(isCurrencyField('my_price', ['my_price'])).toBe(true);
  });

  it('should return true for ec_price even when the list does not include it', () => {
    expect(isCurrencyField('ec_price', ['my_price'])).toBe(true);
  });

  it('should return false for an unlisted field', () => {
    expect(isCurrencyField('ec_rating', ['my_price'])).toBe(false);
  });
});
