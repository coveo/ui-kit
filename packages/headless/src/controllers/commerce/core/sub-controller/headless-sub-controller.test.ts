import type {SchemaDefinition} from '@coveo/bueno';
import type {Parameters} from '../../../../features/commerce/parameters/parameters-actions.js';
import type {CommerceSearchParameters} from '../../../../features/commerce/search-parameters/search-parameters-actions.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../../test/mock-engine-v2.js';
import {buildMockProduct} from '../../../../test/mock-product.js';
import * as DidYouMean from '../../search/did-you-mean/headless-did-you-mean.js';
import type {SearchSummaryState} from '../../search/summary/headless-search-summary.js';
import * as CoreBreadcrumbManager from '../breadcrumb-manager/headless-core-breadcrumb-manager.js';
import * as CoreFacetGenerator from '../facets/generator/headless-commerce-facet-generator.js';
import * as CoreInteractiveProduct from '../interactive-product/headless-core-interactive-product.js';
import * as CorePagination from '../pagination/headless-core-commerce-pagination.js';
import * as CoreParameterManager from '../parameter-manager/headless-core-parameter-manager.js';
import * as CoreSort from '../sort/headless-core-commerce-sort.js';
import * as CoreUrlManager from '../url-manager/headless-core-url-manager.js';
import {
  type BaseSolutionTypeSubControllers,
  buildBaseSubControllers,
  buildSearchAndListingsSubControllers,
  buildSearchSubControllers,
  type SearchAndListingSubControllers,
  type SearchSubControllers,
} from './headless-sub-controller.js';

