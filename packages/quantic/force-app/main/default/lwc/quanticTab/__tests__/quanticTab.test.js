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
  isActive: false,
};

const selectors = {
  initializationError: 'c-quantic-component-error',
  tabButton: 'button',
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
    select: functionsMocks.select,
  })),
  buildSearchStatus: jest.fn(() => mockSearchStatus),
  subscribe: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribe;
  }),
  unsubscribe: jest.fn(() => {}),
  unsubscribeSearchStatus: jest.fn(() => {}),
  exampleTabRendered: jest.fn(),
  select: jest.fn(),
};

const expectedActiveTabClass = 'slds-is-active';

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

function simulateSearchStatusUpdate(
  hasResults = true,
  firstSearchExecuted = true
) {
  mockSearchStatus.state.hasResults = hasResults;
  mockSearchStatus.state.firstSearchExecuted = firstSearchExecuted;
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

function setupEventListeners(element) {
  element.addEventListener(
    'quantic__tabrendered',
    functionsMocks.exampleTabRendered
  );
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
    it('should build the tab and search status controllers with the proper parameters', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildTab).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildTab).toHaveBeenCalledWith(exampleEngine, {
        options: {
          expression: defaultOptions.expression,
          id: defaultOptions.label,
        },
        initialState: {
          isActive: defaultOptions.isActive,
        },
      });
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledWith(
        exampleEngine
      );
    });

    it('should subscribe to the headless tab and search status state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.subscribe).toHaveBeenCalledTimes(1);
      expect(mockSearchStatus.subscribe).toHaveBeenCalledTimes(1);
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

  describe('component behavior during the initial search', () => {
    it('should not show the tab before the initial search completes', async () => {
      const element = createTestComponent();
      simulateSearchStatusUpdate(true, false);
      await flushPromises();

      const tab = element.shadowRoot.querySelector(selectors.tabButton);

      expect(tab).toBeNull();
    });

    it('should show the tab after the initial search completes', async () => {
      mockBuildTabState.isActive = true;
      const element = createTestComponent();
      simulateSearchStatusUpdate();
      await flushPromises();

      const tab = element.shadowRoot.querySelector(selectors.tabButton);

      expect(tab).not.toBeNull();
      expect(tab.textContent).toBe(defaultOptions.label);
      expect(tab.title).toEqual(defaultOptions.label);
      expect(tab.getAttribute('aria-pressed')).toBe('true');
      expect(tab.getAttribute('aria-label')).toBe(defaultOptions.label);
    });
  });

  describe('when the component is rendering', () => {
    it('should dispatch the quantic__tabrendered event', async () => {
      const element = createTestComponent();
      setupEventListeners(element);
      await flushPromises();

      expect(functionsMocks.exampleTabRendered).toHaveBeenCalledTimes(1);
      const tabrenderedEvent =
        functionsMocks.exampleTabRendered.mock.calls[0][0];
      expect(tabrenderedEvent.bubbles).toEqual(true);
    });
  });

  describe('when the tab is not active', () => {
    it('should render the tab without the active class', async () => {
      mockBuildTabState.isActive = false;
      const element = createTestComponent();
      await flushPromises();

      const tab = element.shadowRoot.querySelector(selectors.tabButton);

      expect(tab.classList).not.toContain(expectedActiveTabClass);
      expect(element.isActive).toBe(false);
    });
  });

  describe('when the tab is active', () => {
    it('should render the tab with the active class', async () => {
      mockBuildTabState.isActive = true;
      const element = createTestComponent();
      await flushPromises();

      const tab = element.shadowRoot.querySelector(selectors.tabButton);
      tab.click();
      await flushPromises();

      expect(tab.classList).toContain(expectedActiveTabClass);
      expect(element.isActive).toBe(true);
    });
  });

  describe('when the tab is clicked', () => {
    it('should trigger the select method', async () => {
      const element = createTestComponent();
      await flushPromises();

      const tab = element.shadowRoot.querySelector(selectors.tabButton);
      expect(tab).not.toBeNull();

      await tab.click();
      await flushPromises();

      expect(functionsMocks.select).toHaveBeenCalled();
    });
  });
});
