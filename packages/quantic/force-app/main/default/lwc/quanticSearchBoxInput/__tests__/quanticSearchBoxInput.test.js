// @ts-ignore
import {createElement} from 'lwc';
import QuanticSearchBoxInput from '../quanticSearchBoxInput';

const functionsMocks = {
  exampleHandleInputValueChange: jest.fn((event) => event),
  exampleHandleSubmitSearch: jest.fn(() => {}),
  exampleHandleShowSuggestions: jest.fn(() => {}),
  exampleHandleSelectSuggestion: jest.fn(() => {}),
  mockClickOutsideEvent: jest.fn(() => {}),
};

const mockSuggestions = [
  {key: '1', value: 'suggestion1', rawValue: 'suggestion1'},
  {key: '2', value: 'suggestion2', rawValue: 'suggestion2'},
  {key: '3', value: 'suggestion3', rawValue: 'suggestion3'},
];

const defaultPlaceholder = 'Search...';
const exampleShortString = 'Test string';
const exampleVeryLongString =
  'exampleVeryLongStringexampleVeryLongStringexampleVeryLongStringexampleVeryLongStringexampleVeryLongStringexampleVeryLongStringexampleVeryLongStringexampleVeryLongString';
const defaultInputHeight = '48px';

const defaultOptions = {
  withoutSubmitButton: false,
  textarea: false,
  placeholder: defaultPlaceholder,
  suggestions: mockSuggestions,
};

const selectors = {
  searchBoxInput: '.searchbox__input',
  searchBoxSubmitBtn: '.searchbox__submit-button',
  searchBoxSearchIcon: '.searchbox__search-icon',
  searchBoxClearIcon: '.searchbox__clear-button',
  searchBoxSuggestionsList: 'c-quantic-search-box-suggestions-list',
  searchBoxSuggestionsListItems: 'c-quantic-search-box-suggestions-list li',
  searchBoxTextArea: '.searchbox__container textarea',
  searchBoxContainer: '.searchbox__container',
};

