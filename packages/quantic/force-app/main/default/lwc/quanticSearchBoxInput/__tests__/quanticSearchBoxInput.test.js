// @ts-ignore
import {createElement} from 'lwc';
import QuanticSearchBoxInput from '../quanticSearchBoxInput';

const functionsMocks = {
  exampleHandleInputValueChange: jest.fn(() => {}),
  exampleHandleSubmitSearch: jest.fn(() => {}),
  exampleShowSuggestions: jest.fn(() => {}),
  exampleSelectSuggestion: jest.fn(() => {}),
};

const defaultPlaceholder = 'Search...';
const mockInputValue = 'Test input value';
const mockLongInputValue =
  'Test input value that is longer than the default input value length to test the textarea expanding feature';
const mockSuggestions = [
  {key: '1', value: 'suggestion1', rawValue: 'suggestion1'},
  {key: '2', value: 'suggestion2', rawValue: 'suggestion2'},
  {key: '3', value: 'suggestion3', rawValue: 'suggestion3'},
];
const exampleRecentQueries = ['foo', 'bar'];

const defaultOptions = {
  withoutSubmitButton: false,
  textarea: true,
  placeholder: defaultPlaceholder,
  suggestions: [],
};

const selectors = {
  searchBoxInput: '[data-cy="search-box-input"]',
  searchBoxTextArea: '[data-cy="search-box-textarea"]',
  searchBoxSubmitBtn: '.searchbox__submit-button',
  searchBoxClearIcon: '.searchbox__clear-button',
  searchBoxSuggestionsList: 'c-quantic-search-box-suggestions-list',
  SuggestionsListBox: '[role="listbox"]',
  searchBoxContainer: '.searchbox__container',
  searchBoxComboBox: '.slds-combobox_container .slds-combobox',
  searchBoxSearchIcon: '.searchbox__search-icon',
  suggestionOption: '[data-cy="suggestions-option"]',
  suggestionOptionText: '[data-cy="suggestions-option-text"]',
  clearRecentQueryButton: '[data-cy="clear-recent-queries"]',
};

