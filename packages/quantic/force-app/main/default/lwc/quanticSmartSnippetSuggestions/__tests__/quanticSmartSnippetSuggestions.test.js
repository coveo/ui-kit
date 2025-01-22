/* eslint-disable no-import-assign */
import QuanticSmartSnippetSuggestions from '../quanticSmartSnippetSuggestions';
// @ts-ignore
import {createElement} from 'lwc';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

jest.mock('c/quanticHeadlessLoader');

jest.mock(
  '@salesforce/label/c.quantic_PeopleAlsoAsk',
  () => ({default: 'People also ask'}),
  {
    virtual: true,
  }
);

let isInitialized = false;

const exampleEngine = {
  id: 'exampleEngineId',
};

const defaultOptions = {
  engineId: exampleEngine.id,
};

const selectors = {
  initializationError: 'c-quantic-component-error',
};

const mockSmartSnippetSource = {
  title: 'The Lord of the Rings',
  uri: 'https://en.wikipedia.org/wiki/The_Lord_of_the_Rings',
};

const defaultSmartSnippetSuggestionsState = {
  question: 'Where was Gondor when Westfold fell?',
  answer: 'Gondor was obviously busy with other things.',
  documentId: '1',
  expanded: false,
  answerFound: true,
  liked: false,
  disliked: false,
  feedbackModalOpen: false,
  source: mockSmartSnippetSource,
  // ADD RELATED QUESTIONS HERE
};

let smartSnippetSuggestionsState = defaultSmartSnippetSuggestionsState;

const functionsMocks = {
  buildSmartSnippetSuggestions: jest.fn(() => ({
    state: smartSnippetSuggestionsState,
    subscribe: functionsMocks.smartSnippetSuggestionsStateSubscriber,
  })),
  smartSnippetSuggestionsStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.smartSnippetSuggestionsStateUnsubscriber;
  }),
  smartSnippetSuggestionsStateUnsubscriber: jest.fn(),
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-smart-snippet-suggestions', {
    is: QuanticSmartSnippetSuggestions,
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

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildSmartSnippet: functionsMocks.buildSmartSnippetSuggestions,
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticSmartSnippetSuggestions && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticSmartSnippetSuggestions) {
      element.setInitializationError();
    }
  };
}

function cleanup() {
  // The jsdom instance is shared across test cases in a single file so reset the DOM
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  jest.clearAllMocks();
  isInitialized = false;
}

describe('c-quantic-smart-snippet-suggestions', () => {
  afterEach(() => {
    cleanup();
  });

  describe('controller initialization', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should buil the smart snippet controller with the proper parameters and subscribe to its state change', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildSmartSnippetSuggestions).toHaveBeenCalledTimes(
        1
      );
      expect(functionsMocks.buildSmartSnippetSuggestions).toHaveBeenCalledWith(
        exampleEngine
      );
      expect(
        functionsMocks.smartSnippetSuggestionsStateSubscriber
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('when an initialization error occurs', () => {
    beforeEach(() => {
      mockErroneousHeadlessInitialization();
    });

    it('should display the initialization error component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const initializationError = element.shadowRoot.querySelector(
        selectors.initializationError
      );

      expect(initializationError).not.toBeNull();
    });
  });

  describe('when the query does not return smart snippet suggestions', () => {
    beforeAll(() => {
      smartSnippetSuggestionsState = {
        ...defaultSmartSnippetSuggestionsState,
        answerFound: false,
      };
      // TODO: CHANGE THIS TO NOT SHOW SUGGESTIONS
    });

    it('should not display the smart snippet suggestions component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const smartSnippetSuggestions = element.shadowRoot.querySelector(
        selectors.smartSnippetSuggestions
      );
      expect(smartSnippetSuggestions).toBeNull();
      expect(smartSnippetSuggestions.length).toEqual(0);
    });
  });

  describe('when the query does return smart snippet suggestions', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
      smartSnippetSuggestionsState = defaultSmartSnippetSuggestionsState;
    });

    afterEach(() => {
      smartSnippetSuggestionsState = defaultSmartSnippetSuggestionsState;
    });

    it('should display the smart snippet suggestions component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const smartSnippetSuggestions = element.shadowRoot.querySelector(
        selectors.smartSnippetSuggestions
      );
      expect(smartSnippetSuggestions).not.toBeNull();
    });
  });
});
