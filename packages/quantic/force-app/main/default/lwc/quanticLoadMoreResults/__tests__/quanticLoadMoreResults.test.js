import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import QuanticLoadMoreResults from 'c/quanticLoadMoreResults';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';
import * as quanticUtils from 'c/quanticUtils';

jest.mock('c/quanticHeadlessLoader');
jest.mock('c/quanticUtils', () => ({
  ...jest.requireActual('c/quanticUtils'),
  AriaLiveRegion: jest.fn(),
}));
jest.mock(
  '@salesforce/label/c.quantic_LoadMoreResults',
  () => ({default: 'Load more results'}),
  {virtual: true}
);
jest.mock(
  '@salesforce/label/c.quantic_ShowingResultsOfLoadMore',
  () => ({default: 'Showing {{0}} of {{1}} result'}),
  {virtual: true}
);
jest.mock(
  '@salesforce/label/c.quantic_ShowingResultsOfLoadMore_plural',
  () => ({default: 'Showing {{0}} of {{1}} results'}),
  {virtual: true}
);
jest.mock(
  '@salesforce/label/c.quantic_AllResultsLoaded',
  () => ({default: 'All results have been loaded.'}),
  {virtual: true}
);

let isInitialized = false;
const exampleEngine = {
  id: 'exampleEngineId',
};

const initialResultListState = {
  hasResults: true,
  moreResultsAvailable: true,
  results: [{title: 'result 1'}, {title: 'result 2'}],
  searchResponseId: 'response-1',
};
let resultListState = {...initialResultListState};

const initialQuerySummaryState = {
  firstResult: 1,
  lastResult: 10,
  total: 123,
  hasResults: true,
};
let querySummaryState = {...initialQuerySummaryState};

const functionsMocks = {
  fetchMoreResults: jest.fn(() => {}),
  subscribeResultList: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribeResultList;
  }),
  unsubscribeResultList: jest.fn(() => {}),
  subscribeQuerySummary: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribeQuerySummary;
  }),
  unsubscribeQuerySummary: jest.fn(() => {}),
  dispatchMessage: jest.fn(() => {}),
};

const resultListControllerMock = {
  fetchMoreResults: functionsMocks.fetchMoreResults,
  get state() {
    return resultListState;
  },
  subscribe: functionsMocks.subscribeResultList,
};

const querySummaryControllerMock = {
  get state() {
    return querySummaryState;
  },
  subscribe: functionsMocks.subscribeQuerySummary,
};

const buildResultListMock = jest.fn().mockReturnValue(resultListControllerMock);
const buildQuerySummaryMock = jest
  .fn()
  .mockReturnValue(querySummaryControllerMock);

const quanticUtilsMock = jest.mocked(quanticUtils);
quanticUtilsMock.AriaLiveRegion.mockReturnValue({
  dispatchMessage: functionsMocks.dispatchMessage,
  registerRegion: () => {},
});

const selectors = {
  loadMoreButton: '[data-testid="load-more-results-button"]',
  summary: '[data-testid="summary"]',
  progressBar: '[data-testid="progress-bar"]',
  componentError: 'c-quantic-component-error',
};

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildResultList: buildResultListMock,
      buildQuerySummary: buildQuerySummaryMock,
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticLoadMoreResults && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticLoadMoreResults) {
      element.setInitializationError();
    }
  };
}

const createTestComponent = buildCreateTestComponent(
  QuanticLoadMoreResults,
  'c-quantic-load-more-results',
  {engineId: exampleEngine.id}
);

