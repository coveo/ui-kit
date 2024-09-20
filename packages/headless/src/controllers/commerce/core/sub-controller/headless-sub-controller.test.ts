import {SchemaDefinition} from '@coveo/bueno';
import {Parameters} from '../../../../features/commerce/parameters/parameters-actions.js';
import {CommerceSearchParameters} from '../../../../features/commerce/search-parameters/search-parameters-actions.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2.js';
import {buildMockProduct} from '../../../../test/mock-product.js';
import * as DidYouMean from '../../search/did-you-mean/headless-did-you-mean.js';
import {SearchSummaryState} from '../../search/summary/headless-search-summary.js';
import * as CoreBreadcrumbManager from '../breadcrumb-manager/headless-core-breadcrumb-manager.js';
import * as CoreFacetGenerator from '../facets/generator/headless-commerce-facet-generator.js';
import * as CoreInteractiveProduct from '../interactive-product/headless-core-interactive-product.js';
import * as CorePagination from '../pagination/headless-core-commerce-pagination.js';
import * as CoreParameterManager from '../parameter-manager/headless-core-parameter-manager.js';
import * as CoreSort from '../sort/headless-core-commerce-sort.js';
import * as CoreUrlManager from '../url-manager/headless-core-url-manager.js';
import {
  BaseSolutionTypeSubControllers,
  buildBaseSubControllers,
  buildSearchAndListingsSubControllers,
  buildSearchSubControllers,
  SearchAndListingSubControllers,
  SearchSubControllers,
} from './headless-sub-controller.js';

describe('sub-controllers', () => {
  let engine: MockedCommerceEngine;
  const mockResponseIdSelector = jest.fn();
  const mockIsLoadingSelector = jest.fn();
  const mockNumberOfProductsSelector = jest.fn();
  const mockErrorSelector = jest.fn();
  const mockPageSelector = jest.fn();
  const mockPerPageSelector = jest.fn();
  const mockTotalEntriesSelector = jest.fn();
  const mockAugmentSummary = jest.fn();
  const mockFetchProductsActionCreator = jest.fn();
  const mockFetchMoreProductsActionCreator = jest.fn();
  const mockFacetResponseSelector = jest.fn();
  const mockIsFacetLoadingResponseSelector = jest.fn();
  const mockRequestIdSelector = jest.fn();
  const mockParametersDefinition = {};
  const mockActiveParametersSelector = jest.fn();
  const mockRestoreActionCreator = jest.fn();
  const mockEnrichParameters = jest.fn();
  const mockSerializer = {
    serialize: jest.fn(),
    deserialize: jest.fn(),
  };

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
        enrichParameters: mockEnrichParameters,
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
      const buildDidYouMean = jest.spyOn(DidYouMean, 'buildDidYouMean');

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
        enrichParameters: mockEnrichParameters,
        facetSearchType: 'LISTING',
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

    it('#urlManager builds url manager', () => {
      mockSerializer.deserialize.mockReturnValue({});
      const buildCoreUrlManager = jest.spyOn(
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
      const buildCoreParameterManager = jest.spyOn(
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
        enrichParameters: mockEnrichParameters,
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
      const buildCoreInteractiveProductMock = jest.spyOn(
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
