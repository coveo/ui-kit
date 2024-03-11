import {CategoryFacetRequest} from '../../../features/facets/category-facet-set/interfaces/request';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {ProductListingAppState} from '../../../state/product-listing-app-state';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request';
import {buildMockCategoryFacetResponse} from '../../../test/mock-category-facet-response';
import {buildMockCategoryFacetSearch} from '../../../test/mock-category-facet-search';
import {buildMockCategoryFacetSlice} from '../../../test/mock-category-facet-slice';
import {buildMockCategoryFacetValue} from '../../../test/mock-category-facet-value';
import {
  MockedProductListingEngine,
  buildMockProductListingEngine,
} from '../../../test/mock-engine-v2';
import {buildMockProductListingState} from '../../../test/mock-product-listing-state';
import * as CategoryFacetSearch from '../../core/facets/facet-search/category/headless-category-facet-search';
import {
  buildCategoryFacet,
  CategoryFacet,
  CategoryFacetOptions,
} from './headless-product-listing-category-facet';

jest.mock('../../../features/product-listing/product-listing-actions');

describe('category facet', () => {
  const facetId = '1';
  let options: CategoryFacetOptions;
  let state: ProductListingAppState;
  let engine: MockedProductListingEngine;
  let categoryFacet: CategoryFacet;

  function initCategoryFacet() {
    engine = buildMockProductListingEngine(state);
    categoryFacet = buildCategoryFacet(engine, {options});
  }

  function setFacetRequest(config: Partial<CategoryFacetRequest> = {}) {
    const request = buildMockCategoryFacetRequest({facetId, ...config});
    state.categoryFacetSet[facetId] = buildMockCategoryFacetSlice({request});
    state.categoryFacetSearchSet[facetId] = buildMockCategoryFacetSearch();
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'geography',
    };

    state = buildMockProductListingState();
    setFacetRequest();
    initCategoryFacet();
  });

  describe('when the product listing response is empty', () => {
    it('#state.values is an empty array', () => {
      expect(state.productListing.facets.results).toEqual([]);
      expect(categoryFacet.state.values).toEqual([]);
    });

    it('#state.parents is an empty array', () => {
      expect(categoryFacet.state.parents).toEqual([]);
    });
  });

  describe('when the product listing response has a category facet with nested values', () => {
    const innerValues = [
      buildMockCategoryFacetValue({value: 'C'}),
      buildMockCategoryFacetValue({value: 'D'}),
    ];
    const middleValue = buildMockCategoryFacetValue({
      value: 'B',
      children: innerValues,
    });
    const outerValue = buildMockCategoryFacetValue({
      value: 'A',
      children: [middleValue],
    });

    beforeEach(() => {
      const response = buildMockCategoryFacetResponse({
        facetId,
        values: [outerValue],
      });
      state.productListing.facets.results = [response];
    });

    it('#state.parents contains the outer and middle values', () => {
      expect(categoryFacet.state.parents).toEqual([outerValue, middleValue]);
    });

    it('#state.values contains the innermost values', () => {
      expect(categoryFacet.state.values).toBe(innerValues);
    });

    it('#state.parents contains the outer and middle values', () => {
      expect(categoryFacet.state.parents).toEqual([outerValue, middleValue]);
    });
  });

  describe('when the category facet has a selected leaf value with no children', () => {
    const selectedValue = buildMockCategoryFacetValue({
      value: 'A',
      state: 'selected',
      children: [],
    });

    beforeEach(() => {
      const response = buildMockCategoryFacetResponse({
        facetId,
        values: [selectedValue],
      });
      state.productListing.facets.results = [response];
    });

    it('#state.parents contains the selected leaf value', () => {
      expect(categoryFacet.state.parents).toEqual([selectedValue]);
    });

    it('#state.values is an empty array', () => {
      expect(categoryFacet.state.values).toEqual([]);
    });
  });

  describe('#toggleSelect', () => {
    it('executes a fetch product listing', () => {
      const selection = buildMockCategoryFacetValue({value: 'A'});
      categoryFacet.toggleSelect(selection);

      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#deselectAll', () => {
    it('executes a fetch product listing', () => {
      categoryFacet.deselectAll();

      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#showMoreValues', () => {
    it('executes a fetch product listing', () => {
      categoryFacet.showMoreValues();

      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#showLessValues', () => {
    it('executes a fetch product listing', () => {
      categoryFacet.showLessValues();

      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#sortBy', () => {
    it('executes a fetch product listing', () => {
      categoryFacet.sortBy('alphanumeric');

      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  it('exposes a #facetSearch property', () => {
    jest.spyOn(CategoryFacetSearch, 'buildCoreCategoryFacetSearch');
    initCategoryFacet();

    expect(categoryFacet.facetSearch).toBeTruthy();
    expect(
      CategoryFacetSearch.buildCoreCategoryFacetSearch
    ).toHaveBeenCalledTimes(1);
  });

  it('exposes a #facetSearch state', () => {
    expect(categoryFacet.state.facetSearch).toBeTruthy();
    expect(categoryFacet.state.facetSearch.values).toEqual([]);

    const fakeResponseValue = {
      count: 123,
      displayValue: 'foo',
      rawValue: 'foo',
      path: ['bar', 'bazz'],
    };

    engine.state.categoryFacetSearchSet![facetId].response.values = [
      fakeResponseValue,
    ];

    expect(categoryFacet.state.facetSearch.values[0]).toMatchObject(
      fakeResponseValue
    );
  });
});
