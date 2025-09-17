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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#elementHasNoQuery', () => {
    it('should return true when element has undefined query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: undefined,
      };

      const result = elementHasNoQuery(element);

      expect(result).toBe(true);
    });

    it('should return true when element has no query property', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
      };

      const result = elementHasNoQuery(element);

      expect(result).toBe(true);
    });

    it('should return true when element has empty string query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: '',
      };

      const result = elementHasNoQuery(element);

      expect(result).toBe(true);
    });

    it('should return false when element has non-empty query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: 'search query',
      };

      const result = elementHasNoQuery(element);

      expect(result).toBe(false);
    });

    it('should return false when element has whitespace-only query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: '   ',
      };

      const result = elementHasNoQuery(element);

      expect(result).toBe(false);
    });
  });

  describe('#elementHasQuery', () => {
    it('should return false when element has undefined query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: undefined,
      };

      const result = elementHasQuery(element);

      expect(result).toBe(false);
    });

    it('should return false when element has no query property', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
      };

      const result = elementHasQuery(element);

      expect(result).toBe(false);
    });

    it('should return false when element has empty string query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: '',
      };

      const result = elementHasQuery(element);

      expect(result).toBe(false);
    });

    it('should return true when element has non-empty query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: 'search query',
      };

      const result = elementHasQuery(element);

      expect(result).toBe(true);
    });

    it('should return true when element has whitespace-only query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: '   ',
      };

      const result = elementHasQuery(element);

      expect(result).toBe(true);
    });

    it('should return true when element has numeric zero as query', () => {
      const element: SearchBoxSuggestionElement = {
        key: 'test-key',
        content: document.createElement('div'),
        query: '0',
      };

      const result = elementHasQuery(element);

      expect(result).toBe(true);
    });
  });

  describe('#dispatchSearchBoxSuggestionsEvent', () => {
    let mockElement: HTMLElement;
    let mockEvent: SearchBoxSuggestionsEvent<unknown>;
    let mockSearchBoxElement: HTMLElement;

    beforeEach(() => {
      mockElement = document.createElement('div');
      Object.defineProperty(mockElement, 'nodeName', {
        value: 'DIV',
        writable: false,
        configurable: true,
      });

      mockEvent = vi.fn();

      mockSearchBoxElement = document.createElement('atomic-search-box');
      Object.defineProperty(mockSearchBoxElement, 'nodeName', {
        value: 'ATOMIC-SEARCH-BOX',
        writable: false,
        configurable: true,
      });

      // Setup DOM hierarchy
      document.body.appendChild(mockSearchBoxElement);
      mockSearchBoxElement.appendChild(mockElement);

      // Mock closest to return search box element
      vi.mocked(closest).mockReturnValue(mockSearchBoxElement);
    });

    afterEach(() => {
      if (document.body.contains(mockSearchBoxElement)) {
        document.body.removeChild(mockSearchBoxElement);
      }
    });

    it('should call closest with correct selector when element is child of atomic-search-box', () => {
      dispatchSearchBoxSuggestionsEvent(mockEvent, mockElement);

      expect(closest).toHaveBeenCalledWith(
        mockElement,
        'atomic-search-box, atomic-insight-search-box, atomic-commerce-search-box'
      );
    });

    it('should call closest when element is child of atomic-insight-search-box', () => {
      const insightSearchBox = document.createElement(
        'atomic-insight-search-box'
      );
      document.body.appendChild(insightSearchBox);
      insightSearchBox.appendChild(mockElement);
      vi.mocked(closest).mockReturnValue(insightSearchBox);

      dispatchSearchBoxSuggestionsEvent(mockEvent, mockElement);

      expect(closest).toHaveBeenCalledWith(
        mockElement,
        'atomic-search-box, atomic-insight-search-box, atomic-commerce-search-box'
      );

      if (document.body.contains(insightSearchBox)) {
        document.body.removeChild(insightSearchBox);
      }
    });

    it('should call closest when element is child of atomic-commerce-search-box', () => {
      const commerceSearchBox = document.createElement(
        'atomic-commerce-search-box'
      );
      document.body.appendChild(commerceSearchBox);
      commerceSearchBox.appendChild(mockElement);
      vi.mocked(closest).mockReturnValue(commerceSearchBox);

      dispatchSearchBoxSuggestionsEvent(mockEvent, mockElement);

      expect(closest).toHaveBeenCalledWith(
        mockElement,
        'atomic-search-box, atomic-insight-search-box, atomic-commerce-search-box'
      );

      if (document.body.contains(commerceSearchBox)) {
        document.body.removeChild(commerceSearchBox);
      }
    });

    it('should throw error when element is not child of allowed search box elements', () => {
      vi.mocked(closest).mockReturnValue(null);

      expect(() => {
        dispatchSearchBoxSuggestionsEvent(mockEvent, mockElement);
      }).toThrow(
        'The "div" component was not handled, as it is not a child of the following elements: atomic-search-box, atomic-insight-search-box, atomic-commerce-search-box'
      );
    });

    it('should handle element with uppercase nodeName', () => {
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

    it('should not throw when element has valid parent', () => {
      expect(() => {
        dispatchSearchBoxSuggestionsEvent(mockEvent, mockElement);
      }).not.toThrow();
    });
  });
});