describe('sub-controllers', () => {
  let engine: MockedCommerceEngine;
  const mockResponseIdSelector = vi.fn();
  const mockIsLoadingSelector = vi.fn();
  const mockNumberOfProductsSelector = vi.fn();
  const mockErrorSelector = vi.fn();
  const mockPageSelector = vi.fn();
  const mockPerPageSelector = vi.fn();
  const mockTotalEntriesSelector = vi.fn();
  const mockAugmentSummary = vi.fn();
  const mockFetchProductsActionCreator = vi.fn();
  const mockFetchMoreProductsActionCreator = vi.fn();
  const mockFacetResponseSelector = vi.fn();
  const mockIsFacetLoadingResponseSelector = vi.fn();
  const mockRequestIdSelector = vi.fn();
  const mockParametersDefinition = {};
  const mockActiveParametersSelector = vi.fn();
  const mockRestoreActionCreator = vi.fn();
  const mockSerializer = {
    serialize: vi.fn(),
    deserialize: vi.fn(),
  };

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('#buildSearchSubControllers', () => {
    let subControllers: SearchSubControllers;

    beforeEach(() => {
      subControllers = buildSearchSubControllers(engine, {
        responseIdSelector: mockResponseIdSelector,
        isLoadingSelector: mockIsLoadingSelector,
        numberOfProductsSelector: mockNumberOfProductsSelector,
        errorSelector: mockErrorSelector,
        pageSelector: mockPageSelector,
        perPageSelector: mockPerPageSelector,
        totalEntriesSelector: mockTotalEntriesSelector,
        enrichSummary: mockAugmentSummary,
        fetchProductsActionCreator: mockFetchProductsActionCreator,
        fetchMoreProductsActionCreator: mockFetchMoreProductsActionCreator,
        facetResponseSelector: mockFacetResponseSelector,
        isFacetLoadingResponseSelector: mockIsFacetLoadingResponseSelector,
        requestIdSelector: mockRequestIdSelector,
        serializer: mockSerializer,
        parametersDefinition: mockParametersDefinition as SchemaDefinition<
          Required<CommerceSearchParameters>
        >,
        activeParametersSelector: mockActiveParametersSelector,
        restoreActionCreator: mockRestoreActionCreator,
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
      expect(subControllers).toHaveProperty('urlManager');
      expect(subControllers).toHaveProperty('parameterManager');
    });

    it('#didYouMean builds did you mean controller', () => {
      const buildDidYouMean = vi.spyOn(DidYouMean, 'buildDidYouMean');

      const didYouMean = subControllers.didYouMean();

      expect(didYouMean).toEqual(buildDidYouMean.mock.results[0].value);
      expect(buildDidYouMean).toHaveBeenCalledWith(engine);
    });
  });

  describe('#buildSearchAndListingsSubControllers', () => {
    let subControllers: SearchAndListingSubControllers<
      Parameters,
      SearchSummaryState
    >;

    beforeEach(() => {
      subControllers = buildSearchAndListingsSubControllers(engine, {
        responseIdSelector: mockResponseIdSelector,
        isLoadingSelector: mockIsLoadingSelector,
        numberOfProductsSelector: mockNumberOfProductsSelector,
        errorSelector: mockErrorSelector,
        pageSelector: mockPageSelector,
        perPageSelector: mockPerPageSelector,
        totalEntriesSelector: mockTotalEntriesSelector,
        enrichSummary: mockAugmentSummary,
        fetchProductsActionCreator: mockFetchProductsActionCreator,
        fetchMoreProductsActionCreator: mockFetchMoreProductsActionCreator,
        facetResponseSelector: mockFacetResponseSelector,
        isFacetLoadingResponseSelector: mockIsFacetLoadingResponseSelector,
        requestIdSelector: mockRequestIdSelector,
        serializer: mockSerializer,
        parametersDefinition: mockParametersDefinition as SchemaDefinition<
          Required<Parameters>
        >,
        activeParametersSelector: mockActiveParametersSelector,
        restoreActionCreator: mockRestoreActionCreator,
        facetSearchType: 'LISTING',
      });
    });

    it('exposes base sub-controllers', () => {
      expect(subControllers).toHaveProperty('pagination');
      expect(subControllers).toHaveProperty('interactiveProduct');
    });

    it('#sort builds sort controller', () => {
      const buildCoreSortMock = vi.spyOn(CoreSort, 'buildCoreSort');

      const sort = subControllers.sort();

      expect(sort).toEqual(buildCoreSortMock.mock.results[0].value);
    });

    it('#facetGenerator builds facet generator', () => {
      const buildCoreFacetGenerator = vi.spyOn(
        CoreFacetGenerator,
        'buildFacetGenerator'
      );

      const facetGenerator = subControllers.facetGenerator();

      expect(facetGenerator).toEqual(
        buildCoreFacetGenerator.mock.results[0].value
      );
    });

    it('#breadcrumbManager builds breadcrumb manager', () => {
      const buildCoreBreadcrumbManager = vi.spyOn(
        CoreBreadcrumbManager,
        'buildCoreBreadcrumbManager'
      );

      const breadcrumbManager = subControllers.breadcrumbManager();

      expect(breadcrumbManager).toEqual(
        buildCoreBreadcrumbManager.mock.results[0].value
      );
    });

    it('#urlManager builds url manager', () => {
      mockSerializer.deserialize.mockReturnValue({});
      const buildCoreUrlManager = vi.spyOn(
        CoreUrlManager,
        'buildCoreUrlManager'
      );

      const props = {
        initialState: {fragment: 'q=windmill'},
      };

      const urlManager = subControllers.urlManager(props);

      expect(urlManager).toEqual(buildCoreUrlManager.mock.results[0].value);
      expect(buildCoreUrlManager).toHaveBeenCalledWith(engine, {
        ...props,
        requestIdSelector: mockRequestIdSelector,
        parameterManagerBuilder: expect.any(Function),
        serializer: mockSerializer,
      });
    });

    it('#parameterManager builds parameter manager', () => {
      const buildCoreParameterManager = vi.spyOn(
        CoreParameterManager,
        'buildCoreParameterManager'
      );
      const props = {
        initialState: {parameters: {}},
      };

      const parameterManager = subControllers.parameterManager(props);

      expect(parameterManager).toEqual(
        buildCoreParameterManager.mock.results[0].value
      );
      expect(buildCoreParameterManager).toHaveBeenCalledWith(engine, {
        ...props,
        parametersDefinition: mockParametersDefinition as SchemaDefinition<
          Required<Parameters>
        >,
        activeParametersSelector: mockActiveParametersSelector,
        restoreActionCreator: mockRestoreActionCreator,
        fetchProductsActionCreator: mockFetchProductsActionCreator,
      });
    });
  });

  describe('#buildBaseSubControllers', () => {
    const slotId = 'recommendations-slot-id';
    let subControllers: BaseSolutionTypeSubControllers<SearchSummaryState>;

    beforeEach(() => {
      subControllers = buildBaseSubControllers(engine, {
        slotId,
        responseIdSelector: mockResponseIdSelector,
        isLoadingSelector: mockIsLoadingSelector,
        numberOfProductsSelector: mockNumberOfProductsSelector,
        errorSelector: mockErrorSelector,
        pageSelector: mockPageSelector,
        perPageSelector: mockPerPageSelector,
        totalEntriesSelector: mockTotalEntriesSelector,
        enrichSummary: mockAugmentSummary,
        fetchProductsActionCreator: mockFetchProductsActionCreator,
        fetchMoreProductsActionCreator: mockFetchMoreProductsActionCreator,
      });
    });

    it('#interactiveProduct builds interactive product controller', () => {
      const buildCoreInteractiveProductMock = vi.spyOn(
        CoreInteractiveProduct,
        'buildCoreInteractiveProduct'
      );

      const props = {
        options: {
          product: buildMockProduct({
            ec_product_id: '1',
            ec_name: 'Product name',
            ec_promo_price: 15.99,
            ec_price: 17.99,
            position: 1,
          }),
        },
      };

      const interactiveProduct = subControllers.interactiveProduct(props);

      expect(interactiveProduct).toEqual(
        buildCoreInteractiveProductMock.mock.results[0].value
      );
      expect(buildCoreInteractiveProductMock).toHaveBeenCalledWith(engine, {
        ...props,
        responseIdSelector: mockResponseIdSelector,
      });
    });

    it('#pagination builds pagination controller with slot id', () => {
      const buildCorePaginationMock = vi.spyOn(
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
