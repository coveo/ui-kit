import {configuration} from '../../../app/common-reducers';
import {logProductRecommendationOpen} from '../../../features/product-listing/product-listing-analytics';
import {pushRecentResult} from '../../../features/product-listing/product-listing-recent-results';
import {MockProductListingEngine} from '../../../test/mock-engine';
import {buildMockProductListingEngine} from '../../../test/mock-engine';
import {buildMockProductRecommendation} from '../../../test/mock-product-recommendation';
import {ProductRecommendation} from './../../../api/search/search/product-recommendation';
import {
  buildInteractiveResult,
  InteractiveResult,
} from './headless-product-listing-interactive-result';

describe('InteractiveResult', () => {
  let engine: MockProductListingEngine;
  let mockProductRec: ProductRecommendation;
  let interactiveResult: InteractiveResult;
  let logDocumentOpenPendingActionType: string;

  const productRecStringParams = {
    permanentid: 'permanentid',
    documentUri: 'documentUri',
    clickUri: 'clickUri',
  };

  function initializeInteractiveResult(delay?: number) {
    const productRec = (mockProductRec = buildMockProductRecommendation(
      productRecStringParams
    ));
    logDocumentOpenPendingActionType =
      logProductRecommendationOpen(mockProductRec).pending.type;
    interactiveResult = buildInteractiveResult(engine, {
      options: {result: productRec, selectionDelay: delay},
    });
  }

  function findLogDocumentAction() {
    return (
      engine.actions.find(
        (action) => action.type === logDocumentOpenPendingActionType
      ) ?? null
    );
  }

  function expectLogDocumentActionPending() {
    const action = findLogDocumentAction();
    expect(action).toEqual(
      logProductRecommendationOpen(mockProductRec).pending(
        action!.meta.requestId
      )
    );
  }

  beforeEach(() => {
    engine = buildMockProductListingEngine();
    initializeInteractiveResult();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('when calling select() should add the result to recent results list', () => {
    interactiveResult.select();
    jest.runAllTimers();

    expect(
      engine.actions.find((a) => a.type === pushRecentResult.type)
    ).toBeDefined();
  });

  it('when calling select(), logs documentOpen', () => {
    interactiveResult.select();
    expectLogDocumentActionPending();
  });
});
