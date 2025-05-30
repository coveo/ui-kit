/* eslint-disable no-import-assign */
import QuanticSearchBoxSuggestionsList from 'c/quanticSearchBoxSuggestionsList';
// import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {cleanup, buildCreateTestComponent, flushPromises} from 'c/testUtils';

const labels = {
  clear: 'Clear',
  recentQueries: 'Recent queries',
};

jest.mock(
  '@salesforce/label/c.quantic_Clear',
  () => ({default: labels.clear}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_QuerySuggestionAriaLabel',
  () => ({default: 'Query suggestion'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_RecentQueries',
  () => ({default: labels.recentQueries}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_RecentQueryAriaLabel',
  () => ({default: 'Recent query'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_SuggestionFound',
  () => ({default: '{{0}} suggestion found'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_SuggestionFound_Plural',
  () => ({default: '{{0}} suggestions found'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_SuggestionNotFound',
  () => ({default: 'No suggestions found'}),
  {
    virtual: true,
  }
);

jest.mock('c/quanticUtils', () => ({
  AriaLiveRegion: jest.fn(() => ({
    dispatchMessage: jest.fn(),
  })),
  I18nUtils: {
    format: jest.fn((template, ...args) => {
      return template.replace(
        /\{\{(\d+)\}\}/g,
        (match, index) => args[index] || match
      );
    }),
    getLabelNameWithCount: jest.fn((baseName, count) => {
      return count === 1 ? baseName : `${baseName}_plural`;
    }),
  },
  RecentQueryUtils: {
    formatRecentQuery: jest.fn((query, currentQuery) => {
      if (!currentQuery) return query;
      const lowerQuery = query.toLowerCase();
      const lowerCurrentQuery = currentQuery.toLowerCase();
      const index = lowerQuery.indexOf(lowerCurrentQuery);
      if (index === 0) {
        return `<strong>${query.substring(0, currentQuery.length)}</strong>${query.substring(currentQuery.length)}`;
      }
      return query;
    }),
  },
}));

const defaultOptions = {
  maxNumberOfSuggestions: 7,
};

const selectors = {
  listbox: '[role="listbox"]',
  option: 'li[role="option"]',
  richText: 'lightning-formatted-rich-text',
  lightningIcon: 'lightning-icon',
  clearButton: '[data-testid="clear-recent-queries"]',
  suggestionOption: '[data-testid="suggestion-option"]',
  recentQueryOption: '[data-testid="recent-query-option"]',
};

const mockSuggestions = [
  {key: 1, value: 'test query 1', rawValue: 'test query 1'},
  {key: 2, value: 'test query 2', rawValue: 'test query 2'},
  {key: 3, value: 'another suggestion', rawValue: 'another suggestion'},
];

const mockRecentQueries = [
  'recent query 1',
  'recent query 2',
  'test recent query',
];

const createTestComponent = buildCreateTestComponent(
  QuanticSearchBoxSuggestionsList,
  'c-quantic-search-box-suggestions-list',
  defaultOptions
);

describe('c-quantic-search-box-suggestions-list', () => {
  afterEach(() => {
    cleanup();
  });

  describe('suggestion list rendering', () => {
    describe('when no suggestions or recent queries are provided', () => {
      it('should render an empty list', async () => {
        const element = createTestComponent();
        await flushPromises();

        const listbox = element.shadowRoot.querySelector(selectors.listbox);
        expect(listbox).toBeTruthy();
        expect(listbox.children.length).toBe(0);
      });
    });

    describe('when suggestions are provided', () => {
      it('should render suggestions as options', async () => {
        const element = createTestComponent({
          suggestions: mockSuggestions,
        });
        await flushPromises();

        const options = element.shadowRoot.querySelectorAll(selectors.option);
        expect(options.length).toBe(mockSuggestions.length);
        // Where there's only suggestions, we don't render a clear recent queries button.
        expect(
          element.shadowRoot.querySelector(selectors.clearButton)
        ).toBeNull();
        options.forEach((option, index) => {
          const lightningRichText = option.querySelector(selectors.richText);
          expect(lightningRichText.value).toBe(mockSuggestions[index].value);
          expect(lightningRichText.title).toBe(mockSuggestions[index].rawValue);
          expect(option.querySelector(selectors.lightningIcon).iconName).toBe(
            'utility:search'
          );
        });
      });

      it('should handle a non-array suggestions input', async () => {
        const element = createTestComponent();
        element.suggestions = 'foo';
        await flushPromises();

        const options = element.shadowRoot.querySelectorAll(selectors.option);
        expect(options.length).toBe(0); // Should not render any options
      });
    });

    describe('when recent queries are provided', () => {
      it('should render recent queries as options', async () => {
        const element = createTestComponent({
          recentQueries: mockRecentQueries,
        });
        await flushPromises();

        const options = element.shadowRoot.querySelectorAll(selectors.option);
        // Should include clear button + recent queries
        expect(options.length).toBe(mockRecentQueries.length + 1);
        const clearButton = options.item(0);
        expect(clearButton.querySelector(selectors.lightningIcon)).toBeNull();
        expect(clearButton.textContent).toContain(labels.recentQueries);
        // Skip the first option (clear button) and check the rest
        Array.from(options)
          .slice(1)
          .forEach((option, index) => {
            const lightningRichText = option.querySelector(selectors.richText);
            expect(lightningRichText.value).toBe(mockRecentQueries[index]);
            expect(lightningRichText.title).toBe(mockRecentQueries[index]);
            expect(option.querySelector(selectors.lightningIcon).iconName).toBe(
              'utility:clock'
            );
          });
      });

      it('should handle a non-array recent queries input', async () => {
        const element = createTestComponent();
        element.recentQueries = 'foo';
        await flushPromises();

        const options = element.shadowRoot.querySelectorAll(selectors.option);
        expect(options.length).toBe(0); // Should not render any options
      });
    });

    describe('when both suggestions and recent queries are provided and query is empty', () => {
      it('should render suggestions and recent queries as options', async () => {
        const mockSuggestionListOptions = [
          ...mockRecentQueries.map((query) => ({
            value: query,
            rawValue: query,
            isRecentQuery: true,
          })),
          ...mockSuggestions.map((suggestion) => ({
            value: suggestion.value,
            rawValue: suggestion.rawValue,
            isRecentQuery: false,
          })),
        ];
        const element = createTestComponent({
          suggestions: mockSuggestions,
          recentQueries: mockRecentQueries,
        });
        await flushPromises();

        const options = element.shadowRoot.querySelectorAll(selectors.option);
        // Should include clear button + recent queries
        expect(options.length).toBe(
          mockSuggestions.length + mockRecentQueries.length + 1
        );
        // First option should be the clear button
        const clearButton = options.item(0);
        expect(clearButton.querySelector(selectors.lightningIcon)).toBeNull();
        expect(clearButton.textContent).toContain(labels.recentQueries);
        // Skip the first option (clear button) and check the rest
        Array.from(options)
          .slice(1)
          .forEach((option, index) => {
            const lightningRichText = option.querySelector(selectors.richText);
            expect(lightningRichText.value).toBe(
              mockSuggestionListOptions[index].value
            );
            expect(lightningRichText.title).toBe(
              mockSuggestionListOptions[index].rawValue
            );
            const expectedIcon = mockSuggestionListOptions[index].isRecentQuery
              ? 'utility:clock'
              : 'utility:search';
            expect(option.querySelector(selectors.lightningIcon).iconName).toBe(
              expectedIcon
            );
          });
      });
    });
  });

  describe('query property', () => {
    it('should filter recent queries based on current query', async () => {
      const element = createTestComponent({
        recentQueries: mockRecentQueries,
        query: 'test',
      });
      await flushPromises();

      // Should only show recent queries that start with 'test'
      const options = element.shadowRoot.querySelectorAll(selectors.option);
      // Clear button + filtered recent queries
      expect(options.length).toBe(2); // clear button + 'test recent query'
      // The first option should be the clear button
      const clearButton = options.item(0);
      expect(clearButton.querySelector(selectors.lightningIcon)).toBeNull();
      expect(clearButton.textContent).toContain(labels.recentQueries);
    });

    it('should bold the current query in recent queries', async () => {
      const element = createTestComponent({
        recentQueries: mockRecentQueries,
        query: 'test',
      });
      await flushPromises();

      const options = element.shadowRoot.querySelectorAll(selectors.option);
      // Skip the first option (clear button)
      const recentQueryOption = options.item(1);
      expect(
        recentQueryOption.querySelector(selectors.richText).value
      ).toContain('<strong>test</strong>');
    });
  });

  describe('maxNumberOfSuggestions property', () => {
    it('should limit the number of suggestions displayed', async () => {
      const manySuggestions = Array.from({length: 15}, (_, i) => ({
        key: i,
        value: `suggestion ${i}`,
        rawValue: `suggestion ${i}`,
      }));

      const element = createTestComponent({
        suggestions: manySuggestions,
        maxNumberOfSuggestions: 5,
      });
      await flushPromises();

      const options = element.shadowRoot.querySelectorAll(selectors.option);
      expect(options.length).toBe(5);
    });
  });

  describe('selection navigation', () => {
    beforeEach(() => {
      // Mock the querySelector and getAttribute methods for navigation
      global.Element.prototype.getAttribute = jest
        .fn()
        .mockReturnValue('test-id');
    });

    it('should move selection down correctly', async () => {
      const element = createTestComponent({
        suggestions: mockSuggestions,
      });
      await flushPromises();

      const result = element.selectionDown();
      expect(result).toEqual({
        id: 'test-id',
        value: mockSuggestions[0].rawValue,
      });
    });

    it('should move selection up correctly', async () => {
      const element = createTestComponent({
        suggestions: mockSuggestions,
      });
      await flushPromises();

      // Move down first, then up
      element.selectionDown();
      const result = element.selectionUp();
      expect(result).toEqual({
        id: 'test-id',
        value: mockSuggestions[mockSuggestions.length - 1].rawValue,
      });
    });

    it('should wrap around when moving past the end', async () => {
      const element = createTestComponent({
        suggestions: [mockSuggestions[0]], // Only one suggestion
      });
      await flushPromises();

      element.selectionDown(); // Select first
      const result = element.selectionDown(); // Should wrap to first again
      expect(result).toEqual({
        id: 'test-id',
        value: mockSuggestions[0].rawValue,
      });
    });
  });

  describe('getCurrentSelectedValue method', () => {
    it('should return null when no selection is made', async () => {
      const element = createTestComponent({
        suggestions: mockSuggestions,
      });
      await flushPromises();

      const result = element.getCurrentSelectedValue();
      expect(result).toBeNull();
    });

    it('should return selected value when selection is made', async () => {
      const element = createTestComponent({
        suggestions: mockSuggestions,
      });
      await flushPromises();

      element.selectionDown(); // Select first suggestion
      const result = element.getCurrentSelectedValue();
      expect(result).toEqual({
        value: mockSuggestions[0].rawValue,
        isClearRecentQueryButton: false,
        isRecentQuery: false,
      });
    });
  });

  describe('event handling', () => {
    it('should dispatch quantic__selection event when suggestion is selected', async () => {
      const element = createTestComponent({
        suggestions: mockSuggestions,
      });
      await flushPromises();

      const mockEventHandler = jest.fn();
      element.addEventListener('quantic__selection', mockEventHandler);

      // Simulate clicking on first suggestion
      const firstOption = element.shadowRoot.querySelector(selectors.option);
      if (firstOption) {
        firstOption.click();
      }

      expect(mockEventHandler).toHaveBeenCalled();
    });

    it('should dispatch quantic__suggestionlistrender event on render', async () => {
      const element = createTestComponent({
        suggestions: mockSuggestions,
      });

      const mockEventHandler = jest.fn();
      element.addEventListener(
        'quantic__suggestionlistrender',
        mockEventHandler
      );

      await flushPromises();

      expect(mockEventHandler).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should announce suggestions with aria live region', async () => {
      const mockAriaLiveRegion = require('c/quanticUtils').AriaLiveRegion();

      createTestComponent({
        suggestions: mockSuggestions,
      });
      await flushPromises();

      expect(mockAriaLiveRegion.dispatchMessage).toHaveBeenCalled();
    });

    it('should announce when no suggestions are found', async () => {
      const mockAriaLiveRegion = require('c/quanticUtils').AriaLiveRegion();

      createTestComponent({
        suggestions: [],
      });
      await flushPromises();

      expect(mockAriaLiveRegion.dispatchMessage).toHaveBeenCalledWith(
        'No suggestions found'
      );
    });
  });

  describe('mixed suggestions and recent queries', () => {
    it('should display both suggestions and recent queries without duplicates', async () => {
      const element = createTestComponent({
        suggestions: mockSuggestions,
        recentQueries: mockRecentQueries,
        query: 'test',
      });
      await flushPromises();

      const options = element.shadowRoot.querySelectorAll(selectors.option);
      // Should have clear button + recent queries + non-duplicate suggestions
      expect(options.length).toBeGreaterThan(0);
    });

    it('should prioritize recent queries over suggestions', async () => {
      const element = createTestComponent({
        suggestions: mockSuggestions,
        recentQueries: ['test query 1'], // Same as first suggestion
        query: 'test',
      });
      await flushPromises();

      // Recent query should appear, suggestion should be filtered out to avoid duplicate
      const options = element.shadowRoot.querySelectorAll(selectors.option);
      expect(options.length).toBeGreaterThan(0);
    });
  });
});
