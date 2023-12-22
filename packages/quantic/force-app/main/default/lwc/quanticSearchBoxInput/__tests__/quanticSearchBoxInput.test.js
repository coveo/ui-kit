import QuanticSearchBoxInput from 'c/quanticSearchBoxInput';
// @ts-ignore
import {createElement} from 'lwc';

const functionsMocks = {};

const mockSuggestions = [
    {key: '1', value: 'suggestion1', rawValue: 'suggestion1'},
    {key: '2', value: 'suggestion2', rawValue: 'suggestion2'},
    {key: '3', value: 'suggestion3', rawValue: 'suggestion3'}
];

const defaultPlaceholder = 'Search...';

const defaultOptions = {
  withoutSubmitButton: false,
  textarea: false,
  placeholder: defaultPlaceholder,
  suggestions: mockSuggestions,
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-quickview-content', {
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

        const input = element.shadowRoot.querySelector('.searchbox__input');
        const submitButton = element.shadowRoot.querySelector('.searchbox__submit-button');
        const searchIcon = element.shadowRoot.querySelector('.searchbox__search-icon');

        expect(input).not.toBeNull();
        expect(submitButton).not.toBeNull();
        expect(searchIcon).toBeNull();
        expect(input.placeholder).toEqual(defaultOptions.placeholder);
    });
    
    describe('when clicking on the searchbox', () => {
        it('should display suggestions from the suggestions list', async () => {});
        it('should dispatch a #showSuggestions custom event', async () => {});
        
        describe('when selecting a suggestion from the suggestions list', () => {
            it('should dispatch a #selectSuggestion event with the selected suggestion as payload');
        });
    });
    describe('when typing something in the input', () => {
        it('should display the clear input icon', async () => {});
        it('should dispatch an #inputValueChange custom event with the input value as payload', async () => {});

        describe('when clicking on the submit button', () => {
            it('should dispatch a #submitSearch custom event', async () => {});
        });
        describe('when pressing the ENTER key', () => {
            it('should dispatch a #submitSearch custom event', async () => {});
        });
    });
  });

  //   describe('when the textarea property is set to true', () => {});
});
