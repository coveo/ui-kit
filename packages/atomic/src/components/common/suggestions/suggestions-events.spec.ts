import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {closest} from '@/src/utils/dom-utils';
import {dispatchSearchBoxSuggestionsEvent} from './suggestions-events';
import type {SearchBoxSuggestionsEvent} from './suggestions-types';

vi.mock('@/src/utils/event-utils', {spy: true});
vi.mock('@/src/utils/dom-utils', {spy: true});

describe('suggestions-events', () => {
  describe('#dispatchSearchBoxSuggestionsEvent', () => {
    let mockElement: HTMLElement;
    let mockEvent: SearchBoxSuggestionsEvent<unknown>;

    beforeEach(() => {
      document.body.innerHTML = '';
      mockElement = document.createElement('div');
      mockEvent = vi.fn();
      vi.clearAllMocks();
    });

    afterEach(() => {
      document.body.innerHTML = '';
      vi.restoreAllMocks();
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

    it('should respect custom allowedSearchBoxElements parameter', () => {
      vi.mocked(closest).mockReturnValue(null);
      const customElements = ['atomic-search-box'] as const;

      expect(() => {
        dispatchSearchBoxSuggestionsEvent(
          mockEvent,
          mockElement,
          customElements
        );
      }).toThrow(
        'The "div" component was not handled, as it is not a child of the following elements: atomic-search-box'
      );
    });

    it('should handle null element parameter gracefully', () => {
      vi.mocked(closest).mockReturnValue(null);
      const nullElement = null as unknown as HTMLElement;

      expect(() => {
        dispatchSearchBoxSuggestionsEvent(mockEvent, nullElement);
      }).toThrow();
    });
  });
});
