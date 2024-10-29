/* eslint-disable no-import-assign */
import QuanticSearchBox from 'c/quanticSearchBox';
// @ts-ignore
import {createElement} from 'lwc';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

jest.mock('c/quanticHeadlessLoader');

let isInitialized = false;

const exampleEngine = {
  id: 'dummy engine',
};

const functionsMocks = {
  buildSearchBox: jest.fn(() => ({
    state: {},
    subscribe: functionsMocks.subscribe,
  })),
  loadQuerySuggestActions: jest.fn(() => {}),
  subscribe: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribe;
  }),
  unsubscribe: jest.fn(() => {}),
};

const defaultOptions = {
  engineId: exampleEngine.id,
  placeholder: null,
  withoutSubmitButton: false,
  numberOfSuggestions: 7,
  textarea: false,
  disableRecentQueries: false,
  disableClearFilters: false,
};

function createTestComponent(options = defaultOptions) {
  prepareHeadlessState();

  const element = createElement('c-quantic-search-box', {
    is: QuanticSearchBox,
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
      buildSearchBox: functionsMocks.buildSearchBox,
      loadQuerySuggestActions: functionsMocks.loadQuerySuggestActions,
    };
  };
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticSearchBox && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
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

describe('c-quantic-search-box', () => {
  beforeAll(() => {
    mockSuccessfulHeadlessInitialization();
  });

  afterEach(() => {
    cleanup();
  });

  it('construct itself without throwing', () => {
    expect(() =>
      createElement('c-quantic-search-box', {is: QuanticSearchBox})
    ).not.toThrow();
  });

  describe('controller initialization', () => {
    it('should subscribe to the headless state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.subscribe).toHaveBeenCalledTimes(1);
    });

    describe('when disableClearFilters is false (default)', () => {
      it('should properly initialize the controller with clear filters enabled', async () => {
        const expectedDefaultOptions = {
          clearFilters: true,
          numberOfSuggestions: 7,
          highlightOptions: {
            notMatchDelimiters: {
              open: '<b>',
              close: '</b>',
            },
          },
        };
        const element = createTestComponent();
        await flushPromises();

        expect(element.disableClearFilters).toBe(false);
        expect(functionsMocks.buildSearchBox).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildSearchBox).toHaveBeenCalledWith(
          exampleEngine,
          {options: expectedDefaultOptions}
        );
      });
    });

    describe('when disableClearFilters is true', () => {
      it('should properly initialize the controller with clear filters disabled', async () => {
        const expectedDefaultOptions = {
          clearFilters: false,
          numberOfSuggestions: 7,
          highlightOptions: {
            notMatchDelimiters: {
              open: '<b>',
              close: '</b>',
            },
          },
        };
        const element = createTestComponent({
          ...defaultOptions,
          disableClearFilters: true,
        });
        await flushPromises();

        expect(element.disableClearFilters).toBe(true);
        expect(functionsMocks.buildSearchBox).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildSearchBox).toHaveBeenCalledWith(
          exampleEngine,
          {options: expectedDefaultOptions}
        );
      });
    });
  });
});
