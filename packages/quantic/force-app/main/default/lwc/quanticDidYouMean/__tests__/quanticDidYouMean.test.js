/* eslint-disable no-import-assign */
// @ts-ignore
import {createElement} from 'lwc';
import QuanticDidYouMean from '../quanticDidYouMean';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

jest.mock('c/quanticHeadlessLoader');

let isInitialized = false;

const exampleEngine = {
  id: 'exampleEngineId',
};

const defaultQueryCorrectionMode = 'legacy';

const defaultOptions = {
  engineId: exampleEngine.id,
  disableQueryAutoCorrection: false,
  queryCorrectionMode: defaultQueryCorrectionMode,
};

const mockDidYouMeanState = {
  wasCorrectedTo: 'example corrected query',
  originalQuery: 'example original query',
  wasAutomaticallyCorrected: true,
  queryCorrection: {
    correctedQuery: 'example corrected query',
    wordCorrected: 'example',
  },
  hasQueryCorrection: true,
};

const functionsMocks = {
  buildDidYouMean: jest.fn(() => ({
    state: mockDidYouMeanState,
    subscribe: functionsMocks.subscribe,
  })),
  buildQueryTrigger: jest.fn(() => ({
    state: {},
    subscribe: functionsMocks.subscribe,
  })),
  applyCorrection: jest.fn(() => {}),
  subscribe: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribe;
  }),
  unsubscribe: jest.fn(() => {}),
};

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildDidYouMean: functionsMocks.buildDidYouMean,
      buildQueryTrigger: functionsMocks.buildQueryTrigger,
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticDidYouMean && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function createTestComponent(options = defaultOptions) {
  prepareHeadlessState();
  const element = createElement('c-quantic-did-you-mean', {
    is: QuanticDidYouMean,
  });

  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

// Helper function to wait until the microtask queue is empty.
async function flushPromises() {
  return Promise.resolve();
}

describe('c-quantic-did-you-mean', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
    isInitialized = false;
  }

  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
  });

  afterEach(() => {
    cleanup();
  });

  describe('controller initialization', () => {
    it('should subscribe to the headless state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildDidYouMean).toHaveBeenCalled();
      expect(functionsMocks.subscribe).toHaveBeenCalled();
    });

    describe('#disableQueryAutoCorrection property', () => {
      describe('when disableQueryAutoCorrection is false (default)', () => {
        it('should properly initialize the controller with automatic query correction enabled', async () => {
          createTestComponent();
          await flushPromises();

          expect(functionsMocks.buildDidYouMean).toHaveBeenCalledTimes(1);
          expect(functionsMocks.buildDidYouMean).toHaveBeenCalledWith(
            exampleEngine,
            expect.objectContaining({
              options: expect.objectContaining({
                automaticallyCorrectQuery: true,
                queryCorrectionMode: defaultQueryCorrectionMode,
              }),
            })
          );
        });
      });

      describe('when disableQueryAutoCorrection is true', () => {
        it('should properly initialize the controller with automatic query correction disabled', async () => {
          createTestComponent({
            ...defaultOptions,
            disableQueryAutoCorrection: true,
          });
          await flushPromises();

          expect(functionsMocks.buildDidYouMean).toHaveBeenCalledTimes(1);
          expect(functionsMocks.buildDidYouMean).toHaveBeenCalledWith(
            exampleEngine,
            expect.objectContaining({
              options: expect.objectContaining({
                automaticallyCorrectQuery: false,
                queryCorrectionMode: defaultQueryCorrectionMode,
              }),
            })
          );
        });
      });
    });

    describe('#queryCorrectionMode property', () => {
      describe('when queryCorrectionMode is `legacy` (default)', () => {
        it('should properly initialize the controller with the query correction mode set to `legacy`', async () => {
          createTestComponent();
          await flushPromises();

          expect(functionsMocks.buildDidYouMean).toHaveBeenCalledTimes(1);
          expect(functionsMocks.buildDidYouMean).toHaveBeenCalledWith(
            exampleEngine,
            expect.objectContaining({
              options: expect.objectContaining({
                automaticallyCorrectQuery: true,
                queryCorrectionMode: defaultQueryCorrectionMode,
              }),
            })
          );
        });
      });

      describe('when queryCorrectionMode is `next`', () => {
        it('should properly initialize the controller with the query correction mode set to `next`', async () => {
          createTestComponent({
            ...defaultOptions,
            queryCorrectionMode: 'next',
          });
          await flushPromises();

          expect(functionsMocks.buildDidYouMean).toHaveBeenCalledTimes(1);
          expect(functionsMocks.buildDidYouMean).toHaveBeenCalledWith(
            exampleEngine,
            expect.objectContaining({
              options: expect.objectContaining({
                automaticallyCorrectQuery: true,
                queryCorrectionMode: 'next',
              }),
            })
          );
        });
      });
    });
  });
});
