// @ts-ignore
import {createElement} from 'lwc';
import QuanticSearchBoxInput from '../quanticSearchBoxInput';

const functionsMocks = {
  exampleHandleInputValueChange: jest.fn(() => {}),
  exampleHandleSubmitSearch: jest.fn(() => {}),
  exampleHandleShowSuggestions: jest.fn(() => {}),
  exampleHandleSelectSuggestion: jest.fn(() => {}),
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
};

function setupEventListeners(element) {
  element.addEventListener(
    'inputvaluechange',
    functionsMocks.exampleHandleInputValueChange
  );
  element.addEventListener(
    'submitsearch',
    functionsMocks.exampleHandleSubmitSearch
  );
  element.addEventListener(
    'showsuggestions',
    functionsMocks.exampleHandleShowSuggestions
  );
  element.addEventListener(
    'selectsuggestion',
    functionsMocks.exampleHandleSelectSuggestion
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

// Helper function to check that the input or the textarea is displayed properly.
function inputProperlyDisplayed(element, isTextarea) {
  const input = element.shadowRoot.querySelector(selectors.searchBoxInput);
  const submitButton = element.shadowRoot.querySelector(
    selectors.searchBoxSubmitBtn
  );
  const clearIcon = element.shadowRoot.querySelector(
    selectors.searchBoxClearIcon
  );
  const textarea = element.shadowRoot.querySelector(
    selectors.searchBoxTextArea
  );

  expect(isTextarea ? textarea : input).not.toBeNull();
  expect(input.placeholder).toEqual(defaultOptions.placeholder);
  expect(submitButton).not.toBeNull();
  expect(clearIcon).toBeNull();
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

      inputProperlyDisplayed(element, false);
    });
  });

  describe('when the textarea property is set to true', () => {
    it('should display the search textarea properly', async () => {
      const element = createTestComponent({...defaultOptions, textarea: true});
      await flushPromises();

      inputProperlyDisplayed(element, true);
    });
  });

  describe('when suggestions are found', () => {
    it('should display the suggestions in the suggestions list', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        suggestions: mockSuggestions,
      });
      await flushPromises();

      const suggestionsList = element.shadowRoot.querySelector(
        selectors.searchBoxSuggestionsList
      );
      expect(suggestionsList).not.toBeNull();

      const suggestionsListItems =
        suggestionsList.shadowRoot.querySelectorAll('li');
      expect(suggestionsListItems).not.toBeNull();

      expect(suggestionsListItems.length).toEqual(3);
    });
  });

  describe('when focusing on the input', () => {
    it('should dispatch a #showsuggestions custom event', async () => {
      const element = createTestComponent();
      setupEventListeners(element);
      await flushPromises();

      const input = element.shadowRoot.querySelector(selectors.searchBoxInput);
      expect(input).not.toBeNull();

      await input.focus();

      expect(functionsMocks.exampleHandleShowSuggestions).toHaveBeenCalledTimes(
        1
      );
    });

    describe('when selecting a suggestion from the suggestions list', () => {
      it('should dispatch a #selectsuggestion event with the selected suggestion as payload', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          suggestions: mockSuggestions,
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
          functionsMocks.exampleHandleSelectSuggestion
        ).toHaveBeenCalledTimes(1);

        // @ts-ignore
        const eventData =
          functionsMocks.exampleHandleSelectSuggestion.mock.calls[0][0];
        const expectedFirstSuggestionSelected = mockSuggestions[0].rawValue;

        // @ts-ignore
        expect(eventData.detail.selectedSuggestion).toEqual(
          expectedFirstSuggestionSelected
        );
      });
    });
  });

  describe('when typing something in the input', () => {
    it('should dispatch an #inputvaluechange custom event with the input value as payload', async () => {
      const element = createTestComponent();
      setupEventListeners(element);
      await flushPromises();

      element.inputValue = mockInputValue;

      const input = element.shadowRoot.querySelector(selectors.searchBoxInput);
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
      it('should dispatch a #submitsearch custom event', async () => {
        const element = createTestComponent();
        setupEventListeners(element);
        await flushPromises();

        const submitButton = element.shadowRoot.querySelector(
          selectors.searchBoxSubmitBtn
        );
        expect(submitButton).not.toBeNull();

        submitButton.click();

        expect(functionsMocks.exampleHandleSubmitSearch).toHaveBeenCalledTimes(
          1
        );
      });
    });

    describe('when pressing the ENTER key', () => {
      it('should dispatch a #submitsearch custom event', async () => {
        const element = createTestComponent();
        setupEventListeners(element);
        await flushPromises();

        const input = element.shadowRoot.querySelector(
          selectors.searchBoxInput
        );
        expect(input).not.toBeNull();

        await input.focus();
        input.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter'}));

        expect(functionsMocks.exampleHandleSubmitSearch).toHaveBeenCalledTimes(
          1
        );
      });
    });
  });
});
