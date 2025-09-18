import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {closest} from '../../../utils/dom-utils';
import {
  dispatchSearchBoxSuggestionsEvent,
  elementHasNoQuery,
  elementHasQuery,
  type SearchBoxSuggestionElement,
  type SearchBoxSuggestionsEvent,
} from './suggestions-common';

vi.mock('../../../utils/event-utils', {spy: true});
vi.mock('../../../utils/dom-utils', {spy: true});

describe('suggestions-common', () => {
  describe('#elementHasNoQuery', () => {
    it('should return true when element has undefined query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: undefined,
      };

      expect(elementHasNoQuery(element)).toBe(true);
    });

    it('should return true when element has no query property', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
      };

      expect(elementHasNoQuery(element)).toBe(true);
    });

    it('should return true when element has empty string query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: '',
      };

      expect(elementHasNoQuery(element)).toBe(true);
    });

    it('should return false when element has non-empty query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: 'search query',
      };

      expect(elementHasNoQuery(element)).toBe(false);
    });

    it('should return true when element has whitespace-only query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: '   ',
      };

      expect(elementHasNoQuery(element)).toBe(true);
    });

    it('should return true when element has tab and newline characters', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: '\t\n  \r',
      };

      expect(elementHasNoQuery(element)).toBe(true);
    });
  });

  describe('#elementHasQuery', () => {
    it('should return false when element has undefined query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: undefined,
      };

      expect(elementHasQuery(element)).toBe(false);
    });

    it('should return false when element has no query property', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
      };

      expect(elementHasQuery(element)).toBe(false);
    });

    it('should return false when element has empty string query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: '',
      };

      expect(elementHasQuery(element)).toBe(false);
    });

    it('should return true when element has non-empty query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: 'search query',
      };

      expect(elementHasQuery(element)).toBe(true);
    });

    it('should return false when element has whitespace-only query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: '   ',
      };

      expect(elementHasQuery(element)).toBe(false);
    });

    it('should return false when element has tab and newline characters', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: '\t\n  \r',
      };

      expect(elementHasQuery(element)).toBe(false);
    });

    it('should return true when element has query with leading/trailing whitespace', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: '  search query  ',
      };

      expect(elementHasQuery(element)).toBe(true);
    });
  });

  describe('#dispatchSearchBoxSuggestionsEvent', () => {
    let mockElement: HTMLElement;
    let mockEvent: SearchBoxSuggestionsEvent<unknown>;

    beforeEach(() => {
      document.body.innerHTML = '';
      mockElement = document.createElement('div');
      mockEvent = vi.fn();
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should call closest with correct selector', () => {
      vi.mocked(closest).mockReturnValue(
        document.createElement('atomic-search-box')
      );

      dispatchSearchBoxSuggestionsEvent(mockEvent, mockElement);

      expect(closest).toHaveBeenCalledWith(
        mockElement,
        'atomic-search-box, atomic-insight-search-box, atomic-commerce-search-box'
      );
    });

    it('should work with any valid search box type', () => {
      const searchBoxTypes = [
        'atomic-search-box',
        'atomic-insight-search-box',
        'atomic-commerce-search-box',
      ];

      searchBoxTypes.forEach((type) => {
        const mockParent = document.createElement(type);
        vi.mocked(closest).mockReturnValue(mockParent);

        expect(() => {
          dispatchSearchBoxSuggestionsEvent(mockEvent, mockElement);
        }).not.toThrow();
      });
    });

    it('should throw error when element is not child of allowed search box elements', () => {
      vi.mocked(closest).mockReturnValue(null);

      expect(() => {
        dispatchSearchBoxSuggestionsEvent(mockEvent, mockElement);
      }).toThrow(
        'The "div" component was not handled, as it is not a child of the following elements: atomic-search-box, atomic-insight-search-box, atomic-commerce-search-box'
      );
    });

    it('should normalize nodeName to lowercase in error message', () => {
      const upperCaseElement = document.createElement('div');
      Object.defineProperty(upperCaseElement, 'nodeName', {
        value: 'CUSTOM-ELEMENT',
        writable: false,
        configurable: true,
      });
      vi.mocked(closest).mockReturnValue(null);

      expect(() => {
        dispatchSearchBoxSuggestionsEvent(mockEvent, upperCaseElement);
      }).toThrow(
        'The "custom-element" component was not handled, as it is not a child of the following elements: atomic-search-box, atomic-insight-search-box, atomic-commerce-search-box'
      );
    });
  });
});
