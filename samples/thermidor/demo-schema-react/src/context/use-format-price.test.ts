import {describe, it, expect, vi} from 'vitest';
import {useFormatPrice} from './use-format-price.js';

vi.mock('../env.js', () => ({
  getSampleConfiguration: () => ({language: 'fr', country: 'FR', currency: 'EUR'}),
}));

const normalize = (value: string) => value.replace(/\s/g, ' ');

describe('useFormatPrice', () => {
  it('formats in the configured currency by default', () => {
    expect(normalize(useFormatPrice()(12.34))).toBe('12,34 €');
  });

  it("formats in the given currency with the session's locale", () => {
    expect(normalize(useFormatPrice('USD')(12.34))).toBe('12,34 $US');
  });
});
