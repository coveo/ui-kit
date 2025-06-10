/* eslint-disable no-import-assign */
import QuanticStandaloneSearchBox from 'c/quanticStandaloneSearchBox';
// @ts-ignore
import {createElement} from 'lwc';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {CurrentPageReference} from 'lightning/navigation';
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';
import {STANDALONE_SEARCH_BOX_STORAGE_KEY} from 'c/quanticUtils';

const selectors = {
  searchBoxInput: 'c-quantic-search-box-input',
  searchBox: 'c-quantic-search-box',
  searchInterface: 'c-quantic-search-interface',
};

const nonStandaloneURL = 'https://www.example.com/global-search/%40uri';
const defaultHeadlessConfiguration = JSON.stringify({
  organization: 'testOrgId',
  accessToken: 'testAccessToken',
});

jest.mock('c/quanticHeadlessLoader');

jest.mock(
  '@salesforce/apex/HeadlessController.getHeadlessConfiguration',
  () => ({
    default: jest.fn(),
  }),
  {virtual: true}
);

mockHeadlessLoader.loadDependencies = () =>
  new Promise((resolve) => {
    resolve();
  });

let isInitialized = false;

const exampleEngine = {
  id: 'engineId',
};

let updateState;
let stateMock = {};
const functionsMocks = {
  buildStandaloneSearchBox: jest.fn(() => ({
    state: stateMock,
    subscribe: functionsMocks.subscribe,
  })),
  subscribe: jest.fn((cb) => {
    updateState = cb;
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
  keepFiltersOnSearch: false,
  redirectUrl: '/global-search/%40uri',
};

function createTestComponent(options = defaultOptions) {
  prepareHeadlessState();
  const element = createElement('c-quantic-standalone-search-box', {
    is: QuanticStandaloneSearchBox,
  });
  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }
  document.body.appendChild(element);
  return element;
}

function prepareHeadlessState() {
  // @ts-ignore
  global.CoveoHeadless = {
    buildStandaloneSearchBox: functionsMocks.buildStandaloneSearchBox,
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
    if (element instanceof QuanticStandaloneSearchBox && !isInitialized) {
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

describe('c-quantic-standalone-search-box', () => {
  beforeEach(() => {
    getHeadlessConfiguration.mockResolvedValue(defaultHeadlessConfiguration);
    mockSuccessfulHeadlessInitialization();
  });

  afterEach(() => {
    cleanup();
  });
  describe('with default options', () => {
    it('should create the component', async () => {
      const element = createTestComponent();
      await flushPromises();

      expect(element).not.toBeNull();

      const interfaceElem = element.shadowRoot.querySelector(
        selectors.searchInterface
      );
      expect(interfaceElem).not.toBeNull();

      const input = interfaceElem.querySelector(selectors.searchBoxInput);
      expect(input).not.toBeNull();
      expect(input.withoutSubmitButton).toBe(false);
      expect(input.textarea).toBe(false);
      expect(input.placeholder).toBe(null);
      expect(input.inputValue).toBe('');
      expect(input.recentQueries).toBeUndefined();
      expect(input.maxNumberOfSuggestions).toBe(7);
    });
  });

  describe('with custom options', () => {
    it('should create the component with custom options', async () => {
      const element = createTestComponent({
        engineId: exampleEngine.id,
        placeholder: 'place',
        withoutSubmitButton: true,
        numberOfSuggestions: 10,
        keepFiltersOnSearch: true,
        redirectUrl: '/custom-search/%40uri',
        searchHub: 'customHub',
        pipeline: 'customPipeline',
        textarea: true,
        disableRecentQueries: true,
      });
      await flushPromises();
      expect(element).not.toBeNull();

      const input = element.shadowRoot.querySelector(selectors.searchBoxInput);
      expect(input).not.toBeNull();
      expect(input.withoutSubmitButton).toBe(true);
      expect(input.textarea).toBe(true);
      expect(input.placeholder).toBe('place');
      expect(input.inputValue).toBe('');
      expect(input.recentQueries).toBeUndefined();
      expect(input.maxNumberOfSuggestions).toBe(7);
    });
  });

  describe('with suggestions', () => {
    it('should create the component with suggestions', async () => {
      const element = createTestComponent();
      await flushPromises();

      stateMock.suggestions = [
        {
          rawValue: 'suggestion1',
          highlightedValue: 'suggestion1',
        },
        {
          rawValue: 'suggestion2',
          highlightedValue: 'suggestion2',
        },
      ];
      updateState();
      await flushPromises();

      const input = element.shadowRoot.querySelector(selectors.searchBoxInput);
      expect(input.suggestions).toStrictEqual([
        {
          key: 0,
          rawValue: 'suggestion1',
          value: 'suggestion1',
        },
        {
          key: 1,
          rawValue: 'suggestion2',
          value: 'suggestion2',
        },
      ]);
    });
  });

  describe('with redirect', () => {
    it('should redirect to the search page when a redirect is triggered', async () => {
      createTestComponent();
      await flushPromises();

      stateMock.redirectTo = true;
      stateMock.value = 'search term';
      stateMock.analytics = 'analytics babyyyy';
      updateState();
      await flushPromises();

      expect(localStorage.getItem(STANDALONE_SEARCH_BOX_STORAGE_KEY)).toBe(
        JSON.stringify({value: 'search term', analytics: 'analytics babyyyy'})
      );
    });
  });

  describe('controller initialization', () => {
    it('should subscribe to the headless state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.subscribe).toHaveBeenCalledTimes(1);
    });

    describe('when the current page reference changes', () => {
      beforeAll(() => {
        // This is needed to mock the window.location.href property to test the keepFiltersOnSearch property in the quanticSearchBox.
        // https://stackoverflow.com/questions/54021037/how-to-mock-window-location-href-with-jest-vuejs
        Object.defineProperty(window, 'location', {
          writable: true,
          value: {href: nonStandaloneURL},
        });
      });

      it('should display the searchbox as a connected component', async () => {
        const element = createTestComponent();

        // eslint-disable-next-line @lwc/lwc/no-unexpected-wire-adapter-usages
        CurrentPageReference.emit({url: nonStandaloneURL});
        await flushPromises();

        const searchBox = element.shadowRoot.querySelector(selectors.searchBox);
        expect(searchBox).not.toBeNull();
        const interfaceElem = element.shadowRoot.querySelector(
          selectors.searchInterface
        );
        expect(interfaceElem).toBeNull();
      });

      it('should properly pass the keepFiltersOnSearch property to the quanticSearchBox', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          keepFiltersOnSearch: false,
        });
        // eslint-disable-next-line @lwc/lwc/no-unexpected-wire-adapter-usages
        CurrentPageReference.emit({url: nonStandaloneURL});
        await flushPromises();

        const searchBox = element.shadowRoot.querySelector(selectors.searchBox);

        expect(searchBox).not.toBeNull();
        expect(searchBox.keepFiltersOnSearch).toEqual(false);
      });
    });

    describe('when keepFiltersOnSearch is false (default)', () => {
      it('should properly initialize the controller with clear filters enabled', async () => {
        createTestComponent();
        await flushPromises();

        expect(functionsMocks.buildStandaloneSearchBox).toHaveBeenCalledTimes(
          1
        );
        expect(functionsMocks.buildStandaloneSearchBox).toHaveBeenCalledWith(
          exampleEngine,
          expect.objectContaining({
            options: expect.objectContaining({clearFilters: true}),
          })
        );
      });
    });

    describe('when keepFiltersOnSearch is true', () => {
      it('should properly initialize the controller with clear filters disabled', async () => {
        createTestComponent({
          ...defaultOptions,
          keepFiltersOnSearch: true,
        });
        await flushPromises();

        expect(functionsMocks.buildStandaloneSearchBox).toHaveBeenCalledTimes(
          1
        );
        expect(functionsMocks.buildStandaloneSearchBox).toHaveBeenCalledWith(
          exampleEngine,
          expect.objectContaining({
            options: expect.objectContaining({clearFilters: false}),
          })
        );
      });
    });
  });
});
