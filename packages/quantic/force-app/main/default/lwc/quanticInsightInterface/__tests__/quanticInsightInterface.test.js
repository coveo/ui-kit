/* eslint-disable jest/no-conditional-expect */
/* eslint-disable no-import-assign */
import QuanticInsightInterface from 'c/quanticInsightInterface';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {cleanup, buildCreateTestComponent, flushPromises} from 'c/testUtils';

jest.mock('c/quanticUtils', () => ({
  generateFacetDependencyConditions: jest.fn(),
  regexEncode: jest.fn(),
  Store: {
    facetTypes: {
      FACETS: 'facets',
    },
  },
  I18nUtils: {
    format: jest.fn(),
    getLabelNameWithCount: jest.fn(),
  },
}));
jest.mock('c/quanticHeadlessLoader');
jest.mock(
  '@salesforce/apex/InsightController.getHeadlessConfiguration',
  () => {
    return {
      default: () =>
        new Promise((resolve) => {
          resolve(
            JSON.stringify({
              locale: 'en-US',
              timezone: 'America/New_York',
              insightId: 'dummyInsightId',
            })
          );
        }),
    };
  },
  {virtual: true}
);

const initialInsightInterfaceState = {
  values: [],
  enabled: true,
};
let insightInterfaceState = initialInsightInterfaceState;

let isInitialized = false;

const exampleEngine = {
  id: 'example engine id',
};
const exampleInsightId = 'example insight id';

const defaultOptions = {
  engineId: exampleEngine.id,
  insightId: exampleInsightId,
};

const functionsMocks = {
  buildInsightInterface: jest.fn(() => ({
    state: insightInterfaceState,
    subscribe: functionsMocks.insightInterfaceStateSubscriber,
  })),
  buildInsightEngine: jest.fn(() => ({
    executeFirstSearch: functionsMocks.executeFirstSearch,
  })),
  insightInterfaceStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.insightInterfaceStateUnsubscriber;
  }),
  executeFirstSearch: jest.fn(() => {}),
  insightInterfaceStateUnsubscriber: jest.fn(),
  eventListener: jest.fn(),
};

const CoveoHeadlessStub = {
  buildInsightEngine: function () {
    return {
      executeFirstSearch: jest.fn(() => {}),
    };
  },
  buildInsightInterface: functionsMocks.buildInsightInterface,
};

const createTestComponent = buildCreateTestComponent(
  QuanticInsightInterface,
  'c-quantic-insight-interface',
  defaultOptions
);

function prepareHeadlessState() {
  jest
    .spyOn(mockHeadlessLoader, 'getHeadlessBundle')
    .mockImplementation(() => ({
      buildFacet: functionsMocks.buildFacet,
    }));
  jest.spyOn(mockHeadlessLoader, 'loadDependencies').mockImplementation(
    () =>
      new Promise((resolve) => {
        resolve();
      })
  );
  jest
    .spyOn(mockHeadlessLoader, 'setInitializedCallback')
    .mockImplementation((callback) => {
      callback();
    });
  jest.spyOn(mockHeadlessLoader, 'getHeadlessBindings').mockReturnValue({
    engine: exampleEngine,
  });
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticInsightInterface && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

describe('c-quantic-insight-interface', () => {
  beforeAll(() => {
    document.addEventListener(
      'quantic__insightinterfaceinitialized',
      functionsMocks.eventListener,
      {once: true}
    );
  });

  beforeEach(() => {
    // @ts-ignore
    global.CoveoHeadlessInsight = CoveoHeadlessStub;
    mockSuccessfulHeadlessInitialization();
    prepareHeadlessState();
  });

  afterEach(() => {
    cleanup();
    insightInterfaceState = initialInsightInterfaceState;
    isInitialized = false;
  });

  describe('when the insight interface is loading', () => {
    beforeEach(() => {
      insightInterfaceState = {
        ...initialInsightInterfaceState,
        loading: true,
        config: {},
      };
    });

    it('should not dispatch the insight interface initialized event', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.eventListener).not.toHaveBeenCalled();
    });
  });

  describe('when the insight config is null', () => {
    beforeEach(() => {
      insightInterfaceState = {
        ...initialInsightInterfaceState,
        loading: false,
        config: null,
      };
    });

    it('should not dispatch the insight interface initialized event', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.eventListener).not.toHaveBeenCalled();
    });
  });

  describe('when the insight interface is not loading and the insight config is defined', () => {
    beforeEach(() => {
      insightInterfaceState = {
        ...initialInsightInterfaceState,
        loading: false,
        config: {},
      };
    });

    it('should dispatch the insight interface initialized event', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.eventListener).toHaveBeenCalledTimes(1);
    });
  });
});
