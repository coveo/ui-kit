/* eslint-disable jest/no-conditional-expect */
/* eslint-disable no-import-assign */
import QuanticSmartSnippet from '../quanticSmartSnippet';
// @ts-ignore
import {createElement} from 'lwc';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

jest.mock('c/quanticHeadlessLoader');

let isInitialized = false;

const exampleEngine = {
  id: 'exampleEngineId',
};

const defaultOptions = {
  engineId: exampleEngine.id,
};

const showMoreLabel = 'Show more';
const showLessLabel = 'Show less';
const showMoreIcon = 'utility:chevrondown';
const showLessIcon = 'utility:chevronup';

const selectors = {
  initializationError: 'c-quantic-component-error',
  smartSnippet: 'c-quantic-smart-snippet',
  smartSnippetAnswer: 'c-quantic-smart-snippet-answer',
  smartSnippetToggleButton: '[data-id="smart-snippet-answer-toggle"]',
  smartSnippetSource: 'c-quantic-smart-snippet-source',
  smartSnippetFeedback: 'c-quantic-feedback',
};

const defaultSearchStatusState = {
  hasResults: true,
  firstSearchExecuted: true,
};

let searchStatusState = defaultSearchStatusState;

const defaultSmartSnippetState = {
  question: 'Where was Gondor when Westfold fell?',
  answer: 'Gondor was obviously busy with other things.',
  documentId: '1',
  expanded: false,
  answerFound: true,
  liked: false,
  disliked: false,
  feedbackModalOpen: false,
  source: null, // TODO: add a source (Type Result)
};
let smartSnippetState = defaultSmartSnippetState;

const functionsMocks = {
  buildSmartSnippet: jest.fn(() => ({
    state: smartSnippetState,
    subscribe: functionsMocks.smartSnippetStateSubscriber,
    expand: jest.fn(),
    collapse: jest.fn(),
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
};

function createTestComponent(options = defaultOptions) {
  prepareHeadlessState();

  const element = createElement('c-quantic-smart-snippet', {
    is: QuanticSmartSnippet,
  });
  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }
  document.body.appendChild(element);
  return element;
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

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
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
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
  });

  afterEach(() => {
    smartSnippetState = defaultSmartSnippetState;
    searchStatusState = defaultSearchStatusState;
    cleanup();
  });

  describe('controller initialization', () => {
    it('should build the smart snippet and searchStatus controllers with proper parameters', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildSmartSnippet).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSmartSnippet).toHaveBeenCalledWith(
        exampleEngine
      );
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledWith(
        exampleEngine
      );
    });

    it('should subscribe to the headless smart snippet and search status state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.smartSnippetStateSubscriber).toHaveBeenCalledTimes(
        1
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

    afterAll(() => {
      mockSuccessfulHeadlessInitialization();
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

  describe('when the query does return a smart snippet', () => {
    describe('when the smart snippet is collapsed', () => {
      beforeAll(() => {
        smartSnippetState = {...defaultSmartSnippetState, expanded: false};
      });

      it('should properly display the smart snippet component', async () => {
        const element = createTestComponent();
        await flushPromises();

        const smartSnippetAnswer = element.shadowRoot.querySelector(
          selectors.smartSnippetAnswer
        );
        // smartSnippetAnswer.height = 500;
        expect(smartSnippetAnswer).not.toBeNull();

        const smartSnippetToggleButton = element.shadowRoot.querySelector(
          selectors.smartSnippetToggleButton
        );
        expect(smartSnippetToggleButton).not.toBeNull();
        expect(smartSnippetToggleButton.label).toBe(showMoreLabel);
        expect(smartSnippetToggleButton.iconName).toBe(showMoreIcon);

        const smartSnippetSource = element.shadowRoot.querySelector(
          selectors.smartSnippetSource
        );
        expect(smartSnippetSource).not.toBeNull();

        const smartSnippetFeedback = element.shadowRoot.querySelector(
          selectors.smartSnippetFeedback
        );
        expect(smartSnippetFeedback).not.toBeNull();
      });

      describe('when clicking on the smart snippet toggle button', () => {
        it('should call the expand method from the smartSnippet controller', async () => {
          const element = createTestComponent();
          await flushPromises();

          const smartSnippetToggleButton = element.shadowRoot.querySelector(
            selectors.smartSnippetToggleButton
          );

          await smartSnippetToggleButton.click();
          await flushPromises();

          expect(functionsMocks.buildSmartSnippet.expand).toHaveBeenCalledTimes(
            1
          );
        });
      });
    });

    describe('when the smart snippet is expanded', () => {
      beforeAll(() => {
        smartSnippetState = {...defaultSmartSnippetState, expanded: true};
      });
      it('should properly display the smart snippet component', async () => {
        const element = createTestComponent();
        await flushPromises();

        const smartSnippetAnswer = element.shadowRoot.querySelector(
          selectors.smartSnippetAnswer
        );
        expect(smartSnippetAnswer).not.toBeNull();

        const smartSnippetToggleButton = element.shadowRoot.querySelector(
          selectors.smartSnippetToggleButton
        );
        expect(smartSnippetToggleButton).not.toBeNull();
        expect(smartSnippetToggleButton.label).toBe(showLessLabel);
        expect(smartSnippetToggleButton.iconName).toBe(showLessIcon);

        const smartSnippetSource = element.shadowRoot.querySelector(
          selectors.smartSnippetSource
        );
        expect(smartSnippetSource).not.toBeNull();

        const smartSnippetFeedback = element.shadowRoot.querySelector(
          selectors.smartSnippetFeedback
        );
        expect(smartSnippetFeedback).not.toBeNull();
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

          expect(
            functionsMocks.buildSmartSnippet.collapse
          ).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
