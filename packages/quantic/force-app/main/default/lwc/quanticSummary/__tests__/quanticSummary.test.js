jest.mock('c/quanticHeadlessLoader');
import QuanticSummary from 'c/quanticSummary';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';
import * as quanticHeadlessLoader from 'c/quanticHeadlessLoader';

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
  beforeEach(() => {});

  afterEach(() => {
    cleanup();
  });

  it('should build headless controller and subscribe on initialization', () => {
    createTestComponent();

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
    summaryControllerMock.state = {
      hasResults: false,
    };

    const element = createTestComponent();

    const summary = element.shadowRoot.querySelector(selectors.summary);
    expect(summary).toBeFalsy();
  });

  describe('when loading default summary', () => {
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

    it('should render the summary correctly', async () => {
      const element = createTestComponent();
      await updateState();

      const summary = element.shadowRoot.querySelector(selectors.summary);
      expect(summary).toBeTruthy();
    });
  });

  describe('when there is an initialization error', () => {
    test('should show the error component', async () => {
      headlessLoaderMock.initializeWithHeadless.mockImplementation(
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
  });
});
