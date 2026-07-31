jest.mock('c/quanticHeadlessLoader');
jest.mock('c/quanticUtils');

import QuanticLoadMoreResults from 'c/quanticLoadMoreResults';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';
import * as quanticHeadlessLoader from 'c/quanticHeadlessLoader';
import * as quanticUtils from 'c/quanticUtils';

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
  '@salesforce/label/c.quantic_ShowingResultsOfLoadMore_zero',
  () => ({default: 'No results'}),
  {virtual: true}
);
jest.mock(
  '@salesforce/label/c.quantic_AllResultsLoaded',
  () => ({default: 'All results have been loaded.'}),
  {virtual: true}
);

const headlessLoaderMock = jest.mocked(quanticHeadlessLoader);
const engineMock = {
  id: 'mockEngine',
  dispatch: jest.fn(),
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

const headlessMock = {
  buildResultList: buildResultListMock,
  buildQuerySummary: buildQuerySummaryMock,
};
headlessLoaderMock.getHeadlessBundle.mockReturnValue(headlessMock);

let isInitialized = false;
headlessLoaderMock.initializeWithHeadless.mockImplementation(
  async (element, _, initialize) => {
    if (element instanceof QuanticLoadMoreResults && !isInitialized) {
      isInitialized = true;
      initialize(engineMock);
    }
  }
);

const quanticUtilsMock = jest.mocked(quanticUtils);
quanticUtilsMock.AriaLiveRegion.mockReturnValue({
  dispatchMessage: functionsMocks.dispatchMessage,
  registerRegion: undefined,
});
quanticUtilsMock.I18nUtils.getLabelNameWithCount.mockImplementation(
  (labelName, count) => {
    if (count === 0) {
      return `${labelName}_zero`;
    }
    if (count !== 1) {
      return `${labelName}_plural`;
    }
    return labelName;
  }
);
quanticUtilsMock.I18nUtils.format.mockImplementation((str, ...args) =>
  str.replace(/{{(\d+)}}/g, (_match, index) => args[index])
);

const selectors = {
  loadMoreButton: '[data-testid="load-more-results-button"]',
  summary: '[data-testid="summary"]',
  progressBar: '[data-testid="progress-bar"]',
  componentError: 'c-quantic-component-error',
};

const createTestComponent = buildCreateTestComponent(
  QuanticLoadMoreResults,
  'c-quantic-load-more-results',
  {engineId: engineMock.id}
);

describe('c-quantic-load-more-results', () => {
  afterEach(() => {
    cleanup();
    isInitialized = false;
    resultListState = {...initialResultListState};
    querySummaryState = {...initialQuerySummaryState};
    buildResultListMock.mockClear();
    buildQuerySummaryMock.mockClear();
    functionsMocks.fetchMoreResults.mockClear();
    functionsMocks.subscribeResultList.mockClear();
    functionsMocks.unsubscribeResultList.mockClear();
    functionsMocks.subscribeQuerySummary.mockClear();
    functionsMocks.unsubscribeQuerySummary.mockClear();
    functionsMocks.dispatchMessage.mockClear();
  });

  describe('controller initialization', () => {
    it('should build the necessary controllers and subscribe to the headless state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(buildResultListMock).toHaveBeenCalledTimes(1);
      expect(buildResultListMock).toHaveBeenCalledWith(engineMock);
      expect(functionsMocks.subscribeResultList).toHaveBeenCalledTimes(1);
      expect(buildQuerySummaryMock).toHaveBeenCalledTimes(1);
      expect(buildQuerySummaryMock).toHaveBeenCalledWith(engineMock);
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

    describe('#load more button visibility (AC4)', () => {
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
    });

    describe('#click behavior (AC3)', () => {
      it('should call fetchMoreResults and keep prior results referenced in state when clicked', async () => {
        resultListState = {...resultListState, moreResultsAvailable: true};
        const element = createTestComponent();
        await flushPromises();

        const button = element.shadowRoot.querySelector(
          selectors.loadMoreButton
        );
        expect(button).not.toBeNull();
        button.click();

        expect(functionsMocks.fetchMoreResults).toHaveBeenCalledTimes(1);
        expect(resultListState.results).toEqual(initialResultListState.results);
      });
    });

    describe('#summary and progress values (AC1)', () => {
      it('should reflect the querySummary state', async () => {
        querySummaryState = {...querySummaryState, lastResult: 10, total: 123};
        const element = createTestComponent();
        await flushPromises();

        const summary = element.shadowRoot.querySelector(selectors.summary);
        expect(summary.textContent).toContain('10');
        expect(summary.textContent).toContain('123');
      });
    });

    describe('#aria-live announcement (AC5)', () => {
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

      it('should not dispatch a message when a new search returns moreResultsAvailable false with a different searchResponseId', async () => {
        resultListState = {
          ...initialResultListState,
          moreResultsAvailable: false,
          searchResponseId: 'response-1',
        };
        createTestComponent();
        await flushPromises();

        expect(functionsMocks.dispatchMessage).not.toHaveBeenCalled();
      });

      it('should not dispatch a message on an unrelated re-render where moreResultsAvailable stays false', async () => {
        resultListState = {
          ...initialResultListState,
          moreResultsAvailable: false,
          searchResponseId: 'response-1',
        };
        createTestComponent();
        await flushPromises();

        functionsMocks.subscribeResultList.mock.calls[0][0]();
        await flushPromises();

        expect(functionsMocks.dispatchMessage).not.toHaveBeenCalled();
      });
    });
  });

  describe('when hasResults is false (AC6)', () => {
    it('should not render anything', async () => {
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
    it('should display the error component', async () => {
      headlessLoaderMock.initializeWithHeadless.mockImplementationOnce(
        (element) => {
          if (element instanceof QuanticLoadMoreResults) {
            element.setInitializationError();
          }
        }
      );
      const element = createTestComponent();
      await flushPromises();

      expect(
        element.shadowRoot.querySelector(selectors.componentError)
      ).not.toBeNull();
    });
  });

  describe('both engines (AC2, AC7)', () => {
    it('should build the same controllers when the headless bundle is the insight bundle', async () => {
      headlessLoaderMock.getHeadlessBundle.mockReturnValueOnce({
        ...headlessMock,
        insightSpecificFlag: true,
      });
      const element = createTestComponent();
      await flushPromises();

      expect(buildResultListMock).toHaveBeenCalledTimes(1);
      expect(buildResultListMock).toHaveBeenCalledWith(engineMock);
      expect(buildQuerySummaryMock).toHaveBeenCalledTimes(1);
      expect(buildQuerySummaryMock).toHaveBeenCalledWith(engineMock);
      expect(
        element.shadowRoot.querySelector(selectors.loadMoreButton)
      ).not.toBeNull();
    });

    it('should build the same controllers when the headless bundle is the search bundle', async () => {
      const element = createTestComponent();
      await flushPromises();

      expect(buildResultListMock).toHaveBeenCalledTimes(1);
      expect(buildQuerySummaryMock).toHaveBeenCalledTimes(1);
      expect(
        element.shadowRoot.querySelector(selectors.loadMoreButton)
      ).not.toBeNull();
    });
  });
});
