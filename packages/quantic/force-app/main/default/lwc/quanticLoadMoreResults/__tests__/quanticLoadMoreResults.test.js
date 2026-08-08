jest.mock('c/quanticHeadlessLoader');
jest.mock('c/quanticUtils');

import QuanticLoadMoreResults from 'c/quanticLoadMoreResults';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';
import * as quanticHeadlessLoader from 'c/quanticHeadlessLoader';
import * as quanticUtils from 'c/quanticUtils';

const headlessLoaderMock = jest.mocked(quanticHeadlessLoader);
const engineMock = {
  id: 'mockEngine',
  dispatch: jest.fn(),
};

const functionsMocks = {
  resultListSubscribe: jest.fn((cb) => {
    cb();
    return functionsMocks.resultListUnsubscribe;
  }),
  resultListUnsubscribe: jest.fn(() => {}),
  querySummarySubscribe: jest.fn((cb) => {
    cb();
    return functionsMocks.querySummaryUnsubscribe;
  }),
  querySummaryUnsubscribe: jest.fn(() => {}),
  fetchMoreResults: jest.fn(),
  dispatchMessage: jest.fn(),
};

const resultListControllerMock = {
  subscribe: functionsMocks.resultListSubscribe,
  fetchMoreResults: functionsMocks.fetchMoreResults,
};

const querySummaryControllerMock = {
  subscribe: functionsMocks.querySummarySubscribe,
};

const headlessMock = {
  buildResultList: jest.fn().mockReturnValue(resultListControllerMock),
  buildQuerySummary: jest.fn().mockReturnValue(querySummaryControllerMock),
};
headlessLoaderMock.getHeadlessBundle.mockReturnValue(headlessMock);
headlessLoaderMock.initializeWithHeadless.mockImplementation(
  async (element, _, initialize) => {
    if (element instanceof QuanticLoadMoreResults) {
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
  (baseName, count) => {
    if (!count) {
      return `${baseName}_zero`;
    }
    if (count > 1) {
      return `${baseName}_plural`;
    }
    return baseName;
  }
);
quanticUtilsMock.I18nUtils.format.mockImplementation(
  (str, ...args) => `${str} ${args.join(' ')}`
);

const selectors = {
  componentError: 'c-quantic-component-error',
  summary: 'lightning-formatted-rich-text',
  progressBar: '.load-more-results__progress-bar-fill',
  loadMoreButton: 'button.load-more-results__button',
};

const createTestComponent = buildCreateTestComponent(
  QuanticLoadMoreResults,
  'c-quantic-load-more-results',
  {engineId: engineMock.id}
);

function setState({
  moreResultsAvailable = true,
  hasResults = true,
  lastResult = 10,
  total = 100,
  searchResponseId = 'response-1',
} = {}) {
  resultListControllerMock.state = {
    moreResultsAvailable,
    searchResponseId,
  };
  querySummaryControllerMock.state = {
    hasResults,
    lastResult,
    total,
  };
}

describe('c-quantic-load-more-results', () => {
  beforeEach(() => {
    setState();
  });

  afterEach(() => {
    cleanup();
  });

  it('should build the result list and query summary controllers and subscribe to their state', async () => {
    createTestComponent();
    await flushPromises();

    expect(headlessLoaderMock.getHeadlessBundle).toHaveBeenCalledWith(
      engineMock.id
    );
    expect(headlessMock.buildResultList).toHaveBeenCalledWith(engineMock);
    expect(headlessMock.buildQuerySummary).toHaveBeenCalledWith(engineMock);
    expect(resultListControllerMock.subscribe).toHaveBeenCalledWith(
      expect.any(Function)
    );
    expect(querySummaryControllerMock.subscribe).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  describe('when there is an initialization error', () => {
    it('should display the initialization error component', async () => {
      headlessLoaderMock.initializeWithHeadless.mockImplementationOnce(
        async (element) => {
          if (element instanceof QuanticLoadMoreResults) {
            element.setInitializationError();
          }
        }
      );

      const element = createTestComponent();
      await flushPromises();

      const error = element.shadowRoot.querySelector(selectors.componentError);
      expect(error).not.toBeNull();
    });
  });

  describe('when there are no results', () => {
    it('should render nothing', async () => {
      setState({hasResults: false});
      const element = createTestComponent();
      await flushPromises();

      const summary = element.shadowRoot.querySelector(selectors.summary);
      const button = element.shadowRoot.querySelector(selectors.loadMoreButton);
      expect(summary).toBeNull();
      expect(button).toBeNull();
    });
  });

  describe('when more results are available', () => {
    it('should render the summary, progress bar, and load more button', async () => {
      setState({moreResultsAvailable: true, lastResult: 10, total: 100});
      const element = createTestComponent();
      await flushPromises();

      const summary = element.shadowRoot.querySelector(selectors.summary);
      const progressBar = element.shadowRoot.querySelector(
        selectors.progressBar
      );
      const button = element.shadowRoot.querySelector(selectors.loadMoreButton);
      expect(summary).not.toBeNull();
      expect(progressBar).not.toBeNull();
      expect(progressBar.style.width).toBe('10%');
      expect(button).not.toBeNull();
    });

    it('should call fetchMoreResults when the button is clicked', async () => {
      setState({moreResultsAvailable: true});
      const element = createTestComponent();
      await flushPromises();

      const button = element.shadowRoot.querySelector(selectors.loadMoreButton);
      button.click();

      expect(functionsMocks.fetchMoreResults).toHaveBeenCalledTimes(1);
    });
  });

  describe('when no more results are available', () => {
    it('should not render the load more button', async () => {
      setState({moreResultsAvailable: false, lastResult: 100, total: 100});
      const element = createTestComponent();
      await flushPromises();

      const button = element.shadowRoot.querySelector(selectors.loadMoreButton);
      expect(button).toBeNull();
    });
  });

  describe('when the last batch of results has just been loaded', () => {
    it('should dispatch the all-results-loaded aria-live message', async () => {
      setState({
        moreResultsAvailable: true,
        searchResponseId: 'response-1',
      });
      createTestComponent();
      await flushPromises();

      functionsMocks.dispatchMessage.mockClear();

      resultListControllerMock.state = {
        moreResultsAvailable: false,
        searchResponseId: 'response-1',
      };
      functionsMocks.resultListSubscribe.mock.calls[0][0]();

      expect(functionsMocks.dispatchMessage).toHaveBeenCalledWith(
        'c.quantic_AllResultsLoaded'
      );
    });

    it('should not dispatch the message when the transition is caused by a new search', async () => {
      setState({
        moreResultsAvailable: true,
        searchResponseId: 'response-1',
      });
      createTestComponent();
      await flushPromises();

      functionsMocks.dispatchMessage.mockClear();

      resultListControllerMock.state = {
        moreResultsAvailable: false,
        searchResponseId: 'response-2',
      };
      functionsMocks.resultListSubscribe.mock.calls[0][0]();

      expect(functionsMocks.dispatchMessage).not.toHaveBeenCalled();
    });
  });
});
