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

const selectors = {
  initializationError: 'c-quantic-component-error',
};

const defaultSearchStatusState = {
  hasResults: true,
  firstSearchExecuted: true,
};

let searchStatusState = defaultSearchStatusState;

const defaultSmartSnippetState = {
  isActive: false,
};
let smartSnippetState = defaultSmartSnippetState;

const functionsMocks = {
  buildSmartSnippet: jest.fn(() => ({
    state: smartSnippetState,
    subscribe: functionsMocks.smartSnippetStateSubscriber,
    select: jest.fn(),
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
});
