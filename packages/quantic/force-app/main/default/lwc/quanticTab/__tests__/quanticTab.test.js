/* eslint-disable jest/no-conditional-expect */
/* eslint-disable no-import-assign */
import QuanticTab from '../quanticTab';
// @ts-ignore
import {createElement} from 'lwc';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';

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

const createTestComponent = buildCreateTestComponent(
  QuanticTab,
  'c-quantic-tab',
  defaultOptions
);

/**
 * Creates the test component with the `quantic__tabrendered` listener already attached
 * before the element is inserted into the DOM, so that even the very first render's
 * dispatch (which may happen synchronously during insertion) is captured.
 * @param {object} options
 * @returns {Element}
 */
function createTestComponentWithEventListeners(options = defaultOptions) {
  const element = createElement('c-quantic-tab', {
    is: QuanticTab,
  });
  const optionsToApply = Object.assign({}, defaultOptions, options);
  for (const [key, value] of Object.entries(optionsToApply)) {
    element[key] = value;
  }
  setupEventListeners(element);
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

describe('c-quantic-tab', () => {
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
    prepareHeadlessState();
  });

  afterEach(() => {
    tabState = {...defaultTabState};
    searchStatusState = {...defaultSearchStatusState};
    cleanup();
    isInitialized = false;
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
      createTestComponentWithEventListeners();
      await flushPromises();

      expect(functionsMocks.exampleTabRendered).toHaveBeenCalledTimes(1);
    });
  });

  describe('the quantic__tabrendered dispatch gating', () => {
    it('should dispatch the quantic__tabrendered event only once when re-rendered with no layout-relevant change', async () => {
      createTestComponentWithEventListeners();
      await flushPromises();

      expect(functionsMocks.exampleTabRendered).toHaveBeenCalledTimes(1);

      // Simulate additional headless state notifications with no actual change to
      // shouldDisplay/isActive/label by invoking the subscriber callback again.
      functionsMocks.tabStateSubscriber.mock.calls[0][0]();
      await flushPromises();
      functionsMocks.tabStateSubscriber.mock.calls[0][0]();
      await flushPromises();

      expect(functionsMocks.exampleTabRendered).toHaveBeenCalledTimes(1);
    });

    it('should dispatch the quantic__tabrendered event again when isActive changes', async () => {
      createTestComponentWithEventListeners();
      await flushPromises();

      expect(functionsMocks.exampleTabRendered).toHaveBeenCalledTimes(1);

      tabState.isActive = true;
      functionsMocks.tabStateSubscriber.mock.calls[0][0]();
      await flushPromises();

      expect(functionsMocks.exampleTabRendered).toHaveBeenCalledTimes(2);
    });

    it('should dispatch the quantic__tabrendered event again when shouldDisplay changes', async () => {
      searchStatusState = {...searchStatusState, firstSearchExecuted: false};
      createTestComponentWithEventListeners();
      await flushPromises();

      expect(functionsMocks.exampleTabRendered).toHaveBeenCalledTimes(1);

      searchStatusState.firstSearchExecuted = true;
      functionsMocks.searchStatusStateSubscriber.mock.calls[0][0]();
      await flushPromises();

      expect(functionsMocks.exampleTabRendered).toHaveBeenCalledTimes(2);
    });

    it('should dispatch the quantic__tabrendered event again when label changes', async () => {
      const element = createTestComponentWithEventListeners();
      await flushPromises();

      expect(functionsMocks.exampleTabRendered).toHaveBeenCalledTimes(1);

      element.label = 'A different label';
      await flushPromises();

      expect(functionsMocks.exampleTabRendered).toHaveBeenCalledTimes(2);
    });

    it('should still attempt headless initialization on every render even when the dispatch is skipped', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildTab).toHaveBeenCalledTimes(1);

      // Simulate an additional no-op re-render.
      functionsMocks.tabStateSubscriber.mock.calls[0][0]();
      await flushPromises();

      // The tab is already initialized so buildTab is not called again, but this confirms
      // no error occurs when initializeWithHeadless runs again after a skipped dispatch.
      expect(functionsMocks.buildTab).toHaveBeenCalledTimes(1);
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
