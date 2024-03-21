import {configuration} from '../../../../app/common-reducers';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {buildMockProduct} from '../../../../test/mock-product';
import {buildInteractiveResult} from './headless-product-listing-interactive-result';

jest.mock(
  '../../../../features/product-listing/product-listing-recent-results'
);
jest.mock('../../../../features/product-listing/product-listing-analytics');

describe('InteractiveResult', () => {
  let engine: MockedCommerceEngine;

  const productRecStringParams = {
    permanentid: 'permanentid',
    clickUri: 'clickUri',
  };

  function initializeInteractiveResult(delay?: number) {
    const mockProduct = buildMockProduct(productRecStringParams);

    buildInteractiveResult(engine, {
      options: {product: mockProduct, selectionDelay: delay},
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
});
