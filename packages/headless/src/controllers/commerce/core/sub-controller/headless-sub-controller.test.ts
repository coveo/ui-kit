import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import * as CorePagination from '../pagination/headless-core-commerce-pagination';
import * as CoreInteractiveResult from '../result-list/headless-core-interactive-result';
import * as CoreSort from '../sort/headless-core-commerce-sort';
import {
  BaseSolutionTypeSubControllers,
  buildBaseSolutionTypeControllers,
  buildSolutionTypeSubControllers,
  SearchAndListingSubControllers,
} from './headless-sub-controller';

describe('sub controllers', () => {
  let engine: MockedCommerceEngine;
  const mockResponseIdSelector = jest.fn();
  const mockFetchResultsActionCreator = jest.fn();

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      name: 'buildSolutionTypeSubControllers',
      subControllersBuilder: buildSolutionTypeSubControllers,
    },
    {
      name: 'buildBaseSolutionTypeControllers',
      subControllersBuilder: buildBaseSolutionTypeControllers,
    },
  ])(
    '#interactiveResult builds interactive result controller',
    ({
      subControllersBuilder,
    }: {
      subControllersBuilder:
        | typeof buildSolutionTypeSubControllers
        | typeof buildBaseSolutionTypeControllers;
    }) => {
      const subControllers = subControllersBuilder(engine, {
        responseIdSelector: mockResponseIdSelector,
        fetchResultsActionCreator: mockFetchResultsActionCreator,
      });
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
    }
  );

  describe('#buildSolutionTypeSubControllers', () => {
    let subControllers: SearchAndListingSubControllers;

    beforeEach(() => {
      subControllers = buildSolutionTypeSubControllers(engine, {
        responseIdSelector: mockResponseIdSelector,
        fetchResultsActionCreator: mockFetchResultsActionCreator,
      });
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

  describe('#buildRecommendationsSubControllers', () => {
    const slotId = 'recommendations-slot-id';
    let subControllers: BaseSolutionTypeSubControllers;

    beforeEach(() => {
      subControllers = buildBaseSolutionTypeControllers(engine, {
        slotId,
        responseIdSelector: mockResponseIdSelector,
        fetchResultsActionCreator: mockFetchResultsActionCreator,
      });
    });

    it('#pagination builds pagination controller with slot id', () => {
      const buildCorePaginationMock = jest.spyOn(
        CorePagination,
        'buildCorePagination'
      );

      const pagination = subControllers.pagination();

      expect(pagination).toEqual(buildCorePaginationMock.mock.results[0].value);
      expect(buildCorePaginationMock).toHaveBeenCalledWith(engine, {
        fetchResultsActionCreator: mockFetchResultsActionCreator,
        slotId,
      });
    });
  });
});
