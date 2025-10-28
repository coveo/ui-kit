import QuanticSearchBoxInput from '../quanticSearchBoxInput';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';

const functionsMocks = {
  exampleHandleInputValueChange: jest.fn(),
  exampleHandleSubmitSearch: jest.fn(),
  exampleShowSuggestions: jest.fn(),
  exampleSelectSuggestion: jest.fn(),
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
  searchBoxInput: '[data-testid="search-box-input"]',
  searchBoxTextArea: '[data-testid="search-box-textarea"]',
  searchBoxSubmitBtn: '.searchbox__submit-button',
  searchBoxClearIcon: '.searchbox__clear-button',
  searchBoxSuggestionsList: 'c-quantic-search-box-suggestions-list',
  SuggestionsListBox: '[role="listbox"]',
  searchBoxContainer: '.searchbox__container',
  searchBoxComboBox: '.slds-combobox_container .slds-combobox',
  searchBoxSearchIcon: '.searchbox__search-icon',
  clearRecentQueryButton: '[data-testid="clear-recent-queries-button"]',
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

const createTestComponent = buildCreateTestComponent(
  QuanticSearchBoxInput,
  'c-quantic-search-box-input',
  defaultOptions
);

describe('c-quantic-search-box-input', () => {
  beforeAll(() => {
    window.coveoHeadless = {
      test: {
        bundle: {
          HighlightUtils: {
            highlightString: () => {},
          },
        },
        components: [],
        options: undefined,
        bindings: undefined,
        enginePromise: undefined,
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
          it('should pass the suggestions to the suggestions list', async () => {
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
            expect(suggestionsList.suggestions).toEqual(mockSuggestions);
          });
        });

        describe('with both query suggestions and recent queries available', () => {
          it('should display the query suggestions and the recent queries in the suggestions list', async () => {
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
            expect(suggestionsList.suggestions).toEqual(mockSuggestions);
            expect(suggestionsList.recentQueries).toEqual(exampleRecentQueries);
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

            const mockSuggestion = {
              value: 'mock suggestion',
              isClearRecentQueryButton: false,
              isRecentQuery: false,
            };

            suggestionsList.dispatchEvent(
              new CustomEvent('quantic__selection', {
                detail: {selection: mockSuggestion},
              })
            );

            expect(
              functionsMocks.exampleSelectSuggestion
            ).toHaveBeenCalledTimes(1);
            const eventData =
              functionsMocks.exampleSelectSuggestion.mock.calls[0][0];

            expect(eventData?.detail).toMatchObject({
              selectedSuggestion: mockSuggestion,
            });
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

            const mockSuggestion = {
              value: undefined,
              isClearRecentQueryButton: true,
              isRecentQuery: false,
            };

            suggestionsList.dispatchEvent(
              new CustomEvent('quantic__selection', {
                detail: {selection: mockSuggestion},
              })
            );

            expect(
              functionsMocks.exampleSelectSuggestion
            ).toHaveBeenCalledTimes(1);
            const eventData =
              functionsMocks.exampleSelectSuggestion.mock.calls[0][0];

            expect(eventData?.detail).toMatchObject({
              selectedSuggestion: mockSuggestion,
            });
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

            const mockRecentQuery = {
              value: 'recent query',
              isClearRecentQueryButton: false,
              isRecentQuery: true,
            };

            suggestionsList.dispatchEvent(
              new CustomEvent('quantic__selection', {
                detail: {selection: mockRecentQuery},
              })
            );

            expect(
              functionsMocks.exampleSelectSuggestion
            ).toHaveBeenCalledTimes(1);
            const eventData =
              functionsMocks.exampleSelectSuggestion.mock.calls[0][0];

            expect(eventData?.detail).toMatchObject({
              selectedSuggestion: mockRecentQuery,
            });
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
              expect(suggestionsList).not.toBeNull();

              const selectionDownSpy = jest.spyOn(
                suggestionsList,
                'selectionDown'
              );

              input.dispatchEvent(
                new KeyboardEvent('keydown', {key: 'ArrowDown'})
              );
              await flushPromises();

              expect(selectionDownSpy).toHaveBeenCalledTimes(1);
              const {id: selectionDownId} =
                selectionDownSpy.mock.results[0].value;
              expect(input.getAttribute('aria-activedescendant')).toBe(
                selectionDownId
              );

              const selectionUpSpy = jest.spyOn(suggestionsList, 'selectionUp');

              input.dispatchEvent(
                new KeyboardEvent('keydown', {key: 'ArrowUp'})
              );
              await flushPromises();

              expect(selectionUpSpy).toHaveBeenCalledTimes(1);
              const {id: selectionUpId} = selectionUpSpy.mock.results[0].value;
              expect(input.getAttribute('aria-activedescendant')).toBe(
                selectionUpId
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

      describe('when the component renders with a value in the input', () => {
        it('should display the clear icon', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            inputValue: mockInputValue,
            textarea: textareaValue,
          });
          await flushPromises();

          const clearIcon = element.shadowRoot.querySelector(
            selectors.searchBoxClearIcon
          );
          expect(clearIcon).not.toBeNull();
        });
      });
    });
  });
});
