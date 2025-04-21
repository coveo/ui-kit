/* eslint-disable no-import-assign */
import QuanticDidYouMean from '../quanticDidYouMean';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';

jest.mock('c/quanticHeadlessLoader');
jest.mock(
  '@salesforce/label/c.quantic_NoResultsFor',
  () => ({default: 'No Results for {{0}}'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_QueryCorrectedTo',
  () => ({default: 'Query was automatically corrected to {{0}}'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_ShowingResultsFor',
  () => ({default: 'Showing results for {{0}}'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_SearchInsteadFor',
  () => ({default: 'Search instead for'}),
  {
    virtual: true,
  }
);

let isInitialized = false;

const exampleEngine = {
  id: 'exampleEngineId',
};

const defaultQueryCorrectionMode = 'legacy';
const defaultDisableQueryAutoCorrection = false;

const defaultOptions = {
  engineId: exampleEngine.id,
  disableQueryAutoCorrection: false,
  queryCorrectionMode: defaultQueryCorrectionMode,
};

const selectors = {
  didYouMeanNoResultsLabel: '[data-testid="no-result-label"]',
  didYouMeanAutomaticQueryCorrectionLabel:
    '[data-testid="automatic-query-correction-label"]',
  didYouMeanApplyCorrectionButton: '[data-testid="apply-correction-button"]',
  queryTriggerShowingResultsForLabel:
    '[data-testid="showing-results-for-label"]',
  queryTriggerSearchInsteadForLabel: '[data-testid="search-instead-for-label"]',
  queryTriggerUndoButton: '[data-testid="undo-button"]',
};

const initialDidYouMeanState = {
  wasCorrectedTo: 'example corrected query',
  originalQuery: 'example original query',
  wasAutomaticallyCorrected: true,
  queryCorrection: {
    correctedQuery: 'example corrected query',
    wordCorrected: 'example',
  },
  hasQueryCorrection: true,
};
let didYouMeanState = initialDidYouMeanState;

const initialQueryTriggerState = {
  newQuery: 'example new query',
  originalQuery: 'example original query',
  wasQueryModified: true,
};
let queryTriggerState = initialQueryTriggerState;

const functionsMocks = {
  undoQueryTrigger: jest.fn(() => {}),
  applyCorrection: jest.fn(() => {}),
  buildDidYouMean: jest.fn(() => ({
    applyCorrection: functionsMocks.applyCorrection,
    state: didYouMeanState,
    subscribe: functionsMocks.subscribeDidYouMean,
  })),
  buildQueryTrigger: jest.fn(() => ({
    undo: functionsMocks.undoQueryTrigger,
    state: queryTriggerState,
    subscribe: functionsMocks.subscribeQueryTrigger,
  })),
  subscribeDidYouMean: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribeDidYouMean;
  }),
  unsubscribeDidYouMean: jest.fn(() => {}),
  subscribeQueryTrigger: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribeQueryTrigger;
  }),
  unsubscribeQueryTrigger: jest.fn(() => {}),
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

const createTestComponent = buildCreateTestComponent(
  QuanticDidYouMean,
  'c-quantic-did-you-mean',
  defaultOptions
);

describe('c-quantic-did-you-mean', () => {
  afterEach(() => {
    cleanup();
    isInitialized = false;
  });

  describe('controller initialization', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should subscribe to the headless state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildDidYouMean).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildDidYouMean).toHaveBeenCalledWith(
        exampleEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            queryCorrectionMode: defaultQueryCorrectionMode,
            automaticallyCorrectQuery: !defaultDisableQueryAutoCorrection,
          }),
        })
      );
      expect(functionsMocks.subscribeDidYouMean).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildQueryTrigger).toHaveBeenCalledTimes(1);
      expect(functionsMocks.subscribeQueryTrigger).toHaveBeenCalledTimes(1);
    });

    describe('#disableQueryAutoCorrection property', () => {
      describe.each([
        [false, true],
        [true, false],
      ])(
        'when disableQueryAutoCorrection is %s',
        (disableQueryAutoCorrection, expectedAutomaticallyCorrectQuery) => {
          it(`should initialize the controller with automaticallyCorrectQuery set to ${expectedAutomaticallyCorrectQuery}`, async () => {
            createTestComponent({
              disableQueryAutoCorrection,
            });
            await flushPromises();

            expect(functionsMocks.buildDidYouMean).toHaveBeenCalledTimes(1);
            expect(functionsMocks.buildDidYouMean).toHaveBeenCalledWith(
              exampleEngine,
              expect.objectContaining({
                options: expect.objectContaining({
                  automaticallyCorrectQuery: expectedAutomaticallyCorrectQuery,
                }),
              })
            );
          });
        }
      );
    });

    describe('#queryCorrectionMode property', () => {
      describe.each([['legacy'], ['next']])(
        'when queryCorrectionMode is %s',
        (queryCorrectionMode) => {
          it(`should initialize the headless didYouMean controller with queryCorrectionMode set to ${queryCorrectionMode}`, async () => {
            createTestComponent({
              ...defaultOptions,
              queryCorrectionMode,
            });
            await flushPromises();
            expect(functionsMocks.buildDidYouMean).toHaveBeenCalledTimes(1);
            expect(functionsMocks.buildDidYouMean).toHaveBeenCalledWith(
              exampleEngine,
              expect.objectContaining({
                options: expect.objectContaining({
                  automaticallyCorrectQuery: true,
                  queryCorrectionMode,
                }),
              })
            );
          });
        }
      );
    });
  });

  describe('when hasQueryCorrection is true', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should render the didYouMean component template with the auto corrected query', async () => {
      const expectedNoResultsLabel = initialDidYouMeanState.originalQuery;
      const expectedAutomaticQueryCorrectionLabel =
        initialDidYouMeanState.wasCorrectedTo;
      const element = createTestComponent();
      await flushPromises();

      const didYouMeanNoResultsLabel = element.shadowRoot.querySelector(
        selectors.didYouMeanNoResultsLabel
      );
      expect(didYouMeanNoResultsLabel).not.toBeNull();
      expect(didYouMeanNoResultsLabel.value).toContain(expectedNoResultsLabel);
      const didYouMeanAutomaticQueryCorrectionLabel =
        element.shadowRoot.querySelector(
          selectors.didYouMeanAutomaticQueryCorrectionLabel
        );
      expect(didYouMeanAutomaticQueryCorrectionLabel).not.toBeNull();
      expect(didYouMeanAutomaticQueryCorrectionLabel.value).toContain(
        expectedAutomaticQueryCorrectionLabel
      );
    });

    describe('when wasAutomaticallyCorrected is false', () => {
      beforeEach(() => {
        didYouMeanState.wasAutomaticallyCorrected = false;
      });

      it('should render the apply correction button to apply the query correct', async () => {
        const element = createTestComponent();
        await flushPromises();

        const applyCorrectionButton = element.shadowRoot.querySelector(
          selectors.didYouMeanApplyCorrectionButton
        );
        expect(applyCorrectionButton).not.toBeNull();
        expect(applyCorrectionButton.textContent).toBe(
          initialDidYouMeanState.queryCorrection.correctedQuery
        );
        applyCorrectionButton.click();
        await flushPromises();
        expect(functionsMocks.applyCorrection).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('when hasQueryCorrection is false', () => {
    beforeEach(() => {
      didYouMeanState.hasQueryCorrection = false;
      queryTriggerState = initialQueryTriggerState;
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should render the queryTrigger component template', async () => {
      const expectedNewQuery = initialQueryTriggerState.newQuery;
      const expectedOriginalQuery = initialQueryTriggerState.originalQuery;
      const element = createTestComponent();
      await flushPromises();

      const queryTriggerShowingResultsForLabel =
        element.shadowRoot.querySelector(
          selectors.queryTriggerShowingResultsForLabel
        );
      expect(queryTriggerShowingResultsForLabel).not.toBeNull();
      expect(queryTriggerShowingResultsForLabel.value).toContain(
        expectedNewQuery
      );
      const queryTriggerUndoButton = element.shadowRoot.querySelector(
        selectors.queryTriggerUndoButton
      );
      expect(queryTriggerUndoButton).not.toBeNull();
      expect(queryTriggerUndoButton.textContent).toContain(
        expectedOriginalQuery
      );
    });

    it('should call the queryTrigger undo method when the undo button is clicked', async () => {
      const element = createTestComponent();
      await flushPromises();

      const queryTriggerUndoButton = element.shadowRoot.querySelector(
        selectors.queryTriggerUndoButton
      );
      queryTriggerUndoButton.click();
      await flushPromises();

      expect(functionsMocks.undoQueryTrigger).toHaveBeenCalledTimes(1);
    });
  });

  describe('when hasQueryCorrection is false and wasQueryModified is false', () => {
    beforeEach(() => {
      didYouMeanState.hasQueryCorrection = false;
      queryTriggerState = {
        ...initialQueryTriggerState,
        wasQueryModified: false,
      };
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should not render anything', async () => {
      const element = createTestComponent();
      await flushPromises();

      const didYouMeanNoResultsLabel = element.shadowRoot.querySelector(
        selectors.didYouMeanNoResultsLabel
      );
      expect(didYouMeanNoResultsLabel).toBeNull();
      const didYouMeanAutomaticQueryCorrectionLabel =
        element.shadowRoot.querySelector(
          selectors.didYouMeanAutomaticQueryCorrectionLabel
        );
      expect(didYouMeanAutomaticQueryCorrectionLabel).toBeNull();

      const queryTriggerShowingResultsForLabel =
        element.shadowRoot.querySelector(
          selectors.queryTriggerShowingResultsForLabel
        );
      expect(queryTriggerShowingResultsForLabel).toBeNull();
      const queryTriggerUndoButton = element.shadowRoot.querySelector(
        selectors.queryTriggerUndoButton
      );
      expect(queryTriggerUndoButton).toBeNull();
    });
  });
});
