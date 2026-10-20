import {describe, expect, it} from 'vitest';
import {withCountry} from './locale-utils';

describe('locale-utils', () => {
  describe('#withCountry', () => {
    it('should combine the language and the country into a canonical locale', () => {
      expect(withCountry('fr', 'CA')).toBe('fr-CA');
      expect(withCountry('EN', 'ca')).toBe('en-CA');
    });

    it('should return the language when the country is missing', () => {
      expect(withCountry('fr')).toBe('fr');
      expect(withCountry('fr', '')).toBe('fr');
    });

    it('should return the language when it already has a region', () => {
      expect(withCountry('fr-FR', 'CA')).toBe('fr-FR');
    });

    it('should add the country to a language with a script', () => {
      expect(withCountry('zh-Hant', 'TW')).toBe('zh-Hant-TW');
    });

    it('should return the language when the combination is not a valid locale', () => {
      expect(withCountry('fr', 'not a country')).toBe('fr');
    });
  });
});
