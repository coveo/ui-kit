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
  smartSnippetAccordionElement: 'lightning-accordion',
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
    expand: functionsMocks.expand,
    collapse: functionsMocks.collapse,
    select: functionsMocks.select,
    beginDelayedSelect: functionsMocks.beginDelayedSelect,
    cancelPendingSelect: functionsMocks.cancelPendingSelect,
    selectInlineLink: functionsMocks.selectInlineLink,
    beginDelayedSelectInlineLink: functionsMocks.beginDelayedSelectInlineLink,
    cancelPendingSelectInlineLink: functionsMocks.cancelPendingSelectInlineLink,
  })),
  smartSnippetSuggestionsStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.smartSnippetSuggestionsStateUnsubscriber;
  }),
  smartSnippetSuggestionsStateUnsubscriber: jest.fn(),
  expand: jest.fn(),
  collapse: jest.fn(),
  select: jest.fn(),
  beginDelayedSelect: jest.fn(),
  cancelPendingSelect: jest.fn(),
  selectInlineLink: jest.fn(),
  beginDelayedSelectInlineLink: jest.fn(),
  cancelPendingSelectInlineLink: jest.fn(),
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
    beforeEach(() => {
      smartSnippetSuggestionsState = {
        ...defaultSmartSnippetSuggestionsState,
        questions: [],
      };
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
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

  describe('when the query returns smart snippet suggestions', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
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
      const smartSnippetSuggestionAnswers = element.shadowRoot.querySelectorAll(
        selectors.smartSnippetSuggestionAnswers
      );
      const smartSnippetSuggestionsSources =
        element.shadowRoot.querySelectorAll(
          selectors.smartSnippetSuggestionSources
        );

      mockSmartSnippetRelatedQuestions.forEach((question, index) => {
        const suggestion = smartSnippetSuggestions[index];
        const answerElement = smartSnippetSuggestionAnswers[index];
        const sourceElement = smartSnippetSuggestionsSources[index];

        expect(suggestion.label).toEqual(question.question);
        expect(answerElement.answer).toEqual(question.answer);
        expect(sourceElement.source).toEqual(question.source);
      });
    });

    describe('when clicking on the smart snippet suggestion', () => {
      it('should call the expand and collapse methods from the smartSnippetSuggestions controller', async () => {
        const element = createTestComponent();
        await flushPromises();

        const smartSnippetAccordionElement = element.shadowRoot.querySelector(
          selectors.smartSnippetAccordionElement
        );
        expect(smartSnippetAccordionElement).not.toBeNull();
        smartSnippetAccordionElement.activeSectionName = [
          mockSmartSnippetRelatedQuestions[0].question,
        ];

        const smartSnippetSuggestionsItems =
          element.shadowRoot.querySelectorAll(
            selectors.smartSnippetSuggestions
          );
        expect(smartSnippetSuggestionsItems[0]).not.toBeNull();

        await smartSnippetSuggestionsItems[0].click();
        await flushPromises();

        expect(functionsMocks.expand).toHaveBeenCalledTimes(1);
        expect(functionsMocks.expand).toHaveBeenCalledWith(
          mockSmartSnippetRelatedQuestions[0].questionAnswerId
        );

        smartSnippetAccordionElement.activeSectionName = [];
        await smartSnippetSuggestionsItems[0].click();
        await flushPromises();

        expect(functionsMocks.collapse).toHaveBeenCalledTimes(1);
        expect(functionsMocks.collapse).toHaveBeenCalledWith(
          mockSmartSnippetRelatedQuestions[0].questionAnswerId
        );
      });
    });

    it('should pass the proper actions to the smart snippet answer and source', async () => {
      const element = createTestComponent();
      await flushPromises();

      const smartSnippetAnswer = element.shadowRoot.querySelector(
        selectors.smartSnippetSuggestionAnswers
      );
      const smartSnippetSource = element.shadowRoot.querySelector(
        selectors.smartSnippetSuggestionSources
      );

      expect(smartSnippetAnswer).not.toBeNull();
      expect(smartSnippetSource).not.toBeNull();

      const expectedSmartSnippetSuggestionsActions = {
        select: functionsMocks.select,
        beginDelayedSelect: functionsMocks.beginDelayedSelect,
        cancelPendingSelect: functionsMocks.cancelPendingSelect,
      };

      expect(Object.keys(smartSnippetAnswer.actions)).toEqual(
        Object.keys(expectedSmartSnippetSuggestionsActions)
      );
      expect(Object.keys(smartSnippetSource.actions)).toEqual(
        Object.keys(expectedSmartSnippetSuggestionsActions)
      );
    });
  });
});
