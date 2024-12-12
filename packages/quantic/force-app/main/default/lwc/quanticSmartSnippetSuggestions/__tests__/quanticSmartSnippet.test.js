/* eslint-disable jest/no-conditional-expect */
/* eslint-disable no-import-assign */
import QuanticSmartSnippetSuggestions from '../quanticSmartSnippetSuggestions';
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

const selectors = {
  initializationError: 'c-initialization-error',
};

const functionsMocks = {
  buildSmartSnippetQuestionsList: jest.fn(() => ({
    state: {}, // Todo: add state
    subscribe: functionsMocks.subscribe,
    select: jest.fn(),
  })),
  subscribe: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribe;
  }),
  unsubscribe: jest.fn(() => {}),
};

function createTestComponent(options = defaultOptions) {
  prepareHeadlessState();

  const element = createElement('c-quantic-smart-snippet-suggestions', {
    is: QuanticSmartSnippetSuggestions,
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
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
  });

  afterEach(() => {
    cleanup();
  });

  // describe('controller initialization', () => {
  //   it('should build the smart snippet and searchStatus controllers with proper parameters', async () => {
  //     createTestComponent();
  //     await flushPromises();

  //     expect(functionsMocks.buildSmartSnippet).toHaveBeenCalledTimes(1);
  //     expect(functionsMocks.buildSmartSnippet).toHaveBeenCalledWith(exampleEngine.id);
  //     expect(functionsMocks.buildSearchStatus).toHaveBeenCalledTimes(1);
  //     expect(functionsMocks.buildSearchStatus).toHaveBeenCalledWith(exampleEngine.id);
  //   });

  //   it('should subscribe to the headless state changes', async () => {
  //     createTestComponent();
  //     await flushPromises();

  //     expect(functionsMocks.subscribe).toHaveBeenCalledTimes(1);
  //   });
  // });

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
});
