jest.mock('c/quanticHeadlessLoader');
jest.mock('c/quanticUtils');

import QuanticSummary from 'c/quanticSummary';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';
import * as quanticHeadlessLoader from 'c/quanticHeadlessLoader';
import * as quanticUtils from 'c/quanticUtils';

const headlessLoaderMock = jest.mocked(quanticHeadlessLoader);
const engineMock = {
  id: 'mockEngine',
  dispatch: jest.fn(),
};

let updateState;
const summaryControllerMock = {
  subscribe: jest.fn((listener) => {
    updateState = async () => {
      listener();
      await flushPromises();
    };
    return () => {}; // Fake unsubscribe function
  }),
};

const headlessMock = {
  buildQuerySummary: jest.fn().mockReturnValue(summaryControllerMock),
};
headlessLoaderMock.getHeadlessBundle.mockReturnValue(headlessMock);
headlessLoaderMock.initializeWithHeadless.mockImplementation(
  async (element, _, initialize) => {
    if (element instanceof QuanticSummary) {
      initialize(engineMock);
    }
  }
);

const quanticUtilsMock = jest.mocked(quanticUtils);
quanticUtilsMock.AriaLiveRegion.mockReturnValue({
  dispatchMessage: jest.fn(),
  registerRegion: undefined,
});
quanticUtilsMock.I18nUtils.escapeHTML.mockImplementation((str) => str);
quanticUtilsMock.I18nUtils.getTextWithDecorator.mockImplementation(
  (str) => str
);
quanticUtilsMock.I18nUtils.format.mockImplementation((str, ...args) =>
  args.join(' ')
);

const selectors = {
  summary: 'lightning-formatted-rich-text',
  componentError: 'c-quantic-component-error',
};

const createTestComponent = buildCreateTestComponent(
  QuanticSummary,
  'c-quantic-summary',
  {engineId: engineMock.id}
);

