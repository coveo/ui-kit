/* eslint-disable @lwc/lwc/no-unexpected-wire-adapter-usages */
/* eslint-disable no-import-assign */
// @ts-ignore
import QuanticStandaloneSearchBox from 'c/quanticStandaloneSearchBox';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {CurrentPageReference} from 'lightning/navigation';
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';
import {STANDALONE_SEARCH_BOX_STORAGE_KEY} from 'c/quanticUtils';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';

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

// @ts-ignore
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
const mockStandaloneSearchBox = {
  state: stateMock,
  subscribe: jest.fn((cb) => {
    updateState = cb;
    cb();
    // eslint-disable-next-line no-use-before-define
    return functionsMocks.unsubscribe;
  }),
  updateText: jest.fn(),
  submit: jest.fn(),
  showSuggestions: jest.fn(),
  selectSuggestion: jest.fn(),
};

const functionsMocks = {
  buildStandaloneSearchBox: jest.fn(() => mockStandaloneSearchBox),
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

const createTestComponent = buildCreateTestComponent(
  QuanticStandaloneSearchBox,
  'c-quantic-standalone-search-box',
  defaultOptions
);

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticStandaloneSearchBox && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

describe('c-quantic-standalone-search-box', () => {
  beforeEach(() => {
    // @ts-ignore
    getHeadlessConfiguration.mockResolvedValue(defaultHeadlessConfiguration);
    mockSuccessfulHeadlessInitialization();

    // @ts-ignore
    global.CoveoHeadless = {
      buildStandaloneSearchBox: functionsMocks.buildStandaloneSearchBox,
    };
  });

  afterEach(() => {
    cleanup();
    isInitialized = false;
  });

  describe('with default options', () => {
    it('should properly pass the options to the the quantic-search-box-input component', async () => {
      const element = createTestComponent();
      await flushPromises();

      expect(element).not.toBeNull();

      const quanticSearchInterface = element.shadowRoot.querySelector(
        selectors.searchInterface
      );
      expect(quanticSearchInterface).not.toBeNull();

      const input = quanticSearchInterface.querySelector(
        selectors.searchBoxInput
      );
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
    it('should properly render the quantic standalone search box component', async () => {
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
    it('should render the standalone searchbox component with suggestions', async () => {
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

      expect(mockStandaloneSearchBox.subscribe).toHaveBeenCalledTimes(1);
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

      it('should display the searchbox as a non-standalone component', async () => {
        const element = createTestComponent();

        // @ts-ignore
        CurrentPageReference.emit({url: nonStandaloneURL});
        await flushPromises();

        const searchBox = element.shadowRoot.querySelector(selectors.searchBox);
        expect(searchBox).not.toBeNull();
        const quanticSearchInterface = element.shadowRoot.querySelector(
          selectors.searchInterface
        );
        expect(quanticSearchInterface).toBeNull();
      });

      it('should properly pass the keepFiltersOnSearch property to the quanticSearchBox', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          keepFiltersOnSearch: false,
        });

        // @ts-ignore
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

  describe('event handling', () => {
    describe('quantic__inputvaluechange event', () => {
      it('should call updateText when input value changes', async () => {
        const element = createTestComponent();
        await flushPromises();

        const newValue = 'test query';
        const event = new CustomEvent('quantic__inputvaluechange', {
          detail: {value: newValue},
        });
        const eventSpy = jest.spyOn(event, 'stopPropagation');

        element.dispatchEvent(event);
        expect(mockStandaloneSearchBox.updateText).toHaveBeenCalledWith(
          newValue
        );
        expect(eventSpy).toHaveBeenCalled();
      });

      it('should not call updateText when value is the same', async () => {
        const currentValue = 'current query';
        mockStandaloneSearchBox.state.value = currentValue;

        const element = createTestComponent();
        await flushPromises();

        const event = new CustomEvent('quantic__inputvaluechange', {
          detail: {value: currentValue},
        });

        element.dispatchEvent(event);

        expect(mockStandaloneSearchBox.updateText).not.toHaveBeenCalled();
      });
    });

    describe('quantic__submitsearch event', () => {
      it('should call submit', async () => {
        const element = createTestComponent();
        await flushPromises();

        const event = new CustomEvent('quantic__submitsearch');
        const eventSpy = jest.spyOn(event, 'stopPropagation');
        element.dispatchEvent(event);

        expect(mockStandaloneSearchBox.submit).toHaveBeenCalledTimes(1);
        expect(eventSpy).toHaveBeenCalled();
      });
    });

    describe('quantic__showsuggestions event', () => {
      it('should call showSuggestions when suggestions should be shown', async () => {
        const element = createTestComponent();
        await flushPromises();

        const event = new CustomEvent('quantic__showsuggestions');
        const eventSpy = jest.spyOn(event, 'stopPropagation');
        element.dispatchEvent(event);

        expect(mockStandaloneSearchBox.showSuggestions).toHaveBeenCalledTimes(
          1
        );
        expect(eventSpy).toHaveBeenCalled();
      });
    });

    describe('quantic__selectsuggestion event', () => {
      it('should call selectSuggestion with the correct value', async () => {
        const element = createTestComponent();
        await flushPromises();

        const selectedSuggestion = {value: 'selected suggestion'};
        const event = new CustomEvent('quantic__selectsuggestion', {
          detail: {selectedSuggestion},
        });
        const eventSpy = jest.spyOn(event, 'stopPropagation');
        element.dispatchEvent(event);

        expect(mockStandaloneSearchBox.selectSuggestion).toHaveBeenCalledWith(
          selectedSuggestion.value
        );
        expect(eventSpy).toHaveBeenCalled();
      });
    });
  });
});
