import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {buildCorePagination} from '../pagination/headless-core-commerce-pagination';
import {buildCoreInteractiveResult} from '../result-list/headless-core-interactive-result';
import {buildCoreSort} from '../sort/headless-core-commerce-sort';
import {
  buildSolutionTypeSubControllers,
  SolutionTypeSubControllers,
} from './headless-sub-controller';

jest.mock('../result-list/headless-core-interactive-result');
jest.mock('../pagination/headless-core-commerce-pagination');
jest.mock('../sort/headless-core-commerce-sort');

describe('sub controllers', () => {
  let engine: MockedCommerceEngine;
  let subControllers: SolutionTypeSubControllers;
  const mockResponseIdSelector = jest.fn();
  const mockFetchResultsActionCreator = jest.fn();

  function initSubControllers() {
    engine = buildMockCommerceEngine(buildMockCommerceState());

    subControllers = buildSolutionTypeSubControllers(engine, {
      responseIdSelector: mockResponseIdSelector,
      fetchResultsActionCreator: mockFetchResultsActionCreator,
    });
  }

  beforeEach(() => {
    initSubControllers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('#interactiveResult builds interactive result controller', () => {
    const props = {
      options: {
        product: {
          productId: '1',
          name: 'Product name',
          price: 17.99,
        },
        position: 1,
      },
    };

    subControllers.interactiveResult({
      ...props,
    });

    expect(buildCoreInteractiveResult).toHaveBeenCalledWith(engine, {
      ...props,
      responseIdSelector: mockResponseIdSelector,
    });
  });

  it('#pagination builds pagination controller', () => {
    subControllers.pagination();
    expect(buildCorePagination).toHaveBeenCalledWith(engine, {
      fetchResultsActionCreator: mockFetchResultsActionCreator,
    });
  });

  it('#sort builds sort controller', () => {
    subControllers.sort();
    expect(buildCoreSort).toHaveBeenCalledWith(engine, {
      fetchResultsActionCreator: mockFetchResultsActionCreator,
    });
  });
});
