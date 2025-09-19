import {describe, expect, it} from 'vitest';
import {
  dispatchSearchBoxSuggestionsEvent,
  elementHasNoQuery,
  elementHasQuery,
  type SearchBoxSuggestionElement,
  type SearchBoxSuggestions,
  type SearchBoxSuggestionsEvent,
} from './suggestions-common';

describe('utils', () => {
  describe('re-exports', () => {
    it('should export utility functions', () => {
      expect(typeof elementHasNoQuery).toBe('function');
      expect(typeof elementHasQuery).toBe('function');
    });

    it('should export event dispatching function', () => {
      expect(typeof dispatchSearchBoxSuggestionsEvent).toBe('function');
    });

    it('should export types', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test',
        content: document.createElement('div'),
      };

      const suggestions: SearchBoxSuggestions = {
        position: 1,
        renderItems: () => [element],
      };

      const event: SearchBoxSuggestionsEvent<unknown> = () => suggestions;

      expect(element).toBeDefined();
      expect(suggestions).toBeDefined();
      expect(event).toBeDefined();
    });
  });
});
