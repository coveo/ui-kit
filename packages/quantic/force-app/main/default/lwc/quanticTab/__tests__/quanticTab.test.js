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
  name: 'Example tab name',
  engineId: exampleEngine.id,
  label: 'Example Tab',
  expression: 'exampleExpression',
  isActive: false,
};

const selectors = {
  initializationError: 'c-quantic-component-error',
  tabButton: 'button',
};

const defaultSearchStatusState = {
  hasResults: true,
  firstSearchExecuted: true,
};
let searchStatusState = defaultSearchStatusState;

const defaultTabState = {
  isActive: false,
};
let tabState = defaultTabState;

const functionsMocks = {
  buildTab: jest.fn(() => ({
    state: tabState,
    subscribe: functionsMocks.tabStateSubscriber,
    select: functionsMocks.select,
  })),
  buildSearchStatus: jest.fn(() => ({
    state: searchStatusState,
    subscribe: functionsMocks.searchStatusStateSubscriber,
  })),
  tabStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.tabStateUnsubscriber;
  }),
  searchStatusStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.searchStatusStateUnsubscriber;
  }),
  tabStateUnsubscriber: jest.fn(),
  searchStatusStateUnsubscriber: jest.fn(),
  exampleTabRendered: jest.fn(),
  select: jest.fn(),
};

const expectedActiveTabClass = 'slds-is-active';

function createTestComponent(options = defaultOptions) {
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
    prepareHeadlessState();
  });

  afterEach(() => {
    tabState = defaultTabState;
    searchStatusState = defaultSearchStatusState;
    cleanup();
  });

  describe('component initialization', () => {
    it('should build the tab and search status controllers with the proper parameters', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildTab).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildTab).toHaveBeenCalledWith(exampleEngine, {
        options: {
          expression: defaultOptions.expression,
          id: defaultOptions.name,
          clearFiltersOnTabChange: false,
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

    describe('the clearFiltersOnTabChange property', () => {
      it('should pass the clearFiltersOnTabChange option to the tab controller when set to true', async () => {
        const optionsWithClearFilters = {
          ...defaultOptions,
          clearFiltersOnTabChange: true,
        };
        createTestComponent(optionsWithClearFilters);
        await flushPromises();

        expect(functionsMocks.buildTab).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildTab).toHaveBeenCalledWith(exampleEngine, {
          options: {
            expression: optionsWithClearFilters.expression,
            id: optionsWithClearFilters.name,
            clearFiltersOnTabChange: true,
          },
          initialState: {
            isActive: optionsWithClearFilters.isActive,
          },
        });
      });

      it(`should pass the clearFiltersOnTabChange option as a boolean to the tab controller when a "true" string is provided`, async () => {
        const optionsWithClearFilters = {
          ...defaultOptions,
          clearFiltersOnTabChange: 'true',
        };
        createTestComponent(optionsWithClearFilters);
        await flushPromises();

        expect(functionsMocks.buildTab).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildTab).toHaveBeenCalledWith(exampleEngine, {
          options: {
            expression: optionsWithClearFilters.expression,
            id: optionsWithClearFilters.name,
            clearFiltersOnTabChange: true,
          },
          initialState: {
            isActive: optionsWithClearFilters.isActive,
          },
        });
      });
    });

    it('should subscribe to the headless tab and search status state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.tabStateSubscriber).toHaveBeenCalledTimes(1);
      expect(functionsMocks.searchStatusStateSubscriber).toHaveBeenCalledTimes(
        1
      );
    });

    it('should dispatch the quantic__tabrendered event', async () => {
      const element = createTestComponent();
      setupEventListeners(element);
      await flushPromises();

      expect(functionsMocks.exampleTabRendered).toHaveBeenCalledTimes(1);
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
    describe('when the initial search is not yet executed', () => {
      beforeAll(() => {
        searchStatusState = {...searchStatusState, firstSearchExecuted: false};
      });

      it('should not show the tab before the initial search completes', async () => {
        const element = createTestComponent();
        await flushPromises();

        const tab = element.shadowRoot.querySelector(selectors.tabButton);

        expect(tab).toBeNull();
      });
    });

    describe('when the initial search is executed', () => {
      beforeAll(() => {
        searchStatusState = {...searchStatusState, firstSearchExecuted: true};
      });

      it('should show the tab after the initial search completes', async () => {
        const element = createTestComponent();
        await flushPromises();

        const tab = element.shadowRoot.querySelector(selectors.tabButton);

        expect(tab).not.toBeNull();
        expect(tab.textContent).toBe(defaultOptions.label);
        expect(tab.title).toEqual(defaultOptions.label);
        expect(tab.getAttribute('aria-pressed')).toBe('false');
        expect(tab.getAttribute('aria-label')).toBe(defaultOptions.label);
      });
    });
  });

  describe('when the tab is not active', () => {
    beforeAll(() => {
      tabState = {...tabState, isActive: false};
    });

    it('should not display the tab as an active tab', async () => {
      const element = createTestComponent();
      await flushPromises();

      const tab = element.shadowRoot.querySelector(selectors.tabButton);
      expect(tab).not.toBeNull();

      expect(tab.classList).not.toContain(expectedActiveTabClass);
      expect(element.isActive).toBe(false);
    });
  });

  describe('when the tab is active', () => {
    beforeAll(() => {
      tabState = {...tabState, isActive: true};
    });

    it('should display the tab as an active tab', async () => {
      const element = createTestComponent();
      await flushPromises();

      const tab = element.shadowRoot.querySelector(selectors.tabButton);

      expect(tab.classList).toContain(expectedActiveTabClass);
      expect(element.isActive).toBe(true);
    });
  });

  describe('when the tab is clicked or the select method is called', () => {
    it('should call the select method of the tab controller', async () => {
      const element = createTestComponent();
      await flushPromises();

      const tab = element.shadowRoot.querySelector(selectors.tabButton);
      expect(tab).not.toBeNull();

      await tab.click();
      await flushPromises();

      expect(functionsMocks.select).toHaveBeenCalledTimes(1);

      await element.select();
      await flushPromises();

      expect(functionsMocks.select).toHaveBeenCalledTimes(2);
    });
  });
});
