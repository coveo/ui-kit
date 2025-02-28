/* eslint-disable no-import-assign */
import QuanticFacetManager from '../quanticFacetManager';
// @ts-ignore
import {createElement} from 'lwc';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

jest.mock('c/quanticHeadlessLoader');

let isInitialized = false;

const exampleEngine = {
  id: 'exampleEngineId',
};

const defaultSearchStatusState = {
  hasResults: true,
  firstSearchExecuted: true,
};

let searchStatusState = defaultSearchStatusState;

const defaultOptions = {
  engineId: exampleEngine.id,
};

const selectors = {
  initializationError: 'c-quantic-component-error',
  facetManagerHost: '.facet-manager__host',
};

const functionsMocks = {
  buildFacetManager: jest.fn(() => ({
    state: {},
    subscribe: functionsMocks.facetManagerStateSubscriber,
  })),
  buildSearchStatus: jest.fn(() => ({
    state: searchStatusState,
    subscribe: functionsMocks.searchStatusStateSubscriber,
  })),
  facetManagerStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.facetManagerStateUnsubscriber;
  }),
  searchStatusStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.searchStatusStateUnsubscriber;
  }),
  facetManagerStateUnsubscriber: jest.fn(),
  searchStatusStateUnsubscriber: jest.fn(),
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-facet-manager', {
    is: QuanticFacetManager,
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
      buildFacetManager: functionsMocks.buildFacetManager,
      buildSearchStatus: functionsMocks.buildSearchStatus,
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticFacetManager && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticFacetManager) {
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

describe('c-quantic-facet-manager', () => {
  afterEach(() => {
    cleanup();
  });

  describe('controller initialization', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should build the facet manager controller with the proper parameters and subscribe to its state', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildFacetManager).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildFacetManager).toHaveBeenCalledWith(
        exampleEngine
      );
      expect(functionsMocks.facetManagerStateSubscriber).toHaveBeenCalledTimes(
        1
      );
    });

    it('should build the search status controller with the proper parameters and subscribe to its state', async () => {
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

  describe('when the component is initialized', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should properly render the facet manager component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const facetManager = element.shadowRoot.querySelector(
        selectors.facetManagerHost
      );

      expect(facetManager).not.toBeNull();
    });
  });
});
