import {ProductRecommendation} from '../../../../api/search/search/product-recommendation';
import {configuration} from '../../../../app/common-reducers';
import {logProductRecommendationOpen} from '../../../../features/product-listing/product-listing-analytics';
import {pushRecentResult} from '../../../../features/product-listing/product-listing-recent-results';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {buildMockProductRecommendation} from '../../../../test/mock-product-recommendation';
import {
  buildInteractiveResult,
  InteractiveResult,
} from './headless-product-listing-interactive-result';

jest.mock(
  '../../../../features/product-listing/product-listing-recent-results'
);
jest.mock('../../../../features/product-listing/product-listing-analytics');

describe('InteractiveResult', () => {
  let engine: MockedCommerceEngine;
  let mockProductRec: ProductRecommendation;
  let interactiveResult: InteractiveResult;

  const productRecStringParams = {
    permanentid: 'permanentid',
    documentUri: 'documentUri',
    clickUri: 'clickUri',
  };

  function initializeInteractiveResult(delay?: number) {
    const productRec = (mockProductRec = buildMockProductRecommendation(
      productRecStringParams
    ));

    interactiveResult = buildInteractiveResult(engine, {
      options: {result: productRec, selectionDelay: delay},
    });
  }

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    initializeInteractiveResult();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('when calling select() should add the result to recent results list', async () => {
    interactiveResult.select();
    jest.runAllTimers();
    expect(pushRecentResult).toHaveBeenCalled();
  });

  it('when calling select(), logs documentOpen', () => {
    interactiveResult.select();
    expect(logProductRecommendationOpen).toHaveBeenCalledWith(mockProductRec);
  });
});