describe('c-quantic-summary', () => {
  beforeEach(() => {
    summaryControllerMock.state = {
      hasResults: true,
      hasQuery: false,
      firstResult: 1,
      lastResult: 10,
      total: 100,
      query: '',
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('should build headless controller and subscribe on initialization', async () => {
    createTestComponent();
    await flushPromises();

    expect(headlessLoaderMock.getHeadlessBundle).toHaveBeenCalledWith(
      engineMock.id
    );
    expect(headlessLoaderMock.getHeadlessBundle).toHaveBeenCalledTimes(1);
    expect(headlessLoaderMock.initializeWithHeadless).toHaveBeenCalledWith(
      expect.any(QuanticSummary),
      engineMock.id,
      expect.any(Function)
    );
    expect(headlessLoaderMock.initializeWithHeadless).toHaveBeenCalledTimes(1);
    expect(headlessMock.buildQuerySummary).toHaveBeenCalledWith(engineMock);
    expect(headlessMock.buildQuerySummary).toHaveBeenCalledTimes(1);
    expect(summaryControllerMock.subscribe).toHaveBeenCalledWith(
      expect.any(Function)
    );
    expect(summaryControllerMock.subscribe).toHaveBeenCalledTimes(1);
  });

  it('should not render before results have returned', () => {
    summaryControllerMock.state.hasResults = false;

    const element = createTestComponent();

    const summary = element.shadowRoot.querySelector(selectors.summary);
    expect(summary).toBeFalsy();
  });

  describe('when loading default summary', () => {
    it('should render the summary correctly', async () => {
      const element = createTestComponent();
      await updateState();

      const summary = element.shadowRoot.querySelector(selectors.summary);
      expect(summary).toBeTruthy();
      expect(summary.value).toBe(
        `${summaryControllerMock.state.firstResult}-${summaryControllerMock.state.lastResult} ${summaryControllerMock.state.total} `
      );
      expect(
        quanticUtilsMock.I18nUtils.getTextWithDecorator
      ).toHaveBeenCalledWith(
        `${summaryControllerMock.state.total}`,
        '<b class="summary__total">',
        '</b>'
      );
      expect(
        quanticUtilsMock.I18nUtils.getTextWithDecorator
      ).toHaveBeenCalledWith(
        `${summaryControllerMock.state.firstResult}-${summaryControllerMock.state.lastResult}`,
        '<b class="summary__range">',
        '</b>'
      );
      expect(
        quanticUtilsMock.I18nUtils.getLabelNameWithCount
      ).toHaveBeenCalledWith(
        'showingResultsOf',
        summaryControllerMock.state.lastResult
      );
    });
  });

  describe('when there is an initialization error', () => {
    it('should show the error component', async () => {
      headlessLoaderMock.initializeWithHeadless.mockImplementationOnce(
        async (element) => {
          if (element instanceof QuanticSummary) {
            element.setInitializationError();
          }
        }
      );

      const element = createTestComponent();
      await flushPromises();

      const error = element.shadowRoot.querySelector(selectors.componentError);
      expect(error).toBeTruthy();
    });

    describe('when a query yields no results', () => {
      it('should not render anything', async () => {
        summaryControllerMock.state.hasResults = false;
        const element = createTestComponent();
        await updateState();

        const summary = element.shadowRoot.querySelector(selectors.summary);
        expect(summary).toBeFalsy();
      });
    });

    describe('when the page changes', () => {
      it('should display the correct per-page number', async () => {
        const element = createTestComponent();
        await updateState();

        const summary = element.shadowRoot.querySelector(selectors.summary);
        expect(summary).toBeTruthy();

        summaryControllerMock.state.firstResult = 11;
        summaryControllerMock.state.lastResult = 20;
        summaryControllerMock.state.total = 200;

        await updateState();
        expect(
          quanticUtilsMock.I18nUtils.getTextWithDecorator
        ).toHaveBeenCalledWith(
          `${summaryControllerMock.state.total}`,
          '<b class="summary__total">',
          '</b>'
        );
        expect(
          quanticUtilsMock.I18nUtils.getTextWithDecorator
        ).toHaveBeenCalledWith(
          `${summaryControllerMock.state.firstResult}-${summaryControllerMock.state.lastResult}`,
          '<b class="summary__range">',
          '</b>'
        );
        expect(
          quanticUtilsMock.I18nUtils.getLabelNameWithCount
        ).toHaveBeenCalledWith(
          'showingResultsOf',
          summaryControllerMock.state.lastResult
        );
      });
    });

    describe('when a query is entered', () => {
      it('should display the query in the summary', async () => {
        summaryControllerMock.state.query =
          'Makita 18V LXT brushless impact driver XDT14Z';
        summaryControllerMock.state.hasQuery = true;
        const element = createTestComponent();
        await updateState();

        const summary = element.shadowRoot.querySelector(selectors.summary);
        expect(summary).toBeTruthy();
        expect(
          quanticUtilsMock.I18nUtils.getTextWithDecorator
        ).toHaveBeenCalledWith(
          `${summaryControllerMock.state.total}`,
          '<b class="summary__total">',
          '</b>'
        );
        expect(
          quanticUtilsMock.I18nUtils.getTextWithDecorator
        ).toHaveBeenCalledWith(
          `${summaryControllerMock.state.firstResult}-${summaryControllerMock.state.lastResult}`,
          '<b class="summary__range">',
          '</b>'
        );
        expect(quanticUtilsMock.I18nUtils.escapeHTML).toHaveBeenCalledWith(
          summaryControllerMock.state.query
        );
        expect(
          quanticUtilsMock.I18nUtils.getTextWithDecorator
        ).toHaveBeenCalledWith(
          summaryControllerMock.state.query,
          '<b class="summary__query">',
          '</b>'
        );
        expect(
          quanticUtilsMock.I18nUtils.getLabelNameWithCount
        ).toHaveBeenCalledWith(
          'showingResultsOfWithQuery',
          summaryControllerMock.state.lastResult
        );
        expect(summary.value).toBe(
          `${summaryControllerMock.state.firstResult}-${summaryControllerMock.state.lastResult} ${summaryControllerMock.state.total} ${summaryControllerMock.state.query}`
        );
      });
    });
  });
});