function setupEventListeners(element) {
  element.addEventListener(
    'inputValueChange',
    functionsMocks.exampleHandleInputValueChange
  );
  element.addEventListener(
    'submitSearch',
    functionsMocks.exampleHandleSubmitSearch
  );
  element.addEventListener(
    'showSuggestions',
    functionsMocks.exampleHandleShowSuggestions
  );
  element.addEventListener(
    'selectSuggestion',
    functionsMocks.exampleHandleSelectSuggestion
  );
  window.addEventListener('clickOutside', functionsMocks.mockClickOutsideEvent);
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

  describe('when the textarea property is set to false', () => {
    it('should display the search input properly', async () => {
      const element = createTestComponent();
      await flushPromises();

      const input = element.shadowRoot.querySelector(selectors.searchBoxInput);
      const submitButton = element.shadowRoot.querySelector(
        selectors.searchBoxSubmitBtn
      );
      const searchIcon = element.shadowRoot.querySelector(
        selectors.searchBoxSearchIcon
      );
      const clearIcon = element.shadowRoot.querySelector(
        selectors.searchBoxClearIcon
      );

      expect(input).not.toBeNull();
      expect(submitButton).not.toBeNull();
      expect(searchIcon).toBeNull();
      expect(input.placeholder).toEqual(defaultOptions.placeholder);
      expect(clearIcon).toBeNull();
    });

    describe('when clicking on the input', () => {
      it('should display suggestions from the suggestions list', async () => {
        const element = createTestComponent();
        await flushPromises();

        const input = element.shadowRoot.querySelector(
          selectors.searchBoxInput
        );
        input.click();

        const suggestionsList = element.shadowRoot.querySelector(
          selectors.searchBoxSuggestionsList
        );
        const suggestionsListItems = element.shadowRoot.querySelector(
          selectors.searchBoxSuggestionsListItems
        );

        expect(suggestionsList).not.toBeNull();
        expect(suggestionsListItems.length).toEqual(3);
      });
      it('should dispatch a #showSuggestions custom event', async () => {
        const element = createTestComponent();
        setupEventListeners(element);
        await flushPromises();

        const input = element.shadowRoot.querySelector(
          selectors.searchBoxInput
        );
        input.click();

        expect(
          functionsMocks.exampleHandleShowSuggestions
        ).toHaveBeenCalledTimes(1);
      });

      describe('when selecting a suggestion from the suggestions list', () => {
        it('should dispatch a #selectSuggestion event with the selected suggestion as payload', async () => {
          const element = createTestComponent();
          setupEventListeners(element);
          await flushPromises();

          const firstSuggestion = element.shadowRoot.querySelector(
            selectors.searchBoxSuggestionsListItems[0]
          );
          firstSuggestion.click();

          expect(
            functionsMocks.exampleHandleSelectSuggestion
          ).toHaveBeenCalledTimes(1);

          const eventData =
            functionsMocks.exampleHandleSelectSuggestion.mock.calls[0][0];
          const expectedFirstSuggestionSelected = mockSuggestions[0].rawValue;

          expect(eventData.detail.selectedSuggestion).toEqual(
            expectedFirstSuggestionSelected
          );
        });
      });
    });
    describe('when typing something in the input', () => {
      it('should display the clear input icon', async () => {
        const element = createTestComponent();
        await flushPromises();

        const input = element.shadowRoot.querySelector(
          selectors.searchBoxInput
        );
        input.type(exampleShortString);

        const clearIcon = element.shadowRoot.querySelector(
          selectors.searchBoxClearIcon
        );
        expect(clearIcon).not.toBeNull();
      });
      it('should clear the input when clicking on the clear input icon', async () => {
        const element = createTestComponent();
        await flushPromises();

        const input = element.shadowRoot.querySelector(
          selectors.searchBoxInput
        );
        input.type(exampleShortString);

        const clearIcon = element.shadowRoot.querySelector(
          selectors.searchBoxClearIcon
        );
        expect(clearIcon).not.toBeNull();

        clearIcon.click();
        expect(input).toEqual('');
      });
      it('should dispatch an #inputValueChange custom event with the input value as payload', async () => {
        const element = createTestComponent();
        setupEventListeners(element);
        await flushPromises();

        const input = element.shadowRoot.querySelector(
          selectors.searchBoxInput
        );
        input.type(exampleShortString);

        expect(
          functionsMocks.exampleHandleInputValueChange
        ).toHaveBeenCalledTimes(1);

        const eventData =
          functionsMocks.exampleHandleInputValueChange.mock.calls[0][0];
        expect(eventData.detail.newInputValue).toEqual(exampleShortString);
      });

      describe('when clicking on the submit button', () => {
        it('should dispatch a #submitSearch custom event', async () => {
          const element = createTestComponent();
          setupEventListeners(element);
          await flushPromises();

          const input = element.shadowRoot.querySelector(
            selectors.searchBoxInput
          );
          input.type(exampleShortString);

          const submitButton = element.shadowRoot.querySelector(
            selectors.searchBoxSubmitBtn
          );
          submitButton.click();

          expect(
            functionsMocks.exampleHandleSubmitSearch
          ).toHaveBeenCalledTimes(1);
        });
      });

      describe('when pressing the ENTER key', () => {
        it('should dispatch a #submitSearch custom event', async () => {
          const element = createTestComponent();
          setupEventListeners(element);
          await flushPromises();

          const input = element.shadowRoot.querySelector(
            selectors.searchBoxInput
          );
          input.type(exampleShortString);

          const enterKeyPress = new KeyboardEvent('keypress', {
            key: 'Enter',
            code: 'Enter',
            charCode: 13,
            keyCode: 13,
          });
          // Triggers search by pressing the ENTER key
          await input.dispatchEvent(enterKeyPress);
          expect(
            functionsMocks.exampleHandleSubmitSearch
          ).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  describe('when the textarea property is set to true', () => {
    it('should display the search textarea properly', async () => {
      const element = createTestComponent({...defaultOptions, textarea: true});
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(
        selectors.searchBoxTextArea
      );
      const submitButton = element.shadowRoot.querySelector(
        selectors.searchBoxSubmitBtn
      );
      const searchIcon = element.shadowRoot.querySelector(
        selectors.searchBoxSearchIcon
      );
      const clearIcon = element.shadowRoot.querySelector(
        selectors.searchBoxClearIcon
      );

      expect(textarea).not.toBeNull();
      expect(submitButton).not.toBeNull();
      expect(searchIcon).toBeNull();
      expect(textarea.placeholder).toEqual(defaultOptions.placeholder);
      expect(clearIcon).toBeNull();
    });

    describe('when typing a very long string in the textarea', () => {
      it('should expand down properly', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          textarea: true,
        });
        await flushPromises();

        const textarea = element.shadowRoot.querySelector(
          selectors.searchBoxTextArea
        );
        const searchBoxContainer = element.shadowRoot.querySelector(
          selectors.searchBoxContainer
        );

        await textarea.type(exampleVeryLongString);
        const textareaHeight = window.getComputedStyle(textarea).height;

        const ariaExpanded = searchBoxContainer.getAttribute('aria-expanded');

        expect(textareaHeight).not.toEqual(defaultInputHeight);
        expect(searchBoxContainer.classList.contains('slds-is-open')).toBe(
          true
        );
        expect(ariaExpanded).toEqual(true);
      });
    });

    describe('when clicking on the clear input icon', () => {
      it('should collapse the expanded textarea back to its default height', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          textarea: true,
        });
        await flushPromises();

        const searchBoxContainer = element.shadowRoot.querySelector(
          selectors.searchBoxContainer
        );

        const textarea = element.shadowRoot.querySelector(
          selectors.searchBoxTextArea
        );
        await textarea.type(exampleVeryLongString);

        const clearIcon = element.shadowRoot.querySelector(
          selectors.searchBoxClearIcon
        );
        expect(clearIcon).not.toBeNull();
        await clearIcon.click();

        const textareaHeight = window.getComputedStyle(textarea).height;
        const ariaExpanded = searchBoxContainer.getAttribute('aria-expanded');

        expect(textareaHeight).toEqual(defaultInputHeight);
        expect(searchBoxContainer.classList.contains('slds-is-open')).toBe(
          true
        );
        expect(ariaExpanded).toEqual(false);
      });
    });
    describe('when triggering a search', () => {
      it('should collapse the expanded textarea back to its default height when clicking on the submit button', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          textarea: true,
        });
        await flushPromises();

        const searchBoxContainer = element.shadowRoot.querySelector(
          selectors.searchBoxContainer
        );

        const textarea = element.shadowRoot.querySelector(
          selectors.searchBoxTextArea
        );
        await textarea.type(exampleVeryLongString);

        const submitButton = element.shadowRoot.querySelector(
          selectors.searchBoxSubmitBtn
        );
        expect(submitButton).not.toBeNull();
        await submitButton.click();

        const textareaHeight = window.getComputedStyle(textarea).height;
        const ariaExpanded = searchBoxContainer.getAttribute('aria-expanded');

        expect(textareaHeight).toEqual(defaultInputHeight);
        expect(searchBoxContainer.classList.contains('slds-is-open')).toBe(
          true
        );
        expect(ariaExpanded).toEqual(false);
      });
      it('should collapse the expanded textarea back to its default height when pressing the ENTER key', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          textarea: true,
        });
        await flushPromises();

        const searchBoxContainer = element.shadowRoot.querySelector(
          selectors.searchBoxContainer
        );

        const textarea = element.shadowRoot.querySelector(
          selectors.searchBoxTextArea
        );
        await textarea.type(exampleVeryLongString);

        const enterKeyPress = new KeyboardEvent('keypress', {
          key: 'Enter',
          code: 'Enter',
          charCode: 13,
          keyCode: 13,
        });
        // Triggers search by pressing the ENTER key
        await textarea.dispatchEvent(enterKeyPress);

        const textareaHeight = window.getComputedStyle(textarea).height;
        const ariaExpanded = searchBoxContainer.getAttribute('aria-expanded');

        expect(textareaHeight).toEqual(defaultInputHeight);
        expect(searchBoxContainer.classList.contains('slds-is-open')).toBe(
          true
        );
        expect(ariaExpanded).toEqual(false);
      });
    });
    describe('when clicking outside of the textarea', () => {
      it('should collapse the expanded textarea back to its default height', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          textarea: true,
        });
        await flushPromises();

        const searchBoxContainer = element.shadowRoot.querySelector(
          selectors.searchBoxContainer
        );

        const textarea = element.shadowRoot.querySelector(
          selectors.searchBoxTextArea
        );
        await textarea.type(exampleVeryLongString);

        // click anywhere on the window other than the textarea
        document.dispatchEvent(new MouseEvent('clickOutside'));
        expect(functionsMocks.mockClickOutsideEvent).toHaveBeenCalled();

        const textareaHeight = window.getComputedStyle(textarea).height;
        const ariaExpanded = searchBoxContainer.getAttribute('aria-expanded');

        expect(textareaHeight).toEqual(defaultInputHeight);
        expect(searchBoxContainer.classList.contains('slds-is-open')).toBe(
          true
        );
        expect(ariaExpanded).toEqual(false);
      });
    });
  });
});
