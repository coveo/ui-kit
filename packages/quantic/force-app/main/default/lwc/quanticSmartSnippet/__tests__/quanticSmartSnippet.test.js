/* eslint-disable jest/no-conditional-expect */
/* eslint-disable no-import-assign */
import QuanticSmartSnippet from '../quanticSmartSnippet';
// @ts-ignore
import {createElement} from 'lwc';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

let mockAnswerHeight = 300;

jest.mock('c/quanticHeadlessLoader');
jest.mock('c/quanticUtils', () => ({
  getAbsoluteHeight: jest.fn(() => {
    return mockAnswerHeight;
  }),
  I18nUtils: {
    format: jest.fn(),
  },
  LinkUtils: {
    bindAnalyticsToLink: jest.fn(),
  },
}));

jest.mock(
  '@salesforce/label/c.quantic_SmartSnippetShowMore',
  () => ({default: 'Show more'}),
  {
    virtual: true,
  }
);

jest.mock(
  '@salesforce/label/c.quantic_SmartSnippetShowLess',
  () => ({default: 'Show less'}),
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
  smartSnippet: 'c-quantic-smart-snippet',
  smartSnippetAnswer: 'c-quantic-smart-snippet-answer',
  smartSnippetToggleButton: '[data-testid="smart-snippet__toggle-button"]',
  smartSnippetSource: 'c-quantic-smart-snippet-source',
  smartSnippetFeedback: 'c-quantic-feedback',
};

const defaultSearchStatusState = {
  hasResults: true,
  firstSearchExecuted: true,
};

let searchStatusState = defaultSearchStatusState;

const mockSmartSnippetSource = {
  title: 'The Lord of the Rings',
  uri: 'https://en.wikipedia.org/wiki/The_Lord_of_the_Rings',
};

const defaultSmartSnippetState = {
  question: 'Where was Gondor when Westfold fell?',
  answer: 'Gondor was obviously busy with other things.',
  documentId: '1',
  expanded: false,
  answerFound: true,
  liked: false,
  disliked: false,
  feedbackModalOpen: false,
  source: mockSmartSnippetSource,
};

let smartSnippetState = defaultSmartSnippetState;

const functionsMocks = {
  buildSmartSnippet: jest.fn(() => ({
    state: smartSnippetState,
    subscribe: functionsMocks.smartSnippetStateSubscriber,
    expand: functionsMocks.expand,
    collapse: functionsMocks.collapse,
  })),
  buildSearchStatus: jest.fn(() => ({
    state: searchStatusState,
    subscribe: functionsMocks.searchStatusStateSubscriber,
  })),
  smartSnippetStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.smartSnippetStateUnsubscriber;
  }),
  searchStatusStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.searchStatusStateUnsubscriber;
  }),
  smartSnippetStateUnsubscriber: jest.fn(),
  searchStatusStateUnsubscriber: jest.fn(),
  expand: jest.fn(),
  collapse: jest.fn(),
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-smart-snippet', {
    is: QuanticSmartSnippet,
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
      buildSmartSnippet: functionsMocks.buildSmartSnippet,
      buildSearchStatus: functionsMocks.buildSearchStatus,
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticSmartSnippet && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticSmartSnippet) {
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

describe('c-quantic-smart-snippet', () => {
  afterEach(() => {
    smartSnippetState = defaultSmartSnippetState;
    searchStatusState = defaultSearchStatusState;
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

      expect(functionsMocks.buildSmartSnippet).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSmartSnippet).toHaveBeenCalledWith(
        exampleEngine
      );
      expect(functionsMocks.smartSnippetStateSubscriber).toHaveBeenCalledTimes(
        1
      );
    });

    it('should build the search status controller with the proper parameters and subscribe to its state change', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledWith(
        exampleEngine
      );
      expect(functionsMocks.searchStatusStateSubscriber).toHaveBeenCalledTimes(
        1
      );
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

  describe('when the query does not return a smart snippet', () => {
    beforeAll(() => {
      smartSnippetState = {...defaultSmartSnippetState, answerFound: false};
    });
    it('should not display the smart snippet component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const smartSnippet = element.shadowRoot.querySelector(
        selectors.smartSnippet
      );
      expect(smartSnippet).toBeNull();
    });
  });

  describe('when the query returns a smart snippet', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
      smartSnippetState = defaultSmartSnippetState;
    });

    afterEach(() => {
      smartSnippetState = defaultSmartSnippetState;
    });

    it('should properly display the smart snippet', async () => {
      const element = createTestComponent();
      await flushPromises();

      const smartSnippetAnswer = element.shadowRoot.querySelector(
        selectors.smartSnippetAnswer
      );

      expect(smartSnippetAnswer).not.toBeNull();
      expect(smartSnippetAnswer.answer).toEqual(smartSnippetState.answer);

      const smartSnippetSource = element.shadowRoot.querySelector(
        selectors.smartSnippetSource
      );
      expect(smartSnippetSource).not.toBeNull();
      expect(smartSnippetSource.source).toEqual(smartSnippetState.source);

      const smartSnippetFeedback = element.shadowRoot.querySelector(
        selectors.smartSnippetFeedback
      );
      expect(smartSnippetFeedback).not.toBeNull();
    });

    describe('when the smart snippet exceeds the maximum height', () => {
      describe('when the smart snippet is collapsed', () => {
        it('should properly display the toggle button of the smart snippet component', async () => {
          const expectedShowMoreLabel = 'Show more';
          const expectedShowMoreIcon = 'utility:chevrondown';
          const element = createTestComponent();
          await flushPromises();

          const smartSnippetToggleButton = element.shadowRoot.querySelector(
            selectors.smartSnippetToggleButton
          );

          expect(smartSnippetToggleButton).not.toBeNull();
          expect(smartSnippetToggleButton.label).toBe(expectedShowMoreLabel);
          expect(smartSnippetToggleButton.iconName).toBe(expectedShowMoreIcon);
        });

        describe('when clicking on the smart snippet toggle button', () => {
          it('should call the expand method from the smartSnippet controller', async () => {
            const element = createTestComponent();
            await flushPromises();

            const smartSnippetToggleButton = element.shadowRoot.querySelector(
              selectors.smartSnippetToggleButton
            );
            expect(smartSnippetToggleButton).not.toBeNull();

            await smartSnippetToggleButton.click();
            await flushPromises();

            expect(functionsMocks.expand).toHaveBeenCalledTimes(1);
          });
        });
      });

      describe('when the smart snippet is expanded', () => {
        beforeEach(() => {
          smartSnippetState = {...defaultSmartSnippetState, expanded: true};
        });

        it('should properly display the smart snippet component', async () => {
          const expectedShowLessLabel = 'Show less';
          const expectedShowLessIcon = 'utility:chevronup';
          const element = createTestComponent();
          await flushPromises();

          const smartSnippetToggleButton = element.shadowRoot.querySelector(
            selectors.smartSnippetToggleButton
          );
          expect(smartSnippetToggleButton).not.toBeNull();
          expect(smartSnippetToggleButton.label).toBe(expectedShowLessLabel);
          expect(smartSnippetToggleButton.iconName).toBe(expectedShowLessIcon);
        });

        describe('when clicking on the smart snippet toggle button', () => {
          it('should call the collapse method from the smartSnippet controller', async () => {
            const element = createTestComponent();
            await flushPromises();

            const smartSnippetToggleButton = element.shadowRoot.querySelector(
              selectors.smartSnippetToggleButton
            );

            await smartSnippetToggleButton.click();
            await flushPromises();

            expect(functionsMocks.collapse).toHaveBeenCalledTimes(1);
          });
        });
      });
    });
  });
});
