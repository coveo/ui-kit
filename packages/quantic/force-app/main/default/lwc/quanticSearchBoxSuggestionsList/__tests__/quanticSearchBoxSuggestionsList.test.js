/* eslint-disable no-import-assign */
import QuanticSearchBoxSuggestionsList from 'c/quanticSearchBoxSuggestionsList';
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

jest.mock('c/quanticUtils', () => {
  const ariaDispatchMessageMock = jest.fn();
  return {
    AriaLiveRegion: jest.fn().mockImplementation(() => ({
      dispatchMessage: ariaDispatchMessageMock,
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
    __ariaDispatchMessageMock: ariaDispatchMessageMock,
  };
});

const defaultOptions = {
  maxNumberOfSuggestions: 7,
};

const selectors = {
  listbox: '[role="listbox"]',
  option: 'li[role="option"]',
  richText: 'lightning-formatted-rich-text',
  lightningIcon: 'lightning-icon',
  clearRecentQueriesButton: '[data-testid="clear-recent-queries-button"]',
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

const buildMixedOptions = (suggestions, recentQueries) => {
  return [
    ...recentQueries.map((query) => ({
      value: query,
      rawValue: query,
      isRecentQuery: true,
    })),
    ...suggestions.map((suggestion) => ({
      value: suggestion.value,
      rawValue: suggestion.rawValue,
      isRecentQuery: false,
    })),
  ];
};

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
          element.shadowRoot.querySelector(selectors.clearRecentQueriesButton)
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

      it('should not display suggestions and not crash when the suggestions is not an array', async () => {
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

      it('should not display recent queries and not crash when the recentQueries is not an array', async () => {
        const element = createTestComponent();
        element.recentQueries = 'foo';
        await flushPromises();

        const options = element.shadowRoot.querySelectorAll(selectors.option);
        expect(options.length).toBe(0); // Should not render any options
      });
    });

    describe('when both suggestions and recent queries are provided and query is empty', () => {
      it('should render suggestions and recent queries as options', async () => {
        const mockSuggestionListOptions = buildMixedOptions(
          mockSuggestions,
          mockRecentQueries
        );
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
            const {value, rawValue, isRecentQuery} =
              mockSuggestionListOptions[index];
            const lightningRichText = option.querySelector(selectors.richText);
            expect(lightningRichText.value).toBe(value);
            expect(lightningRichText.title).toBe(rawValue);
            const expectedIcon = isRecentQuery
              ? 'utility:clock'
              : 'utility:search';
            expect(option.querySelector(selectors.lightningIcon).iconName).toBe(
              expectedIcon
            );
          });
      });

      it('should not render duplicates between suggestions and recent queries', async () => {
        const duplicateQuery = 'test duplicate query';
        const mockRecentQueriesWithDuplicate = [
          ...mockRecentQueries,
          duplicateQuery,
        ];
        const mockSuggestionsWithDuplicate = [
          ...mockSuggestions,
          {
            key: 4,
            value: duplicateQuery,
            rawValue: duplicateQuery,
          },
        ];
        const mockSuggestionListOptionsWithDuplicate = buildMixedOptions(
          mockSuggestionsWithDuplicate,
          mockRecentQueriesWithDuplicate
        );
        const element = createTestComponent({
          suggestions: mockSuggestionsWithDuplicate,
          recentQueries: mockRecentQueriesWithDuplicate,
        });
        await flushPromises();

        const options = element.shadowRoot.querySelectorAll(selectors.option);
        // Should include clear button + recent queries
        const expectedLength =
          mockSuggestionListOptionsWithDuplicate.length - 1 + 1; // -1 for duplicate +1 for clear button
        expect(options.length).toBe(expectedLength);
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
              mockSuggestionListOptionsWithDuplicate[index].value
            );
            expect(lightningRichText.title).toBe(
              mockSuggestionListOptionsWithDuplicate[index].rawValue
            );
            const expectedIcon = mockSuggestionListOptionsWithDuplicate[index]
              .isRecentQuery
              ? 'utility:clock'
              : 'utility:search';
            expect(option.querySelector(selectors.lightningIcon).iconName).toBe(
              expectedIcon
            );
          });
        // Last option should not be the duplicate, since it was already displayed in the recent queries
        // which appear above the suggestions.
        const lastOption = options.item(options.length - 1);
        const lastRichText = lastOption.querySelector(selectors.richText);
        expect(lastRichText.value).not.toBe(duplicateQuery);
        expect(lastRichText.title).not.toBe(duplicateQuery);
      });
    });
  });

  describe('query property', () => {
    it('should filter recent queries based on current query', async () => {
      const element = createTestComponent({
        recentQueries: [
          'recent query 1',
          'recent query 2',
          'test recent query',
        ],
        query: 'test',
      });
      await flushPromises();

      // Should only show recent queries that start with 'test'
      const options = element.shadowRoot.querySelectorAll(selectors.option);
      // Clear button + filtered recent queries
      expect(options.length).toBe(2); // clear button + 'test recent query', other recent queries don't start with 'test'
      // The first option should be the clear button
      const clearButton = options.item(0);
      expect(clearButton.querySelector(selectors.lightningIcon)).toBeNull();
      expect(clearButton.textContent).toContain(labels.recentQueries);
      const recentQueryOption = options.item(1);
      expect(recentQueryOption.querySelector(selectors.richText).value).toEqual(
        expect.stringContaining('<strong>test</strong> recent query')
      );
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
      expect(recentQueryOption.querySelector(selectors.richText).value).toEqual(
        expect.stringContaining('<strong>test</strong>')
      );
    });
  });

  describe('maxNumberOfSuggestions property', () => {
    it('should limit the number of suggestions displayed', async () => {
      const maxSuggestions = 2;
      const element = createTestComponent({
        suggestions: mockSuggestions,
        maxNumberOfSuggestions: maxSuggestions,
      });
      await flushPromises();

      const options = element.shadowRoot.querySelectorAll(selectors.option);
      expect(options.length).toBe(maxSuggestions);
    });

    it('should limit the number of recent queries displayed', async () => {
      const maxSuggestions = 2;
      const element = createTestComponent({
        recentQueries: mockRecentQueries,
        maxNumberOfSuggestions: maxSuggestions,
      });
      await flushPromises();

      const options = element.shadowRoot.querySelectorAll(selectors.option);
      expect(options.length).toBe(maxSuggestions + 1); // +1 for clear button
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

    it('should return the clear recent query button first', async () => {
      const element = createTestComponent({
        recentQueries: mockRecentQueries,
      });
      await flushPromises();

      element.selectionDown(); // Select first suggestion
      const result = element.getCurrentSelectedValue();
      expect(result).toEqual(
        expect.objectContaining({
          isClearRecentQueryButton: true,
        })
      );
    });
  });

  describe('selection navigation', () => {
    it('should move selection down correctly', async () => {
      const element = createTestComponent({
        suggestions: mockSuggestions,
      });
      await flushPromises();

      const result = element.selectionDown();
      expect(result).toEqual(
        expect.objectContaining({
          value: mockSuggestions[0].rawValue,
        })
      );
    });

    it('should move selection up correctly after moving down', async () => {
      const element = createTestComponent({
        suggestions: mockSuggestions,
      });
      await flushPromises();

      // Move down first, then up
      element.selectionDown();
      const result = element.selectionUp();
      expect(result).toEqual(
        expect.objectContaining({
          value: mockSuggestions[mockSuggestions.length - 1].rawValue,
        })
      );
    });

    it('should wrap around when moving past the end', async () => {
      const element = createTestComponent({
        suggestions: [mockSuggestions[0]], // Only one suggestion
      });
      await flushPromises();

      element.selectionDown(); // Select first
      const result = element.selectionDown(); // Should wrap to first again
      expect(result).toEqual(
        expect.objectContaining({
          value: mockSuggestions[0].rawValue,
        })
      );
    });

    it('should wrap around when moving selection up past beginning', async () => {
      const element = createTestComponent({
        suggestions: mockSuggestions,
      });
      await flushPromises();

      const result = element.selectionUp();
      expect(result).toEqual(
        expect.objectContaining({
          value: mockSuggestions[mockSuggestions.length - 1].rawValue,
        })
      );
    });
  });

  describe('event handling', () => {
    it('should dispatch quantic__suggestionlistrender event on render', async () => {
      const mockEventHandler = jest.fn();
      document.addEventListener(
        'quantic__suggestionlistrender',
        mockEventHandler
      );

      createTestComponent({
        suggestions: mockSuggestions,
      });
      await flushPromises();

      expect(mockEventHandler).toHaveBeenCalled();
    });

    it('should dispatch quantic__selection event when suggestion is selected', async () => {
      const element = createTestComponent({
        suggestions: mockSuggestions,
      });
      const mockEventHandler = jest.fn();
      element.addEventListener('quantic__selection', (event) =>
        mockEventHandler(event.detail)
      );
      await flushPromises();

      // Simulate clicking on first suggestion
      const firstOption = element.shadowRoot.querySelector(selectors.option);
      if (firstOption) {
        firstOption.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
      }

      expect(mockEventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          selection: {
            value: mockSuggestions[0].rawValue,
            isClearRecentQueryButton: false,
            isRecentQuery: false,
          },
        })
      );
    });
  });

  describe('accessibility', () => {
    it('should announce suggestions with aria live region', async () => {
      // @ts-ignore
      const {__ariaDispatchMessageMock} = require('c/quanticUtils');
      createTestComponent({
        suggestions: mockSuggestions,
      });
      await flushPromises();

      expect(__ariaDispatchMessageMock).toHaveBeenCalledTimes(1);
      expect(__ariaDispatchMessageMock).toHaveBeenCalledWith(
        `${mockSuggestions.length} suggestions found`
      );
    });

    it('should announce when no suggestions are found', async () => {
      // @ts-ignore
      const {__ariaDispatchMessageMock} = require('c/quanticUtils');
      createTestComponent({
        suggestions: [],
      });
      await flushPromises();

      expect(__ariaDispatchMessageMock).toHaveBeenCalledTimes(1);
      expect(__ariaDispatchMessageMock).toHaveBeenCalledWith(
        'No suggestions found'
      );
    });
  });
});
