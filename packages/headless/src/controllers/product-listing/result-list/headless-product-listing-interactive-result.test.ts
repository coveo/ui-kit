import {configuration} from '../../../app/common-reducers';
import {logProductRecommendationOpen} from '../../../features/product-listing/product-listing-analytics';
import {
  MockedProductListingEngine,
  buildMockProductListingEngine,
} from '../../../test/mock-engine-v2';
import {buildMockProductListingState} from '../../../test/mock-product-listing-state';
import {buildMockProductRecommendation} from '../../../test/mock-product-recommendation';
import {ProductRecommendation} from './../../../api/search/search/product-recommendation';
import {
  buildInteractiveResult,
  InteractiveResult,
} from './headless-product-listing-interactive-result';

jest.mock('../../../features/product-listing/product-listing-analytics');

describe('InteractiveResult', () => {
  let engine: MockedProductListingEngine;
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

  function expectLogDocumentActionPending() {
    expect(logProductRecommendationOpen).toHaveBeenCalledWith(mockProductRec);
  }

  beforeEach(() => {
    engine = buildMockProductListingEngine(buildMockProductListingState());
    initializeInteractiveResult();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('when calling select(), logs documentOpen', () => {
    interactiveResult.select();
    expectLogDocumentActionPending();
  });
});
