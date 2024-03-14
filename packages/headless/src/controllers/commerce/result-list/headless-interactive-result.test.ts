import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {configuration} from '../../../app/common-reducers';
import {productClick} from '../../../features/commerce/interactive-result/interactive-result-actions';
import {pushRecentResult} from '../../../features/product-listing/product-listing-recent-results';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../test/mock-engine-v2';
import {buildMockProductRecommendation} from '../../../test/mock-product-recommendation';
import {
  buildInteractiveResult,
  InteractiveResult,
} from './headless-interactive-result';

jest.mock('../../../features/product-listing/product-listing-recent-results');
jest.mock(
  '../../../features/commerce/interactive-result/interactive-result-actions'
);

describe('InteractiveResult', () => {
  let engine: MockedCommerceEngine;
  let product: ProductRecommendation;
  let interactiveResult: InteractiveResult;

  function initializeInteractiveResult() {
    product = buildMockProductRecommendation({
      permanentid: 'permanentid',
      documentUri: 'documentUri',
      clickUri: 'clickUri',
    });

    interactiveResult = buildInteractiveResult(engine, {
      options: {result: product},
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
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

  describe('#select', () => {
    it('dispatches #pushRecentResult', () => {
      interactiveResult.select();
      jest.runAllTimers();
      expect(pushRecentResult).toHaveBeenCalled();
    });

    it('dispatches ec.productClick', () => {
      const mockedProductClick = jest.mocked(productClick);
      interactiveResult.select();
      jest.runAllTimers();
      expect(mockedProductClick).toHaveBeenCalledTimes(1);
    });

    it('does not dispatch ec.productClick when product was opened', () => {
      const mockedProductClick = jest.mocked(productClick);
      // open the product
      interactiveResult.select();
      jest.runAllTimers();

      // Second click
      interactiveResult.select();
      jest.runAllTimers();

      expect(mockedProductClick).toHaveBeenCalledTimes(1);
    });
  });
});
