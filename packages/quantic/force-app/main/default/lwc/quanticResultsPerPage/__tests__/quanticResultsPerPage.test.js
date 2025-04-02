/* eslint-disable no-import-assign */
import QuanticResultsPerPage from 'c/quanticResultsPerPage';
import {createElement} from 'lwc';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

const initialResultsPerPageState = {numberOfResults: 10};
let resultsPerPageState = initialResultsPerPageState;

const initialSearchStatusState = {hasResults: true};
let searchStatusState = initialSearchStatusState;

const initialStoreState = {};
let storeState = initialStoreState;

const functionsMocks = {
  buildResultsPerPage: jest.fn(() => ({
    state: resultsPerPageState,
    subscribe: functionsMocks.resultsPerPageStateSubscriber,
    set: functionsMocks.set,
  })),
  resultsPerPageStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.resultsPerPageStateUnsubscriber;
  }),
  resultsPerPageStateUnsubscriber: jest.fn(),
  buildSearchStatus: jest.fn(() => ({
    state: searchStatusState,
    subscribe: functionsMocks.searchStatusStateSubscriber,
  })),
  searchStatusStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.searchStatusStateUnsubscriber;
  }),
  searchStatusStateUnsubscriber: jest.fn(),
  set: jest.fn(),
};

const selectors = {
  componentError: 'c-quantic-component-error',
  resultsPerPage: '[data-testid="results-per-page"]',
  resultsPerPageOption: 'c-quantic-number-button',
  selectedResultsPerPageOption:
    'c-quantic-number-button button.slds-button_brand',
};

const exampleEngine = {
  id: 'exampleEngine',
};
let isInitialized = false;

function createTestComponent(options = {}) {
  const element = createElement('c-quantic-results-per-page', {
    is: QuanticResultsPerPage,
  });
  Object.assign(element, options);
  document.body.appendChild(element);
  return element;
}

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildResultsPerPage: functionsMocks.buildResultsPerPage,
      buildSearchStatus: functionsMocks.buildSearchStatus,
    };
  };
}

