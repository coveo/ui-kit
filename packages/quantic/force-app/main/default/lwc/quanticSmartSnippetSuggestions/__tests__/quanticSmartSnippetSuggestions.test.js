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

const exampleUri = 'https://en.wikipedia.org/wiki/The_Lord_of_the_Rings';

const defaultOptions = {
  engineId: exampleEngine.id,
};

const selectors = {
  initializationError: 'c-quantic-component-error',
  smartSnippetSuggestionsComponent:
    '[data-testid="smart-snippet-suggestions-card"]',
  smartSnippetSuggestions: '[data-testid="smart-snippet-suggestion"]',
  smartSnippetSuggestionAnswers: 'c-quantic-smart-snippet-answer',
  smartSnippetSuggestionSources: 'c-quantic-smart-snippet-source',
};

const mockSmartSnippetSource = {
  title: 'The Lord of the Rings',
  uri: exampleUri,
  clickUri: exampleUri,
};

const mockSmartSnippetRelatedQuestions = [
  {
    question: 'Where is Gandalf?',
    answer: 'Gandalf is in the Mines of Moria.',
    documentId: {
      contentIdKey: '2',
      contentIdValue: '2',
    },
    questionAnswerId: '2',
    expanded: false,
    source: mockSmartSnippetSource,
    score: 0.5,
  },
  {
    question: 'Legolas, what do you see?',
    answer: "They're taking the hobbits to Isengard!",
    documentId: {
      contentIdKey: '3',
      contentIdValue: '3',
    },
    questionAnswerId: '3',
    expanded: false,
    source: mockSmartSnippetSource,
    score: 0.5,
  },
];

const defaultSmartSnippetSuggestionsState = {
  questions: mockSmartSnippetRelatedQuestions,
};

let smartSnippetSuggestionsState = defaultSmartSnippetSuggestionsState;

const functionsMocks = {
  buildSmartSnippetQuestionsList: jest.fn(() => ({
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
      buildSmartSnippetQuestionsList:
        functionsMocks.buildSmartSnippetQuestionsList,
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
    smartSnippetSuggestionsState = defaultSmartSnippetSuggestionsState;
    cleanup();
  });

  describe('controller initialization', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should build the smart snippet controller with the proper parameters and subscribe to its state change', async () => {
      createTestComponent();
      await flushPromises();

      expect(
        functionsMocks.buildSmartSnippetQuestionsList
      ).toHaveBeenCalledTimes(1);
      expect(
        functionsMocks.buildSmartSnippetQuestionsList
      ).toHaveBeenCalledWith(exampleEngine);
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
        questions: [],
      };
    });

    it('should not display the smart snippet suggestions component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const smartSnippetSuggestionsComponent = element.shadowRoot.querySelector(
        selectors.smartSnippetSuggestionsComponent
      );
      expect(smartSnippetSuggestionsComponent).toBeNull();
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

    it('should properly display the smart snippet suggestions', async () => {
      const element = createTestComponent();
      await flushPromises();

      const smartSnippetSuggestionsComponent = element.shadowRoot.querySelector(
        selectors.smartSnippetSuggestionsComponent
      );
      expect(smartSnippetSuggestionsComponent).not.toBeNull();

      const smartSnippetSuggestions = element.shadowRoot.querySelectorAll(
        selectors.smartSnippetSuggestions
      );
      const smartSnippetSuggestionsAnswers =
        element.shadowRoot.querySelectorAll(
          selectors.smartSnippetSuggestionsAnswers
        );
      const smartSnippetSuggestionsSources =
        element.shadowRoot.querySelectorAll(
          selectors.smartSnippetSuggestionSources
        );

      expect(smartSnippetSuggestions).not.toBeNull();
      expect(smartSnippetSuggestions.length).toEqual(
        mockSmartSnippetRelatedQuestions.length
      );

      smartSnippetSuggestions.forEach((suggestion, index) => {
        expect(suggestion.label).toEqual(
          mockSmartSnippetRelatedQuestions[index].question
        );
      });

      smartSnippetSuggestionsAnswers.forEach((answerElement, index) => {
        expect(answerElement.answer).toEqual(
          mockSmartSnippetRelatedQuestions[index].answer
        );
      });

      smartSnippetSuggestionsSources.forEach((sourceElement, index) => {
        expect(sourceElement.source).toEqual(
          mockSmartSnippetRelatedQuestions[index].source
        );
      });
    });
  });
});
