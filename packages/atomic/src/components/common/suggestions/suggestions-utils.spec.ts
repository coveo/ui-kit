import {describe, expect, it} from 'vitest';
import type {SearchBoxSuggestionElement} from './suggestions-types';
import {elementHasNoQuery, elementHasQuery} from './suggestions-utils';

describe('suggestions-utils', () => {
  const createTestElement = (query?: string): SearchBoxSuggestionElement => ({
    key: 'test-key',
    content: document.createElement('div'),
    ...(query !== undefined && {query}),
  });

  describe('#elementHasNoQuery', () => {
    it('should return true when element has undefined query', () => {
      const element = createTestElement(undefined);
      expect(elementHasNoQuery(element)).toBe(true);
    });

    it('should return true when element has no query property', () => {
      const element = createTestElement();
      expect(elementHasNoQuery(element)).toBe(true);
    });

    it('should return true when element has empty string query', () => {
      const element = createTestElement('');
      expect(elementHasNoQuery(element)).toBe(true);
    });

    it('should return false when element has non-empty query', () => {
      const element = createTestElement('search query');
      expect(elementHasNoQuery(element)).toBe(false);
    });

    it('should return true when element has whitespace-only query', () => {
      const element = createTestElement('   ');
      expect(elementHasNoQuery(element)).toBe(true);
    });

    it('should return true when element has tab and newline characters', () => {
      const element = createTestElement('\t\n  \r');
      expect(elementHasNoQuery(element)).toBe(true);
    });
  });

  describe('#elementHasQuery', () => {
    it('should return false when element has undefined query', () => {
      const element = createTestElement(undefined);
      expect(elementHasQuery(element)).toBe(false);
    });

    it('should return false when element has no query property', () => {
      const element = createTestElement();
      expect(elementHasQuery(element)).toBe(false);
    });

    it('should return false when element has empty string query', () => {
      const element = createTestElement('');
      expect(elementHasQuery(element)).toBe(false);
    });

    it('should return true when element has non-empty query', () => {
      const element = createTestElement('search query');
      expect(elementHasQuery(element)).toBe(true);
    });

    it('should return false when element has whitespace-only query', () => {
      const element = createTestElement('   ');
      expect(elementHasQuery(element)).toBe(false);
    });

    it('should return false when element has tab and newline characters', () => {
      const element = createTestElement('\t\n  \r');
      expect(elementHasQuery(element)).toBe(false);
    });

    it('should return true when element has query with leading/trailing whitespace', () => {
      const element = createTestElement('  search query  ');
      expect(elementHasQuery(element)).toBe(true);
    });

    it('should handle numeric zero as valid query', () => {
      const element = createTestElement('0');
      expect(elementHasQuery(element)).toBe(true);
    });

    it('should handle boolean values as strings', () => {
      const element = createTestElement('false');
      expect(elementHasQuery(element)).toBe(true);
    });
  });
});