describe('c-quantic-load-more-results', () => {
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
    prepareHeadlessState();
  });

  afterEach(() => {
    cleanup();
    isInitialized = false;
    resultListState = {...initialResultListState};
    querySummaryState = {...initialQuerySummaryState};
    jest.clearAllMocks();
  });

  describe('controller initialization', () => {
    it('should build the necessary controllers and subscribe to the headless state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(buildResultListMock).toHaveBeenCalledTimes(1);
      expect(buildResultListMock).toHaveBeenCalledWith(exampleEngine);
      expect(functionsMocks.subscribeResultList).toHaveBeenCalledTimes(1);
      expect(buildQuerySummaryMock).toHaveBeenCalledTimes(1);
      expect(buildQuerySummaryMock).toHaveBeenCalledWith(exampleEngine);
      expect(functionsMocks.subscribeQuerySummary).toHaveBeenCalledTimes(1);
    });
  });

  describe('when hasResults is true', () => {
    it('should render the summary and the progress bar', async () => {
      const element = createTestComponent();
      await flushPromises();

      expect(
        element.shadowRoot.querySelector(selectors.summary)
      ).not.toBeNull();
      expect(
        element.shadowRoot.querySelector(selectors.progressBar)
      ).not.toBeNull();
    });

    describe('the load more button', () => {
      it('should render the button when moreResultsAvailable is true', async () => {
        resultListState = {...resultListState, moreResultsAvailable: true};
        const element = createTestComponent();
        await flushPromises();

        expect(
          element.shadowRoot.querySelector(selectors.loadMoreButton)
        ).not.toBeNull();
      });

      it('should not render the button when moreResultsAvailable is false', async () => {
        resultListState = {...resultListState, moreResultsAvailable: false};
        const element = createTestComponent();
        await flushPromises();

        expect(
          element.shadowRoot.querySelector(selectors.loadMoreButton)
        ).toBeNull();
      });

      it('should call fetchMoreResults when the load more button is clicked', async () => {
        resultListState = {...resultListState, moreResultsAvailable: true};
        querySummaryState = {...querySummaryState, lastResult: 2, total: 6};
        const element = createTestComponent();
        await flushPromises();

        const button = element.shadowRoot.querySelector(
          selectors.loadMoreButton
        );
        expect(button).not.toBeNull();
        button.click();

        expect(functionsMocks.fetchMoreResults).toHaveBeenCalledTimes(1);
      });
    });

    describe('#summary and progress values', () => {
      it('should reflect the querySummary state', async () => {
        querySummaryState = {...querySummaryState, lastResult: 10, total: 123};
        const element = createTestComponent();
        await flushPromises();

        const summary = element.shadowRoot.querySelector(selectors.summary);
        expect(summary.textContent).toContain('10');
        expect(summary.textContent).toContain('123');

        const progressBar = element.shadowRoot.querySelector(
          selectors.progressBar
        );
        expect(progressBar.value).toBe((10 / 123) * 100);
      });
    });

    describe('#aria-live announcement', () => {
      it('should dispatch a message when moreResultsAvailable transitions from true to false within the same search response', async () => {
        resultListState = {
          ...initialResultListState,
          moreResultsAvailable: true,
          searchResponseId: 'response-1',
        };
        createTestComponent();
        await flushPromises();

        resultListState = {
          ...resultListState,
          moreResultsAvailable: false,
          searchResponseId: 'response-1',
        };
        functionsMocks.subscribeResultList.mock.calls[0][0]();
        await flushPromises();

        expect(functionsMocks.dispatchMessage).toHaveBeenCalledWith(
          'All results have been loaded.'
        );
      });
    });
  });

  describe('when hasResults is false', () => {
    it('should not render the component', async () => {
      resultListState = {...resultListState, hasResults: false};
      const element = createTestComponent();
      await flushPromises();

      expect(element.shadowRoot.querySelector(selectors.summary)).toBeNull();
      expect(
        element.shadowRoot.querySelector(selectors.progressBar)
      ).toBeNull();
      expect(
        element.shadowRoot.querySelector(selectors.loadMoreButton)
      ).toBeNull();
    });
  });

  describe('disconnectedCallback', () => {
    it('should unsubscribe from resultList and querySummary when component is disconnected', async () => {
      const element = createTestComponent();
      await flushPromises();

      element.remove();

      expect(functionsMocks.unsubscribeResultList).toHaveBeenCalledTimes(1);
      expect(functionsMocks.unsubscribeQuerySummary).toHaveBeenCalledTimes(1);
    });
  });

  describe('when there is an initialization error', () => {
    beforeEach(() => {
      mockErroneousHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should display the error component', async () => {
      const element = createTestComponent();
      await flushPromises();

      expect(
        element.shadowRoot.querySelector(selectors.componentError)
      ).not.toBeNull();
    });
  });
});