function setupEventListeners(element) {
  element.addEventListener(
    'quantic__inputvaluechange',
    functionsMocks.exampleHandleInputValueChange
  );
  element.addEventListener(
    'quantic__submitsearch',
    functionsMocks.exampleHandleSubmitSearch
  );
  element.addEventListener(
    'quantic__showsuggestions',
    functionsMocks.exampleShowSuggestions
  );
  element.addEventListener(
    'quantic__selectsuggestion',
    functionsMocks.exampleSelectSuggestion
  );
}

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-search-box-input', {
    is: QuanticSearchBoxInput,
  });

  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }
  document.body.appendChild(element);
  return element;
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('c-quantic-search-box-input', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  }

  beforeAll(() => {
    // @ts-ignore
    global.CoveoHeadless = {
      HighlightUtils: {
        highlightString: () => {},
      },
    };
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  [false, true].forEach((textareaValue) => {
    describe(`when the textarea property is set to ${textareaValue}`, () => {
      it(`should display the ${
        textareaValue ? 'expandable' : 'default'
      } search box properly`, async () => {
        const element = createTestComponent({
          ...defaultOptions,
          textarea: textareaValue,
        });
        await flushPromises();

        const submitButton = element.shadowRoot.querySelector(
          selectors.searchBoxSubmitBtn
        );
        const clearIcon = element.shadowRoot.querySelector(
          selectors.searchBoxClearIcon
        );
        const input = element.shadowRoot.querySelector(
          textareaValue ? selectors.searchBoxTextArea : selectors.searchBoxInput
        );

        expect(input).not.toBeNull();
        expect(input.placeholder).toEqual(defaultOptions.placeholder);
        expect(submitButton).not.toBeNull();
        expect(clearIcon).toBeNull();
      });

      describe('when the withoutSubmitButton is set to false', () => {
        it('should display the submit button correctly to the right only', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            withoutSubmitButton: false,
            textarea: textareaValue,
          });
          await flushPromises();

          const submitButton = element.shadowRoot.querySelector(
            selectors.searchBoxSubmitBtn
          );

          const searchIcon = element.shadowRoot.querySelector(
            selectors.searchBoxSearchIcon
          );

          expect(submitButton).not.toBeNull();
          expect(searchIcon).toBeNull();
        });
      });

      describe('when the withoutSubmitButton is set to true', () => {
        it('should not display the submit button to the right of the searchbox', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            withoutSubmitButton: true,
            textarea: textareaValue,
          });
          await flushPromises();

          const searchIcon = element.shadowRoot.querySelector(
            selectors.searchBoxSearchIcon
          );
          const submitButton = element.shadowRoot.querySelector(
            selectors.searchBoxSubmitBtn
          );

          expect(submitButton).toBeNull();
          expect(searchIcon).not.toBeNull();
          expect(searchIcon.classList.contains('slds-input__icon_left')).toBe(
            true
          );
        });
      });

      describe('when the placeholder property receives a custom placeholder value', () => {
        it('should display the custom value as the searchbox placeholder', async () => {
          const customPlaceholder = 'Custom placeholder';
          const element = createTestComponent({
            ...defaultOptions,
            placeholder: customPlaceholder,
            textarea: textareaValue,
          });
          await flushPromises();

          const input = element.shadowRoot.querySelector(
            textareaValue
              ? selectors.searchBoxTextArea
              : selectors.searchBoxInput
          );

          expect(input.placeholder).toEqual(customPlaceholder);
        });
      });

      describe('when the suggestions list is not empty', () => {
        describe('when only query suggestions are displayed', () => {
          it('should display the suggestions in the suggestions list', async () => {
            const expectedSuggestionsLabelValues = [
              ...mockSuggestions.map((suggestion) => suggestion.rawValue),
            ];
            const element = createTestComponent({
              ...defaultOptions,
              suggestions: mockSuggestions,
              textarea: textareaValue,
            });
            await flushPromises();

            const input = element.shadowRoot.querySelector(
              textareaValue
                ? selectors.searchBoxTextArea
                : selectors.searchBoxInput
            );
            expect(input).not.toBeNull();
            await input.focus();

            const suggestionsList = element.shadowRoot.querySelector(
              selectors.searchBoxSuggestionsList
            );
            expect(suggestionsList).not.toBeNull();

            const suggestionsListItems =
              suggestionsList.shadowRoot.querySelectorAll(
                selectors.suggestionOption
              );
            expect(suggestionsListItems).not.toBeNull();
            expect(suggestionsListItems.length).toEqual(mockSuggestions.length);

            const suggestionOptionLabels =
              suggestionsList.shadowRoot.querySelectorAll(
                selectors.suggestionOptionText
              );
            const suggestionsLength = mockSuggestions.length;

            expect(suggestionOptionLabels).not.toBeNull();
            expect(suggestionOptionLabels.length).toEqual(suggestionsLength);

            suggestionOptionLabels.forEach((suggestion, index) => {
              expect(suggestion.title).toEqual(
                expectedSuggestionsLabelValues[index]
              );
            });
          });
        });

        describe('with both query suggestions and recent queries available', () => {
          it('should display the query suggestions and the recent queries in the suggestions list', async () => {
            const expectedSuggestionsLabelValues = [
              ...exampleRecentQueries,
              ...mockSuggestions.map((suggestion) => suggestion.rawValue),
            ];

            const element = createTestComponent({
              ...defaultOptions,
              suggestions: mockSuggestions,
              recentQueries: exampleRecentQueries,
              textarea: textareaValue,
              inputValue: '',
            });
            await flushPromises();

            const input = element.shadowRoot.querySelector(
              textareaValue
                ? selectors.searchBoxTextArea
                : selectors.searchBoxInput
            );
            expect(input).not.toBeNull();
            await input.focus();

            const suggestionsList = element.shadowRoot.querySelector(
              selectors.searchBoxSuggestionsList
            );
            expect(suggestionsList).not.toBeNull();

            const suggestionsListItems =
              suggestionsList.shadowRoot.querySelectorAll(
                selectors.suggestionOption
              );
            const clearRecentQueriesButton =
              suggestionsList.shadowRoot.querySelector(
                selectors.clearRecentQueryButton
              );
            expect(suggestionsListItems).not.toBeNull();
            expect(clearRecentQueriesButton).not.toBeNull();
            expect(suggestionsListItems.length).toEqual(
              mockSuggestions.length + exampleRecentQueries.length
            );

            const suggestionOptionLabels =
              suggestionsList.shadowRoot.querySelectorAll(
                selectors.suggestionOptionText
              );
            const suggestionsAndRecentQueriesLength =
              mockSuggestions.length + exampleRecentQueries.length;

            expect(suggestionOptionLabels).not.toBeNull();
            expect(suggestionOptionLabels.length).toEqual(
              suggestionsAndRecentQueriesLength
            );

            suggestionOptionLabels.forEach((suggestion, index) => {
              expect(suggestion.title).toEqual(
                expectedSuggestionsLabelValues[index]
              );
            });
          });

          describe('when pressing the DOWN to select a suggestion', () => {
            it('should persist the value of the suggestion on blur', async () => {
              const element = createTestComponent({
                ...defaultOptions,
                suggestions: mockSuggestions,
                recentQueries: exampleRecentQueries,
                textarea: textareaValue,
                inputValue: '',
              });
              await flushPromises();

              const input = element.shadowRoot.querySelector(
                textareaValue
                  ? selectors.searchBoxTextArea
                  : selectors.searchBoxInput
              );
              expect(input).not.toBeNull();

              await input.focus();
              // First keydown to navigate to the clear recent queries option.
              input.dispatchEvent(
                new KeyboardEvent('keydown', {key: 'ArrowDown'})
              );
              // Second keydown to navigate to the first recent query option.
              input.dispatchEvent(
                new KeyboardEvent('keydown', {key: 'ArrowDown'})
              );
              await flushPromises();

              expect(input.value).toBe(exampleRecentQueries[0]);

              await input.blur();
              await flushPromises();

              expect(input.value).toBe(exampleRecentQueries[0]);
            });

            it('should persist the value of the suggestion when pressing the Escape key', async () => {
              const element = createTestComponent({
                ...defaultOptions,
                suggestions: mockSuggestions,
                recentQueries: exampleRecentQueries,
                textarea: textareaValue,
                inputValue: '',
              });
              await flushPromises();

              const input = element.shadowRoot.querySelector(
                textareaValue
                  ? selectors.searchBoxTextArea
                  : selectors.searchBoxInput
              );
              expect(input).not.toBeNull();

              await input.focus();
              // First keydown to navigate to the clear recent queries option.
              input.dispatchEvent(
                new KeyboardEvent('keydown', {key: 'ArrowDown'})
              );
              // Second keydown to navigate to the first recent query option.
              input.dispatchEvent(
                new KeyboardEvent('keydown', {key: 'ArrowDown'})
              );
              await flushPromises();

              expect(input.value).toBe(exampleRecentQueries[0]);

              input.dispatchEvent(
                new KeyboardEvent('keydown', {key: 'Escape'})
              );
              await flushPromises();

              expect(input.value).toBe(exampleRecentQueries[0]);
            });
          });
        });
      });

      describe('when the suggestions list is empty', () => {
        it('should not display the quanticSearchBoxSuggestionsList component', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            suggestions: [],
            textarea: textareaValue,
          });
          await flushPromises();

          const suggestionsList = element.shadowRoot.querySelector(
            selectors.searchBoxSuggestionsList
          );
          expect(suggestionsList).toBeNull();
        });
      });

      describe('when focusing on the input', () => {
        it('should dispatch a #quantic__showsuggestions custom event', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            textarea: textareaValue,
          });
          setupEventListeners(element);
          await flushPromises();

          const input = element.shadowRoot.querySelector(
            textareaValue
              ? selectors.searchBoxTextArea
              : selectors.searchBoxInput
          );
          expect(input).not.toBeNull();

          await input.focus();

          expect(functionsMocks.exampleShowSuggestions).toHaveBeenCalledTimes(
            1
          );
        });

        describe('when selecting a suggestion from the suggestions list', () => {
          it('should dispatch a #quantic__selectsuggestion event with the selected suggestion as payload', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              suggestions: mockSuggestions,
              textarea: textareaValue,
            });
            setupEventListeners(element);
            await flushPromises();

            const input = element.shadowRoot.querySelector(
              textareaValue
                ? selectors.searchBoxTextArea
                : selectors.searchBoxInput
            );
            expect(input).not.toBeNull();

            await input.focus();

            const suggestionsList = element.shadowRoot.querySelector(
              selectors.searchBoxSuggestionsList
            );
            expect(suggestionsList).not.toBeNull();

            const querySuggestionIndex = 0;
            const firstSuggestion = suggestionsList.shadowRoot.querySelectorAll(
              selectors.suggestionOption
            )[querySuggestionIndex];
            expect(firstSuggestion).not.toBeNull();

            firstSuggestion.dispatchEvent(new CustomEvent('mousedown'));
            expect(
              functionsMocks.exampleSelectSuggestion
            ).toHaveBeenCalledTimes(1);

            /** @type{{detail: {selectedSuggestion: object}}} */
            const eventData =
              functionsMocks.exampleSelectSuggestion.mock.calls[0][0];
            const expectedFirstSuggestionSelected = {
              isClearRecentQueryButton: undefined,
              isRecentQuery: undefined,
              value: mockSuggestions[querySuggestionIndex].rawValue,
            };

            expect(eventData.detail.selectedSuggestion).toEqual(
              expectedFirstSuggestionSelected
            );
          });
        });

        describe('when selecting the clear recent query option from the suggestions list', () => {
          it('should dispatch a #quantic__selectsuggestion event with the selected suggestion as payload', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              suggestions: mockSuggestions,
              textarea: textareaValue,
              recentQueries: exampleRecentQueries,
              inputValue: '',
            });
            setupEventListeners(element);
            await flushPromises();

            const input = element.shadowRoot.querySelector(
              textareaValue
                ? selectors.searchBoxTextArea
                : selectors.searchBoxInput
            );
            expect(input).not.toBeNull();

            await input.focus();

            const suggestionsList = element.shadowRoot.querySelector(
              selectors.searchBoxSuggestionsList
            );
            expect(suggestionsList).not.toBeNull();

            const clearRecentQueriesOption =
              suggestionsList.shadowRoot.querySelectorAll(
                selectors.clearRecentQueryButton
              )[0];
            expect(clearRecentQueriesOption).not.toBeNull();

            clearRecentQueriesOption.dispatchEvent(
              new CustomEvent('mousedown')
            );
            expect(
              functionsMocks.exampleSelectSuggestion
            ).toHaveBeenCalledTimes(1);

            /** @type{{detail: {selectedSuggestion: object}}} */
            const eventData =
              functionsMocks.exampleSelectSuggestion.mock.calls[0][0];
            const expectedFirstSuggestionSelected = {
              isClearRecentQueryButton: true,
              isRecentQuery: undefined,
              value: undefined,
            };

            expect(eventData.detail.selectedSuggestion).toEqual(
              expectedFirstSuggestionSelected
            );
          });
        });

        describe('when selecting a recent query from the suggestions list', () => {
          it('should dispatch a #quantic__selectsuggestion event with the selected recent query as payload', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              suggestions: mockSuggestions,
              textarea: textareaValue,
              recentQueries: exampleRecentQueries,
              inputValue: '',
            });
            setupEventListeners(element);
            await flushPromises();

            const input = element.shadowRoot.querySelector(
              textareaValue
                ? selectors.searchBoxTextArea
                : selectors.searchBoxInput
            );
            expect(input).not.toBeNull();

            await input.focus();

            const suggestionsList = element.shadowRoot.querySelector(
              selectors.searchBoxSuggestionsList
            );
            expect(suggestionsList).not.toBeNull();

            const recentQueryIndex = 0;
            const firstRecentQuery =
              suggestionsList.shadowRoot.querySelectorAll(
                selectors.suggestionOption
              )[recentQueryIndex];
            expect(firstRecentQuery).not.toBeNull();

            firstRecentQuery.dispatchEvent(new CustomEvent('mousedown'));
            expect(
              functionsMocks.exampleSelectSuggestion
            ).toHaveBeenCalledTimes(1);

            /** @type{{detail: {selectedSuggestion: object}}} */
            const eventData =
              functionsMocks.exampleSelectSuggestion.mock.calls[0][0];
            const expectedFirstSuggestionSelected = {
              isClearRecentQueryButton: undefined,
              isRecentQuery: true,
              value: exampleRecentQueries[recentQueryIndex],
            };

            expect(eventData.detail.selectedSuggestion).toEqual(
              expectedFirstSuggestionSelected
            );
          });
        });
      });

      describe('when typing something in the input', () => {
        it('should dispatch a #quantic__inputvaluechange custom event with the input value as payload', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            textarea: textareaValue,
            inputValue: mockInputValue,
          });
          setupEventListeners(element);
          await flushPromises();

          const input = element.shadowRoot.querySelector(
            textareaValue
              ? selectors.searchBoxTextArea
              : selectors.searchBoxInput
          );
          expect(input).not.toBeNull();

          input.dispatchEvent(new KeyboardEvent('input'));
          expect(
            functionsMocks.exampleHandleInputValueChange
          ).toHaveBeenCalledTimes(1);

          /** @type{{detail: {value: string}}} */
          const eventData =
            functionsMocks.exampleHandleInputValueChange.mock.calls[0][0];
          expect(eventData.detail.value).toEqual(mockInputValue);
        });

        describe('when clicking on the submit button', () => {
          it('should dispatch a #quantic__submitsearch custom event', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              textarea: textareaValue,
            });
            setupEventListeners(element);
            await flushPromises();

            const submitButton = element.shadowRoot.querySelector(
              selectors.searchBoxSubmitBtn
            );
            expect(submitButton).not.toBeNull();

            submitButton.click();

            expect(
              functionsMocks.exampleHandleSubmitSearch
            ).toHaveBeenCalledTimes(1);
          });
        });

        describe('when pressing the ENTER key', () => {
          it('should dispatch a #quantic__submitsearch custom event', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              textarea: textareaValue,
            });
            setupEventListeners(element);
            await flushPromises();

            const input = element.shadowRoot.querySelector(
              textareaValue
                ? selectors.searchBoxTextArea
                : selectors.searchBoxInput
            );
            expect(input).not.toBeNull();

            await input.focus();
            input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));

            expect(
              functionsMocks.exampleHandleSubmitSearch
            ).toHaveBeenCalledTimes(1);
          });

          it(`${
            textareaValue ? 'should not' : 'should'
          } dispatch a #quantic__submitsearch custom event when the shift key is pressed along with the enter key`, async () => {
            const element = createTestComponent({
              ...defaultOptions,
              textarea: textareaValue,
            });
            setupEventListeners(element);
            await flushPromises();

            const input = element.shadowRoot.querySelector(
              textareaValue
                ? selectors.searchBoxTextArea
                : selectors.searchBoxInput
            );
            expect(input).not.toBeNull();

            await input.focus();
            input.dispatchEvent(
              new KeyboardEvent('keydown', {key: 'Enter', shiftKey: true})
            );

            expect(
              functionsMocks.exampleHandleSubmitSearch
            ).toHaveBeenCalledTimes(textareaValue ? 0 : 1);
          });
        });

        describe('accessibility', () => {
          describe('when pressing the DOWN and UP arrow keys', () => {
            it('should set the aria-activedescendant attribute of the input according to the currently active suggestion', async () => {
              const element = createTestComponent({
                ...defaultOptions,
                suggestions: mockSuggestions,
                textarea: textareaValue,
              });
              await flushPromises();

              const input = element.shadowRoot.querySelector(
                textareaValue
                  ? selectors.searchBoxTextArea
                  : selectors.searchBoxInput
              );
              expect(input).not.toBeNull();

              await input.focus();
              const suggestionsList = element.shadowRoot.querySelector(
                selectors.searchBoxSuggestionsList
              );
              const suggestionsListItems = Array.from(
                suggestionsList.shadowRoot.querySelectorAll(
                  selectors.suggestionOption
                )
              );
              expect(suggestionsList).not.toBeNull();
              expect(suggestionsListItems).not.toBeNull();

              input.dispatchEvent(
                new KeyboardEvent('keydown', {key: 'ArrowDown'})
              );
              await flushPromises();

              const firstSuggestionId = suggestionsListItems[0].id;

              expect(input.getAttribute('aria-activedescendant')).toBe(
                firstSuggestionId
              );

              input.dispatchEvent(
                new KeyboardEvent('keydown', {key: 'ArrowUp'})
              );
              await flushPromises();

              const lastSuggestionId = suggestionsListItems.at(-1).id;

              expect(input.getAttribute('aria-activedescendant')).toBe(
                lastSuggestionId
              );

              await input.blur();
              expect(input.getAttribute('aria-activedescendant')).toBeNull();
            });
          });

          describe('when the search box input is rendered', () => {
            it('should set the aria-controls attribute of the input according to the id of the suggestions listbox', async () => {
              const element = createTestComponent({
                ...defaultOptions,
                suggestions: mockSuggestions,
                textarea: textareaValue,
              });
              await flushPromises();

              const input = element.shadowRoot.querySelector(
                textareaValue
                  ? selectors.searchBoxTextArea
                  : selectors.searchBoxInput
              );
              expect(input).not.toBeNull();

              await input.focus();
              const suggestionsList = element.shadowRoot.querySelector(
                selectors.searchBoxSuggestionsList
              );
              const suggestionsListBox =
                suggestionsList.shadowRoot.querySelector(
                  selectors.SuggestionsListBox
                );
              expect(suggestionsList).not.toBeNull();
              expect(suggestionsListBox).not.toBeNull();

              expect(input.getAttribute('aria-controls')).toBe(
                suggestionsListBox.id
              );
            });
          });
        });
      });

      describe('when clicking on the clear icon after typing something', () => {
        it('should properly clear the input value', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            textarea: textareaValue,
          });
          await flushPromises();

          element.inputValue = mockLongInputValue;
          await flushPromises();

          const clearIcon = element.shadowRoot.querySelector(
            selectors.searchBoxClearIcon
          );
          const input = element.shadowRoot.querySelector(
            textareaValue
              ? selectors.searchBoxTextArea
              : selectors.searchBoxInput
          );

          expect(input).not.toBeNull();
          expect(input.value).toEqual(mockLongInputValue);

          clearIcon.click();
          expect(input.value).toEqual('');
          const expectedCollapsedInputHeight = textareaValue ? '0px' : '';
          expect(input.style.height).toEqual(expectedCollapsedInputHeight);
        });
      });
    });
  });
});
