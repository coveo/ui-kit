import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {configuration} from '../../../app/common-reducers';
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
    it('dispatches #pushRecentResult', async () => {
      interactiveResult.select();
      jest.runAllTimers();
      expect(pushRecentResult).toHaveBeenCalled();
    });

    // eslint-disable-next-line @cspell/spellchecker
    // TODO LENS-1500
    /*it('dispatches ec.productClick', () => {
      interactiveResult.select();
      ...
    });*/

    // eslint-disable-next-line @cspell/spellchecker
    // TODO LENS-1500
    /*it('does not dispatch ec.productClick when product was opened', () => {
      interactiveResult.select();
      ...
    });*/
  });
});
