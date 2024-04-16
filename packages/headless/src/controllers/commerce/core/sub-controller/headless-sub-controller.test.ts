import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import * as CorePagination from '../pagination/headless-core-commerce-pagination';
import * as CoreInteractiveResult from '../result-list/headless-core-interactive-result';
import * as CoreSort from '../sort/headless-core-commerce-sort';
import {
  buildSolutionTypeSubControllers,
  SolutionTypeSubControllers,
} from './headless-sub-controller';

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
    const buildCoreInteractiveResultMock = jest.spyOn(
      CoreInteractiveResult,
      'buildCoreInteractiveResult'
    );

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

    const interactiveResult = subControllers.interactiveResult({
      ...props,
    });

    expect(interactiveResult).toEqual(
      buildCoreInteractiveResultMock.mock.results[0].value
    );
  });

  it('#pagination builds pagination controller', () => {
    const buildCorePaginationMock = jest.spyOn(
      CorePagination,
      'buildCorePagination'
    );

    const pagination = subControllers.pagination();

    expect(pagination).toEqual(buildCorePaginationMock.mock.results[0].value);
  });

  it('#sort builds sort controller', () => {
    const buildCoreSortMock = jest.spyOn(CoreSort, 'buildCoreSort');

    const sort = subControllers.sort();

    expect(sort).toEqual(buildCoreSortMock.mock.results[0].value);
  });
});
