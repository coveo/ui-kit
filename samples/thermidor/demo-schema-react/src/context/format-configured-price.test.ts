import {describe, it, expect, vi} from 'vitest';
import {formatConfiguredPrice, formatFieldNumber} from './format-configured-price.js';

vi.mock('../env.js', () => ({
  getSampleConfiguration: () => ({language: 'fr', country: 'FR', currency: 'EUR'}),
}));

const normalize = (value: string) => value.replace(/\s/g, ' ');

describe('formatConfiguredPrice', () => {
  it('formats in the configured language and currency', () => {
    expect(normalize(formatConfiguredPrice(12.34))).toBe('12,34 €');
  });

  it('drops whole-number decimals when compact', () => {
    expect(normalize(formatConfiguredPrice(100, {compact: true}))).toBe('100 €');
    expect(normalize(formatConfiguredPrice(12.5, {compact: true}))).toBe('12,5 €');
  });
});

describe('formatFieldNumber', () => {
  it('formats price fields as prices', () => {
    expect(normalize(formatFieldNumber('ec_price', 50))).toBe('50 €');
    expect(normalize(formatFieldNumber('ec_promo_price', 50))).toBe('50 €');
  });

  it('formats other fields as plain numbers', () => {
    expect(formatFieldNumber('ec_rating', 4)).toBe('4');
  });
});
