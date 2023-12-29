// @ts-nocheck
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
  //   suggestions: mockSuggestions,
  suggestions: [],
};

const selectors = {
  searchBoxInput: '.searchbox__input',
  searchBoxSubmitBtn: '.searchbox__submit-button',
  searchBoxSearchIcon: '.searchbox__search-icon',
  searchBoxClearIcon: '.searchbox__clear-button',
  searchBoxSuggestionsList: 'c-quantic-search-box-suggestions-list',
  searchBoxTextArea: '.searchbox__container textarea',
  searchBoxContainer: '.searchbox__container',
  searchBoxComboBox: '.slds-combobox_container .slds-combobox',
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

// Helper function to type something in the input or textarea.
async function typeInInput(input, val) {
  input.focus();
  input.value = val;
  const inputEvent = new CustomEvent('inputValueChange', {bubbles: true});
  input.dispatchEvent(inputEvent);
}

// Helper function to clear the input from its value
async function clickClearIcon(element) {
  const clearIcon = await element.shadowRoot.querySelector(
    selectors.searchBoxClearIcon
  );
  expect(clearIcon).not.toBeNull();
  clearIcon.click();
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
      expect(input.placeholder).toEqual(defaultOptions.placeholder);
      expect(submitButton).not.toBeNull();
      expect(searchIcon).toBeNull();
      expect(clearIcon).toBeNull();
    });

    describe('when suggestions there are found', () => {
      it('should display suggestions in the suggestions list', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          suggestions: mockSuggestions,
        });
        await flushPromises();

        const suggestionsList = element.shadowRoot.querySelector(
          selectors.searchBoxSuggestionsList
        );
        const suggestionsListItems =
          suggestionsList.shadowRoot.querySelectorAll('li');

        expect(suggestionsList).not.toBeNull();
        expect(suggestionsListItems).not.toBeNull();
        expect(suggestionsListItems.length).toEqual(3);
      });
    });

    describe('when focusing on the input', () => {
      it('should dispatch a #showSuggestions custom event', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          suggestions: mockSuggestions,
        });
        setupEventListeners(element);
        await flushPromises();

        const input = element.shadowRoot.querySelector(
          selectors.searchBoxInput
        );
        expect(input).not.toBeNull();
        input.focus();

        expect(
          functionsMocks.exampleHandleShowSuggestions
        ).toHaveBeenCalledTimes(1);
      });

      describe('when selecting a suggestion from the suggestions list', () => {
        it('should dispatch a #selectSuggestion event with the selected suggestion as payload', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            suggestions: mockSuggestions,
          });
          setupEventListeners(element);
          await flushPromises();

          const suggestionsList = element.shadowRoot.querySelector(
            selectors.searchBoxSuggestionsList
          );
          const firstSuggestion =
            suggestionsList.shadowRoot.querySelectorAll('li')[0];

          expect(firstSuggestion).not.toBeNull();
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
      // eslint-disable-next-line jest/no-focused-tests
      it.skip('should display the clear input icon', async () => {
        const element = createTestComponent();
        await flushPromises();

        const input = element.shadowRoot.querySelector(
          selectors.searchBoxInput
        );
        expect(input).not.toBeNull();

        await typeInInput(input, exampleShortString);

        const clearIcon = await element.shadowRoot.querySelector(
          selectors.searchBoxClearIcon
        );
        expect(clearIcon).not.toBeNull();
      });
      // eslint-disable-next-line jest/no-focused-tests
      it.skip('should clear the input when clicking on the clear input icon', async () => {
        const element = createTestComponent();
        await flushPromises();

        const input = element.shadowRoot.querySelector(
          selectors.searchBoxInput
        );
        expect(input).not.toBeNull();
        await typeInInput(input, exampleShortString);

        const clearIcon = element.shadowRoot.querySelector(
          selectors.searchBoxClearIcon
        );
        expect(clearIcon).not.toBeNull();
        clearIcon.click();
        expect(input).toEqual('');
      });
      // eslint-disable-next-line jest/no-focused-tests
      it.skip('should dispatch an #inputValueChange custom event with the input value as payload', async () => {
        const element = createTestComponent();
        setupEventListeners(element);
        await flushPromises();

        const input = element.shadowRoot.querySelector(
          selectors.searchBoxInput
        );
        expect(input).not.toBeNull();
        await typeInInput(input, exampleShortString);

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
        it('should dispatch a #submitSearch custom event', async () => {
          const element = createTestComponent();
          setupEventListeners(element);
          await flushPromises();

          const input = element.shadowRoot.querySelector(
            selectors.searchBoxInput
          );
          expect(input).not.toBeNull();
          await typeInInput(input, exampleShortString);

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
        expect(textarea).not.toBeNull();
        textarea.click();

        const searchBoxComboBox = element.shadowRoot.querySelector(
          selectors.searchBoxComboBox
        );
        // eslint-disable-next-line @lwc/lwc/no-inner-html
        console.log(searchBoxComboBox.innerHTML);
        expect(textarea).not.toBeNull();
        await typeInInput(textarea, exampleVeryLongString);
        // const textareaHeight = window.getComputedStyle(textarea).height;
        const ariaExpanded = searchBoxComboBox.getAttribute('aria-expanded');

        // expect(textareaHeight).not.toEqual(defaultInputHeight);
        // expect(searchBoxComboBox.classList.contains('slds-is-open')).toBe(
        //   true
        // );
        expect(ariaExpanded).toEqual('true');
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
        expect(textarea).not.toBeNull();
        await typeInInput(textarea, exampleVeryLongString);

        clickClearIcon(element);

        const textareaHeight = window.getComputedStyle(textarea).height;

        expect(textareaHeight).toEqual(defaultInputHeight);
        expect(searchBoxContainer.classList.contains('slds-is-open')).toBe(
          false
        );
      });
    });

    describe('when triggering a search', () => {
      it.skip('should collapse the expanded textarea back to its default height when clicking on the submit button', async () => {
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
        expect(textarea).not.toBeNull();
        await typeInInput(textarea, exampleVeryLongString);

        const submitButton = element.shadowRoot.querySelector(
          selectors.searchBoxSubmitBtn
        );
        expect(submitButton).not.toBeNull();
        await submitButton.click();

        const textareaHeight = window.getComputedStyle(textarea).height;

        expect(textareaHeight).toEqual(defaultInputHeight);
        expect(searchBoxContainer.classList.contains('slds-is-open')).toBe(
          false
        );
      });
      it.skip('should collapse the expanded textarea back to its default height when pressing the ENTER key', async () => {
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
        expect(textarea).not.toBeNull();
        await typeInInput(textarea, exampleVeryLongString);

        const enterKeyPress = new KeyboardEvent('keypress', {
          key: 'Enter',
          code: 'Enter',
          charCode: 13,
          keyCode: 13,
        });
        // Triggers search by pressing the ENTER key
        await textarea.dispatchEvent(enterKeyPress);

        expect(searchBoxContainer.classList.contains('slds-is-open')).toBe(
          false
        );
      });
    });
    describe.skip('when clicking outside of the textarea', () => {
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
        expect(textarea).not.toBeNull();
        await typeInInput(textarea, exampleVeryLongString);

        // click anywhere on the window other than the textarea
        await document.dispatchEvent(new MouseEvent('clickOutside'));
        expect(functionsMocks.mockClickOutsideEvent).toHaveBeenCalled();

        const textareaHeight = window.getComputedStyle(textarea).height;

        expect(textareaHeight).toEqual(defaultInputHeight);
        expect(searchBoxContainer.classList.contains('slds-is-open')).toBe(
          false
        );
      });
    });
  });
});
