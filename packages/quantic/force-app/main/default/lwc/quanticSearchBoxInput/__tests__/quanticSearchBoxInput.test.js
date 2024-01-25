// @ts-ignore
import {createElement} from 'lwc';
import QuanticSearchBoxInput from '../quanticSearchBoxInput';

const functionsMocks = {
  exampleHandleInputValueChange: jest.fn(() => {}),
  exampleHandleSubmitSearch: jest.fn(() => {}),
  exampleShowSuggestions: jest.fn(() => {}),
  exampleSelectSuggestion: jest.fn(() => {}),
  exampleHandleKeyup: jest.fn(() => {}),
};

const defaultPlaceholder = 'Search...';
const mockInputValue = 'Test input value';
const mockSuggestions = [
  {key: '1', value: 'suggestion1', rawValue: 'suggestion1'},
  {key: '2', value: 'suggestion2', rawValue: 'suggestion2'},
  {key: '3', value: 'suggestion3', rawValue: 'suggestion3'},
];

const defaultOptions = {
  withoutSubmitButton: false,
  textarea: true,
  placeholder: defaultPlaceholder,
  suggestions: [],
};

const selectors = {
  searchBoxInput: '.searchbox__input',
  searchBoxTextArea: '.searchbox__container textarea',
  searchBoxSubmitBtn: '.searchbox__submit-button',
  searchBoxClearIcon: '.searchbox__clear-button',
  searchBoxSuggestionsList: 'c-quantic-search-box-suggestions-list',
  searchBoxContainer: '.searchbox__container',
  searchBoxComboBox: '.slds-combobox_container .slds-combobox',
  searchBoxSearchIcon: '.searchbox__search-icon',
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
  element.addEventListener('keyup', functionsMocks.exampleHandleKeyup);
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

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  [true, false].forEach((textareaValue) => {
    describe(`when the textarea property is set to ${textareaValue}`, () => {
      if (textareaValue) {
        it('should display the expandable search box properly', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            textarea: true,
          });
          await flushPromises();

          const submitButton = element.shadowRoot.querySelector(
            selectors.searchBoxSubmitBtn
          );
          const clearIcon = element.shadowRoot.querySelector(
            selectors.searchBoxClearIcon
          );
          const textarea = element.shadowRoot.querySelector(
            selectors.searchBoxTextArea
          );

          expect(textarea).not.toBeNull();
          expect(textarea.placeholder).toEqual(defaultOptions.placeholder);
          expect(submitButton).not.toBeNull();
          expect(clearIcon).toBeNull();
        });
      } else {
        it('should display the default search box properly', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            textarea: textareaValue,
          });
          await flushPromises();

          const input = element.shadowRoot.querySelector(
            selectors.searchBoxInput
          );
          const submitButton = element.shadowRoot.querySelector(
            selectors.searchBoxSubmitBtn
          );
          const clearIcon = element.shadowRoot.querySelector(
            selectors.searchBoxClearIcon
          );

          expect(input).not.toBeNull();
          expect(input.placeholder).toEqual(defaultOptions.placeholder);
          expect(submitButton).not.toBeNull();
          expect(clearIcon).toBeNull();
        });
      }

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
            selectors.searchBoxInput
          );

          expect(input.placeholder).toEqual(customPlaceholder);
        });
      });

      describe('when the suggestions list is not empty', () => {
        it('should display the suggestions in the suggestions list', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            suggestions: mockSuggestions,
            textarea: textareaValue,
          });
          await flushPromises();

          const suggestionsList = element.shadowRoot.querySelector(
            selectors.searchBoxSuggestionsList
          );
          expect(suggestionsList).not.toBeNull();

          const suggestionsListItems =
            suggestionsList.shadowRoot.querySelectorAll('li');
          expect(suggestionsListItems).not.toBeNull();

          expect(suggestionsListItems.length).toEqual(mockSuggestions.length);
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
            selectors.searchBoxInput
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

            const suggestionsList = element.shadowRoot.querySelector(
              selectors.searchBoxSuggestionsList
            );
            expect(suggestionsList).not.toBeNull();

            const firstSuggestion =
              suggestionsList.shadowRoot.querySelectorAll('li')[0];
            expect(firstSuggestion).not.toBeNull();

            firstSuggestion.click();

            expect(
              functionsMocks.exampleSelectSuggestion
            ).toHaveBeenCalledTimes(1);

            const eventData =
              functionsMocks.exampleSelectSuggestion.mock.calls[0][0] &&
              functionsMocks.exampleSelectSuggestion.mock.calls[0][0];
            const expectedFirstSuggestionSelected = mockSuggestions[0].rawValue;

            // @ts-ignore
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
          });
          setupEventListeners(element);
          await flushPromises();

          element.inputValue = mockInputValue;

          const input = element.shadowRoot.querySelector(
            selectors.searchBoxInput
          );
          expect(input).not.toBeNull();

          input.dispatchEvent(new KeyboardEvent('keyup', {key: 'a'}));
          expect(
            functionsMocks.exampleHandleInputValueChange
          ).toHaveBeenCalledTimes(1);

          // @ts-ignore
          const eventData =
            functionsMocks.exampleHandleInputValueChange.mock.calls[0][0];
          // @ts-ignore
          expect(eventData.detail.newInputValue).toEqual(mockInputValue);
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
              selectors.searchBoxInput
            );
            expect(input).not.toBeNull();

            await input.focus();
            input.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter'}));

            expect(
              functionsMocks.exampleHandleSubmitSearch
            ).toHaveBeenCalledTimes(1);
          });
        });
      });
    });
  });
});
