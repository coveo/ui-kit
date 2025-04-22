/* eslint-disable no-import-assign */
import QuanticInsightSummary from '../quanticInsightSummary';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {cleanup, flushPromises, buildCreateTestComponent} from 'c/testUtils';

const initialSummaryLabel = 'Insights related to this cases';

let isInitialized = false;

jest.mock('c/quanticHeadlessLoader');
jest.mock(
  '@salesforce/label/c.quantic_InsightRelatedToThisCase',
  () => ({default: initialSummaryLabel}),
  {
    virtual: true,
  }
);

const initialSearchBoxState = {
  value: '',
};
let searchBoxState = initialSearchBoxState;

const initialQuerySummaryState = {hasError: false};
let querySummaryState = initialQuerySummaryState;

const exampleEngine = {
  id: 'example engine',
};

const defaultOptions = {
  engineId: exampleEngine.id,
};

const functionsMocks = {
  buildSearchBox: jest.fn(() => ({
    state: searchBoxState,
    subscribe: functionsMocks.searchBoxStateSubscriber,
  })),
  buildQuerySummary: jest.fn(() => ({
    state: querySummaryState,
    subscribe: functionsMocks.querySummaryStateSubscriber,
  })),
  searchBoxStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.searchBoxStateUnsubscriber;
  }),
  querySummaryStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.querySummaryStateUnsubscriber;
  }),
  searchBoxStateUnsubscriber: jest.fn(),
  querySummaryStateUnsubscriber: jest.fn(),
};

const selectors = {
  initializationError: 'c-quantic-component-error',
  initialSummaryMessage: '[data-testid="initial-summary-message"]',
  quanticSummary: 'c-quantic-summary',
};

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildSearchBox: functionsMocks.buildSearchBox,
      buildQuerySummary: functionsMocks.buildQuerySummary,
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticInsightSummary && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticInsightSummary) {
      element.setInitializationError();
    }
  };
}

const createTestComponent = buildCreateTestComponent(
  QuanticInsightSummary,
  'c-quantic-insight-summary',
  {defaultOptions}
);

describe('c-quantic-insight-summary', () => {
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
    prepareHeadlessState();
  });

  afterEach(() => {
    cleanup();
    searchBoxState = initialSearchBoxState;
    querySummaryState = initialQuerySummaryState;
    isInitialized = false;
  });

  describe('component initialization', () => {
    it('should initialize the search box and query summary headless controllers', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildSearchBox).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSearchBox).toHaveBeenCalledWith(exampleEngine);
      expect(functionsMocks.buildQuerySummary).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildQuerySummary).toHaveBeenCalledWith(
        exampleEngine
      );
    });

    it('should subscribe the search box and query summary state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.searchBoxStateSubscriber).toHaveBeenCalledTimes(1);
      expect(functionsMocks.querySummaryStateSubscriber).toHaveBeenCalledTimes(
        1
      );
    });
  });

  describe('component disconnection', () => {
    it('should unsubscribe from the search box and query summary state changes', async () => {
      const element = createTestComponent();
      await flushPromises();

      document.body.removeChild(element);

      expect(functionsMocks.searchBoxStateUnsubscriber).toHaveBeenCalledTimes(
        1
      );
      expect(
        functionsMocks.querySummaryStateUnsubscriber
      ).toHaveBeenCalledTimes(1);
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

  describe('when the searchbox state query value is empty', () => {
    it('should display the default insight summary message', async () => {
      const element = createTestComponent();
      await flushPromises();

      const initialSummaryMessage = element.shadowRoot.querySelector(
        selectors.initialSummaryMessage
      );
      const quanticQuerySummary = element.shadowRoot.querySelector(
        selectors.quanticSummary
      );

      expect(initialSummaryMessage).not.toBeNull();
      expect(initialSummaryMessage.textContent).toBe(initialSummaryLabel);
      expect(quanticQuerySummary).toBeNull();
    });
  });

  describe('when the searchbox state query value is not empty', () => {
    beforeEach(() => {
      searchBoxState = {
        value: 'test',
      };
    });

    it('should display the quantic summary component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const initialSummaryMessage = await element.shadowRoot.querySelector(
        selectors.initialSummaryMessage
      );
      const quanticQuerySummary = await element.shadowRoot.querySelector(
        selectors.quanticSummary
      );

      expect(quanticQuerySummary).not.toBeNull();
      expect(initialSummaryMessage).toBeNull();
    });
  });

  describe('when there is a query error', () => {
    beforeEach(() => {
      querySummaryState = {
        hasError: true,
      };
    });

    it('should not display the Insight Summary component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const title = await element.shadowRoot.querySelector(
        selectors.initialSummaryMessage
      );
      const quanticQuerySummary = await element.shadowRoot.querySelector(
        selectors.quanticSummary
      );

      expect(quanticQuerySummary).toBeNull();
      expect(title).toBeNull();
    });
  });
});
