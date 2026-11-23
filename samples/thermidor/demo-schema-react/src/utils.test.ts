import {describe, it, expect} from 'vitest';
import {formatPrice} from './utils.js';

const normalize = (value: string) => value.replace(/\s/g, ' ');

describe('formatPrice', () => {
  it('formats USD as before', () => {
    expect(formatPrice(12.34, {locale: 'en-US', currency: 'USD'})).toBe('$12.34');
    expect(formatPrice(12.3, {locale: 'en', currency: 'USD'})).toBe('$12.30');
  });

  it('formats EUR in French', () => {
    expect(normalize(formatPrice(12.34, {locale: 'fr-FR', currency: 'EUR'}))).toBe('12,34 €');
  });

  it('formats CAD per locale', () => {
    expect(formatPrice(12.34, {locale: 'en-CA', currency: 'CAD'})).toBe('$12.34');
    expect(normalize(formatPrice(12.34, {locale: 'fr-CA', currency: 'CAD'}))).toBe('12,34 $');
  });
});
