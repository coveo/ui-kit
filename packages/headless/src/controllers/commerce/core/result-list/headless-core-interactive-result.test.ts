import {configuration} from '../../../../app/common-reducers';
import {productClick} from '../../../../features/commerce/context/product/product-actions';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {buildCoreInteractiveResult} from './headless-core-interactive-result';

jest.mock('../../../../features/commerce/context/product/product-actions');

describe('core interactive result', () => {
  let engine: MockedCommerceEngine;

  const product = {
    productId: '1',
    name: 'clicked on product',
    price: 17.99,
  };

  function initializeInteractiveResult(delay?: number) {
    buildCoreInteractiveResult(engine, {
      options: {
        product,
        position: 1,
        selectionDelay: delay,
      },
      responseIdSelector: () => 'responseId',
    });
  }

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    initializeInteractiveResult();
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('#select dispatches productClick', () => {
    const controller = buildCoreInteractiveResult(engine, {
      options: {
        product,
        position: 2,
      },
      responseIdSelector: () => 'responseId',
    });

    controller.select();

    expect(productClick).toHaveBeenCalledWith({
      product,
      position: 2,
      responseId: 'responseId',
    });
  });
});
