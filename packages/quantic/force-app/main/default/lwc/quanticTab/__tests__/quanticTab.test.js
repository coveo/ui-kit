/* eslint-disable jest/no-conditional-expect */
/* eslint-disable no-import-assign */
import QuanticTab from '../quanticTab';
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
  label: 'Example Tab',
  expression: 'exampleExpression',
  isActive: true,
};

const selectors = {
  initializationError: 'c-quantic-component-error',
};

const mockSearchStatusState = {
  hasResults: true,
};

const mockBuildTabState = {
  isActive: false,
};

const mockSearchStatus = {
  state: mockSearchStatusState,
  subscribe: jest.fn((callback) => {
    mockSearchStatus.callback = callback;
    return jest.fn();
  }),
};

const functionsMocks = {
  buildTab: jest.fn(() => ({
    state: mockBuildTabState,
    subscribe: functionsMocks.subscribe,
    select: jest.fn(),
  })),
  buildSearchStatus: jest.fn(() => mockSearchStatus),
  subscribe: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribe;
  }),
  unsubscribe: jest.fn(() => {}),
  unsubscribeSearchStatus: jest.fn(() => {}),
};

function createTestComponent(options = defaultOptions) {
  prepareHeadlessState();

  const element = createElement('c-quantic-tab', {
    is: QuanticTab,
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
      buildTab: functionsMocks.buildTab,
      buildSearchStatus: functionsMocks.buildSearchStatus,
    };
  };
}

function simulateSearchStatusUpdate() {
  mockSearchStatus.state.hasResults = true;
  mockSearchStatus.state.firstSearchExecuted = true;
  mockSearchStatus.callback();
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticTab && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticTab) {
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

describe('c-quantic-tab', () => {
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
  });

  afterEach(() => {
    cleanup();
  });

  describe('controller initialization', () => {
    it('should subscribe to the headless state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.subscribe).toHaveBeenCalledTimes(1);
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

  describe('when the tab is not active', () => {
    it('should render the tab without the active class', async () => {
      const expectedActiveTabClass = 'slds-is-active';
      const element = createTestComponent();
      simulateSearchStatusUpdate();
      await flushPromises();

      const tab = element.shadowRoot.querySelector('button');
      tab.click();
      await flushPromises();

      expect(tab.classList).not.toContain(expectedActiveTabClass);
    });
  });

  describe('when the tab is active', () => {
    it('should render the tab with the active class', async () => {
      const expectedActiveTabClass = 'slds-is-active';
      functionsMocks.buildTab.mockImplementation(() => ({
        state: {
          isActive: true,
        },
        subscribe: functionsMocks.subscribe,
        select: jest.fn(),
      }));
      const element = createTestComponent();
      simulateSearchStatusUpdate();
      await flushPromises();

      const tab = element.shadowRoot.querySelector('button');
      tab.click();
      await flushPromises();

      expect(tab.classList).toContain(expectedActiveTabClass);
    });
  });
});
