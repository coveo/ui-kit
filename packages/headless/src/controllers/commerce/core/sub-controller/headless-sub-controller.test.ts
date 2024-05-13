import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import * as DidYouMean from '../../search/did-you-mean/headless-did-you-mean';
import * as CoreBreadcrumbManager from '../breadcrumb-manager/headless-core-breadcrumb-manager';
import * as CoreFacetGenerator from '../facets/generator/headless-commerce-facet-generator';
import * as CorePagination from '../pagination/headless-core-commerce-pagination';
import * as CoreInteractiveProduct from '../product-list/headless-core-interactive-product';
import * as CoreSort from '../sort/headless-core-commerce-sort';
import {
  BaseSolutionTypeSubControllers,
  buildBaseSubControllers,
  buildSearchAndListingsSubControllers,
  buildSearchSubControllers,
  SearchAndListingSubControllers,
  SearchSubControllers,
} from './headless-sub-controller';

describe('sub-controllers', () => {
  let engine: MockedCommerceEngine;
  const mockResponseIdSelector = jest.fn();
  const mockFetchProductsActionCreator = jest.fn();
  const mockFetchMoreProductsActionCreator = jest.fn();
  const mockFacetResponseSelector = jest.fn();
  const mockIsFacetLoadingResponseSelector = jest.fn();

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#buildSearchSubControllers', () => {
    let subControllers: SearchSubControllers;

    beforeEach(() => {
      subControllers = buildSearchSubControllers(engine, {
        responseIdSelector: mockResponseIdSelector,
        fetchProductsActionCreator: mockFetchProductsActionCreator,
        fetchMoreProductsActionCreator: mockFetchMoreProductsActionCreator,
        facetResponseSelector: mockFacetResponseSelector,
        isFacetLoadingResponseSelector: mockIsFacetLoadingResponseSelector,
      });
    });

    it('exposes base sub-controllers', () => {
      expect(subControllers).toHaveProperty('pagination');
      expect(subControllers).toHaveProperty('interactiveProduct');
    });

    it('exposes search and listing sub-controllers', () => {
      expect(subControllers).toHaveProperty('sort');
      expect(subControllers).toHaveProperty('facetGenerator');
      expect(subControllers).toHaveProperty('breadcrumbManager');
    });

    it('#didYouMean builds did you mean controller', () => {
      const buildDidYouMean = jest.spyOn(DidYouMean, 'buildDidYouMean');

      const didYouMean = subControllers.didYouMean();

      expect(didYouMean).toEqual(buildDidYouMean.mock.results[0].value);
      expect(buildDidYouMean).toHaveBeenCalledWith(engine);
    });
  });

  describe('#buildSearchAndListingsSubControllers', () => {
    let subControllers: SearchAndListingSubControllers;

    beforeEach(() => {
      subControllers = buildSearchAndListingsSubControllers(engine, {
        responseIdSelector: mockResponseIdSelector,
        fetchProductsActionCreator: mockFetchProductsActionCreator,
        fetchMoreProductsActionCreator: mockFetchMoreProductsActionCreator,
        facetResponseSelector: mockFacetResponseSelector,
        isFacetLoadingResponseSelector: mockIsFacetLoadingResponseSelector,
      });
    });

    it('exposes base sub-controllers', () => {
      expect(subControllers).toHaveProperty('pagination');
      expect(subControllers).toHaveProperty('interactiveProduct');
    });

    it('#sort builds sort controller', () => {
      const buildCoreSortMock = jest.spyOn(CoreSort, 'buildCoreSort');

      const sort = subControllers.sort();

      expect(sort).toEqual(buildCoreSortMock.mock.results[0].value);
    });

    it('#facetGenerator builds facet generator', () => {
      const buildCoreFacetGenerator = jest.spyOn(
        CoreFacetGenerator,
        'buildFacetGenerator'
      );

      const facetGenerator = subControllers.facetGenerator();

      expect(facetGenerator).toEqual(
        buildCoreFacetGenerator.mock.results[0].value
      );
    });

    it('#breadcrumbManager builds breadcrumb manager', () => {
      const buildCoreBreadcrumbManager = jest.spyOn(
        CoreBreadcrumbManager,
        'buildCoreBreadcrumbManager'
      );

      const breadcrumbManager = subControllers.breadcrumbManager();

      expect(breadcrumbManager).toEqual(
        buildCoreBreadcrumbManager.mock.results[0].value
      );
    });
  });

  describe('#buildBaseSubControllers', () => {
    const slotId = 'recommendations-slot-id';
    let subControllers: BaseSolutionTypeSubControllers;

    beforeEach(() => {
      subControllers = buildBaseSubControllers(engine, {
        slotId,
        responseIdSelector: mockResponseIdSelector,
        fetchProductsActionCreator: mockFetchProductsActionCreator,
        fetchMoreProductsActionCreator: mockFetchMoreProductsActionCreator,
      });
    });

    it('#interactiveProduct builds interactive product controller', () => {
      const buildCoreInteractiveProductMock = jest.spyOn(
        CoreInteractiveProduct,
        'buildCoreInteractiveProduct'
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

      const interactiveProduct = subControllers.interactiveProduct({
        ...props,
      });

      expect(interactiveProduct).toEqual(
        buildCoreInteractiveProductMock.mock.results[0].value
      );
      expect(buildCoreInteractiveProductMock).toHaveBeenCalledWith(engine, {
        ...props,
        responseIdSelector: mockResponseIdSelector,
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
        fetchProductsActionCreator: mockFetchProductsActionCreator,
        fetchMoreProductsActionCreator: mockFetchMoreProductsActionCreator,
        options: {
          slotId,
        },
      });
    });
  });
});