function mockStoreState() {
  // @ts-ignore
  mockHeadlessLoader.getFromStore = () => {
    return storeState;
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
    if (element instanceof QuanticResultsPerPage && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticResultsPerPage) {
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

describe('c-quantic-results-per-page', () => {
  const defaultInitialChoice = 10;
  const defaultChoices = [10, 25, 50, 100];

  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
    prepareHeadlessState();
    mockStoreState();
  });

  afterEach(() => {
    resultsPerPageState = initialResultsPerPageState;
    storeState = initialStoreState;
    cleanup();
  });

  describe('when an initialization error occurs', () => {
    beforeEach(() => {
      mockErroneousHeadlessInitialization();
    });

    it('should display the initialization error component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const initializationError = element.shadowRoot.querySelector(
        selectors.componentError
      );
      expect(initializationError).not.toBeNull();
    });
  });

  describe('controller initialization', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should build the results per page and search status controllers and subscribe to state', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildResultsPerPage).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildResultsPerPage).toHaveBeenCalledWith(
        exampleEngine,
        {
          initialState: {
            numberOfResults: 10,
          },
        }
      );
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledWith(
        exampleEngine
      );
    });
  });

  describe('with default options', () => {
    it('should properly render with the default choice selected', async () => {
      const element = createTestComponent();
      await flushPromises();

      const resultsPerPage = element.shadowRoot.querySelector(
        selectors.resultsPerPage
      );
      expect(resultsPerPage).not.toBeNull();

      const resultsPerPageOptions = Array.from(
        element.shadowRoot.querySelectorAll(selectors.resultsPerPageOption)
      );
      expect(resultsPerPageOptions).toHaveLength(defaultChoices.length);

      resultsPerPageOptions.forEach((option, index) => {
        expect(option.number).toEqual(defaultChoices[index]);
        expect(option.selected).toBe(
          defaultChoices[index] === defaultInitialChoice
        );
      });
    });

    it('should update the state when the results per page is clicked', async () => {
      const element = createTestComponent();
      await flushPromises();

      const resultsPerPage = element.shadowRoot.querySelector(
        selectors.resultsPerPage
      );
      expect(resultsPerPage).not.toBeNull();

      const resultsPerPageOptions = Array.from(
        element.shadowRoot.querySelectorAll(selectors.resultsPerPageOption)
      );

      resultsPerPageOptions[1].dispatchEvent(
        new CustomEvent('quantic__select', {
          detail: defaultChoices[1],
        })
      );

      expect(functionsMocks.set).toHaveBeenCalledTimes(1);
      expect(functionsMocks.set).toHaveBeenCalledWith(defaultChoices[1]);
    });

    describe('the numberOfResults headless state', () => {
      const expectedValueSelected = 100;
      beforeEach(() => {
        resultsPerPageState = {
          ...resultsPerPageState,
          numberOfResults: expectedValueSelected,
        };
      });

      test('should reflect the headless state and select the right option', async () => {
        const element = createTestComponent();
        await flushPromises();

        const resultsPerPage = element.shadowRoot.querySelector(
          selectors.resultsPerPage
        );
        expect(resultsPerPage).not.toBeNull();

        const resultsPerPageOptions = Array.from(
          element.shadowRoot.querySelectorAll(selectors.resultsPerPageOption)
        );

        resultsPerPageOptions.forEach((option) => {
          expect(option.selected).toBe(expectedValueSelected === option.number);
        });
      });
    });
  });

  describe('with a custom #choicesDisplayed option', () => {
    beforeEach(() => {
      console.error = jest.fn();
    });

    it('should properly render with the choices displayed', async () => {
      const customChoices = [100, 250, 500];
      const element = createTestComponent({
        choicesDisplayed: customChoices.join(','),
      });
      await flushPromises();

      expect(functionsMocks.buildResultsPerPage).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildResultsPerPage).toHaveBeenCalledWith(
        exampleEngine,
        {
          initialState: {
            numberOfResults: customChoices[0],
          },
        }
      );

      const resultsPerPage = element.shadowRoot.querySelector(
        selectors.resultsPerPage
      );
      expect(resultsPerPage).not.toBeNull();

      const resultsPerPageOptions = Array.from(
        element.shadowRoot.querySelectorAll(selectors.resultsPerPageOption)
      );
      expect(resultsPerPageOptions).toHaveLength(customChoices.length);

      resultsPerPageOptions.forEach((option, index) => {
        expect(option.number).toEqual(customChoices[index]);
      });
    });

    it('should log an error if the choices displayed are not numbers', async () => {
      const customChoices = ['foo', 'bar', 'baz'];
      const element = createTestComponent({
        choicesDisplayed: customChoices.join(','),
      });
      await flushPromises();

      const initializationError = element.shadowRoot.querySelector(
        selectors.componentError
      );
      expect(initializationError).not.toBeNull();

      expect(console.error).toHaveBeenCalledTimes(customChoices.length);
      customChoices.forEach((choice, index) => {
        expect(console.error).toHaveBeenNthCalledWith(
          index + 1,
          `The choice value "${choice}" from the "choicesDisplayed" option must be a positive number.`
        );
      });
    });

    it('should log an error if one of the choices displayed is a negative number', async () => {
      const expectedBadChoice = -5;
      const customChoices = [expectedBadChoice, '10', '20'];
      const element = createTestComponent({
        choicesDisplayed: customChoices.join(','),
      });
      await flushPromises();

      const initializationError = element.shadowRoot.querySelector(
        selectors.componentError
      );
      expect(initializationError).not.toBeNull();

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        `The choice value "${expectedBadChoice}" from the "choicesDisplayed" option must be a positive number.`
      );
    });
  });

  describe('with a custom #initialChoice option', () => {
    const customInitialChoiceIndex = 2;
    const customInitialChoice = defaultChoices[customInitialChoiceIndex];

    beforeEach(() => {
      console.warn = jest.fn();
      console.error = jest.fn();
      resultsPerPageState = {
        ...resultsPerPageState,
        numberOfResults: customInitialChoice,
      };
    });

    it('should properly render with the initial choice selected', async () => {
      const element = createTestComponent({
        initialChoice: customInitialChoice,
      });
      await flushPromises();

      expect(functionsMocks.buildResultsPerPage).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildResultsPerPage).toHaveBeenCalledWith(
        exampleEngine,
        {
          initialState: {
            numberOfResults: customInitialChoice,
          },
        }
      );

      const resultsPerPageOptions = Array.from(
        element.shadowRoot.querySelectorAll(selectors.resultsPerPageOption)
      );
      expect(resultsPerPageOptions).toHaveLength(defaultChoices.length);

      resultsPerPageOptions.forEach((option, index) => {
        expect(option.selected).toBe(index === customInitialChoiceIndex);
      });
    });
    it('should log a console warning if the initial choice is not included in the choices displayed but not prevent component initiatlization', async () => {
      const customInvalidInitialChoice = 123;
      const element = createTestComponent({
        initialChoice: customInvalidInitialChoice,
      });
      await flushPromises();

      expect(functionsMocks.buildResultsPerPage).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildResultsPerPage).toHaveBeenCalledWith(
        exampleEngine,
        {
          initialState: {
            numberOfResults: defaultChoices[0],
          },
        }
      );

      const initializationError = element.shadowRoot.querySelector(
        selectors.componentError
      );
      expect(initializationError).toBeNull();

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        `The initialChoice "${customInvalidInitialChoice}" is not included in the choicesDisplayed "${defaultChoices}". Defaulting to the first value in choicesDisplayed.`
      );
    });

    it('should log a console error if the initial choice is a negative number and prevent component initiatlization', async () => {
      const customInvalidInitialChoice = -10;
      const element = createTestComponent({
        initialChoice: customInvalidInitialChoice,
      });
      await flushPromises();

      expect(functionsMocks.buildResultsPerPage).toHaveBeenCalledTimes(0);

      const initializationError = element.shadowRoot.querySelector(
        selectors.componentError
      );
      expect(initializationError).not.toBeNull();

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        `The initialChoice "${customInvalidInitialChoice}" must be a positive number.`
      );
    });

    it('should log a console error if the initial choice is not a number and prevent component initiatlization', async () => {
      const customInvalidInitialChoice = 'foo';
      const element = createTestComponent({
        initialChoice: customInvalidInitialChoice,
      });
      await flushPromises();

      expect(functionsMocks.buildResultsPerPage).toHaveBeenCalledTimes(0);

      const initializationError = element.shadowRoot.querySelector(
        selectors.componentError
      );
      expect(initializationError).not.toBeNull();

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        `The initialChoice "${customInvalidInitialChoice}" must be a positive number.`
      );
    });
  });

  describe('when you omit the #initialChoice option', () => {
    const mockNumberOfResults = 100;

    beforeEach(() => {
      resultsPerPageState = {
        ...resultsPerPageState,
        numberOfResults: mockNumberOfResults,
      };
    });
    it('should default to the first choice', async () => {
      const customChoices = [100, 250, 500];
      const element = createTestComponent({
        choicesDisplayed: customChoices.join(','),
      });
      await flushPromises();

      expect(functionsMocks.buildResultsPerPage).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildResultsPerPage).toHaveBeenCalledWith(
        exampleEngine,
        {
          initialState: {
            numberOfResults: customChoices[0],
          },
        }
      );

      const resultsPerPageOptions = Array.from(
        element.shadowRoot.querySelectorAll(selectors.resultsPerPageOption)
      );
      expect(resultsPerPageOptions).toHaveLength(customChoices.length);
      resultsPerPageOptions.forEach((option, index) => {
        expect(option.selected).toBe(index === 0);
      });
    });
  });
});
