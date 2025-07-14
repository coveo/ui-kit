import {configuration} from '../../../app/common-reducers.js';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions.js';
import {
  deselectAllCategoryFacetValues,
  registerCategoryFacet,
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
  updateCategoryFacetSortCriterion,
} from '../../../features/facets/category-facet-set/category-facet-set-actions.js';
import {
  categoryFacetSetReducer as categoryFacetSet,
  defaultCategoryFacetOptions,
} from '../../../features/facets/category-facet-set/category-facet-set-slice.js';
import type {
  CategoryFacetRequest,
  CategoryFacetSortCriterion,
} from '../../../features/facets/category-facet-set/interfaces/request.js';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../features/facets/facet-search-set/category/category-facet-search-set-slice.js';
import {
  executeSearch,
  fetchFacetValues,
} from '../../../features/search/search-actions.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import type {SearchAppState} from '../../../state/search-app-state.js';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request.js';
import {buildMockCategoryFacetResponse} from '../../../test/mock-category-facet-response.js';
import {buildMockCategoryFacetSearch} from '../../../test/mock-category-facet-search.js';
import {buildMockCategoryFacetSlice} from '../../../test/mock-category-facet-slice.js';
import {buildMockCategoryFacetValue} from '../../../test/mock-category-facet-value.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import * as FacetIdDeterminor from '../../core/facets/_common/facet-id-determinor.js';
import * as CategoryFacetSearch from '../../core/facets/facet-search/category/headless-category-facet-search.js';
import {
  buildCategoryFacet,
  type CategoryFacet,
  type CategoryFacetOptions,
} from './headless-category-facet.js';

vi.mock(
  '../../../features/facets/category-facet-set/category-facet-set-actions'
);
vi.mock('../../../features/search/search-actions');
vi.mock('../../../features/facet-options/facet-options-actions');

describe('category facet', () => {
  const facetId = '1';
  let options: CategoryFacetOptions;
  let state: SearchAppState;
  let engine: MockedSearchEngine;
  let categoryFacet: CategoryFacet;

  function initCategoryFacet() {
    engine = buildMockSearchEngine(state);
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

    state = createMockState();
    setFacetRequest();
    initCategoryFacet();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      categoryFacetSet,
      categoryFacetSearchSet,
      search,
    });
  });

  it('it calls #determineFacetId with the correct params', () => {
    vi.spyOn(FacetIdDeterminor, 'determineFacetId');

    initCategoryFacet();

    expect(FacetIdDeterminor.determineFacetId).toHaveBeenCalledWith(
      engine,
      options
    );
  });

  it('#state.facetId exposes the facet id', () => {
    expect(categoryFacet.state.facetId).toBe(facetId);
  });

  it('registers a category facet with the passed options and default optional parameters', () => {
    expect(registerCategoryFacet).toHaveBeenCalledWith({
      ...defaultCategoryFacetOptions,
      ...options,
      facetId,
      activeTab: '',
      tabs: {},
    });
  });

  it('when an option is invalid, it throws', () => {
    options.numberOfValues = 0;
    expect(() => initCategoryFacet()).toThrow(
      'Check the options of buildCategoryFacet'
    );
  });

  it('is subscribable', () => {
    expect(categoryFacet.subscribe).toBeDefined();
  });

  describe('when the search response is empty', () => {
    it('#state.valuesAsTrees and #state.selectedValueAncestry are empty arrays', () => {
      expect(state.search.response.facets).toEqual([]);
      expect(categoryFacet.state.valuesAsTrees).toEqual([]);
      expect(categoryFacet.state.selectedValueAncestry).toEqual([]);
    });
  });

  it(`when the search response has a category facet with a single level of values,
  #state.values contains the same values`, () => {
    const values = [buildMockCategoryFacetValue()];
    const response = buildMockCategoryFacetResponse({facetId, values});

    state.search.response.facets = [response];
    expect(categoryFacet.state.valuesAsTrees).toBe(values);
  });

  describe('when the search response has a category facet with nested values', () => {
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
      state.search.response.facets = [response];
    });

    it('#state.valueAsTree contains the outer value', () => {
      expect(categoryFacet.state.valuesAsTrees).toEqual([outerValue]);
    });

    it('#state.isHierarchical should be true', () => {
      expect(categoryFacet.state.isHierarchical).toBe(true);
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
      state.search.response.facets = [response];
    });

    it('#state.valuesAsTrees contains the selected leaf value', () => {
      expect(categoryFacet.state.valuesAsTrees).toEqual([selectedValue]);
    });

    it('#state.selectedValueAncestry contains the selected leaf value', () => {
      expect(categoryFacet.state.selectedValueAncestry).toEqual([
        selectedValue,
      ]);
    });
  });

  describe('#toggleSelect', () => {
    it('dispatches #toggleCategoryFacetValue with the passed selection', () => {
      const selection = buildMockCategoryFacetValue({value: 'A'});
      categoryFacet.toggleSelect(selection);

      expect(toggleSelectCategoryFacetValue).toHaveBeenCalledWith({
        facetId,
        selection,
        retrieveCount: defaultCategoryFacetOptions.numberOfValues,
      });
    });

    it('if the numberOfValues is set it dispatches #toggleCategoryFacetValue with the correct retrieveCount', () => {
      options.numberOfValues = 10;
      initCategoryFacet();
      const selection = buildMockCategoryFacetValue({value: 'A'});
      categoryFacet.toggleSelect(selection);

      expect(toggleSelectCategoryFacetValue).toHaveBeenCalledWith({
        facetId,
        selection,
        retrieveCount: 10,
      });
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      const selection = buildMockCategoryFacetValue({value: 'A'});
      categoryFacet.toggleSelect(selection);

      expect(updateFacetOptions).toHaveBeenCalled();
    });

    it('executes a search', () => {
      const selection = buildMockCategoryFacetValue({value: 'A'});
      categoryFacet.toggleSelect(selection);
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#deselectAll', () => {
    beforeEach(() => categoryFacet.deselectAll());

    it('dispatches #deselectAllCategoryFacetValues', () => {
      expect(deselectAllCategoryFacetValues).toHaveBeenCalledWith(facetId);
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      expect(updateFacetOptions).toHaveBeenCalled();
    });

    it('executes a search', () => {
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#state.hasActiveValues', () => {
    it('when there is a selected value, it is true', () => {
      const values = [buildMockCategoryFacetValue({state: 'selected'})];
      const response = buildMockCategoryFacetResponse({facetId, values});
      state.search.response.facets = [response];

      expect(categoryFacet.state.hasActiveValues).toBe(true);
    });

    it('when nothing is selected, it is false', () => {
      const response = buildMockCategoryFacetResponse({facetId});
      state.search.response.facets = [response];

      expect(categoryFacet.state.hasActiveValues).toBe(false);
    });
  });

  describe('#state.hasMoreValues', () => {
    describe('when currentValues is Empty (nothing is selected)', () => {
      it('if #moreValuesAvailable is true #state.canShowMoreValues is true', () => {
        const response = buildMockCategoryFacetResponse({
          facetId,
          moreValuesAvailable: true,
        });
        state.search.response.facets = [response];

        expect(categoryFacet.state.canShowMoreValues).toBe(true);
      });

      it('if #moreValuesAvailable is false #state.canShowMoreValues is false', () => {
        const response = buildMockCategoryFacetResponse({
          facetId,
          moreValuesAvailable: false,
        });
        state.search.response.facets = [response];

        expect(categoryFacet.state.canShowMoreValues).toBe(false);
      });
    });

    describe('when a value in currentValue is selected (top level value selected)', () => {
      it('if #moreValuesAvailable is true, #state.canShowMore is true', () => {
        const values = [
          buildMockCategoryFacetValue({
            numberOfResults: 10,
            state: 'selected',
            moreValuesAvailable: true,
          }),
        ];
        const response = buildMockCategoryFacetResponse({
          facetId,
          values,
          moreValuesAvailable: false,
        });

        state.search.response.facets = [response];
        expect(categoryFacet.state.canShowMoreValues).toBe(true);
      });

      it('if #moreValuesAvailable is true, #state.canShowMore is true', () => {
        const values = [
          buildMockCategoryFacetValue({
            numberOfResults: 10,
            state: 'selected',
            moreValuesAvailable: false,
          }),
        ];
        const response = buildMockCategoryFacetResponse({
          facetId,
          values,
          moreValuesAvailable: true,
        });

        state.search.response.facets = [response];
        expect(categoryFacet.state.canShowMoreValues).toBe(false);
      });
    });

    describe('when a nested value (currentValues[n].children[n]) is selected', () => {
      it('if currentValues has a value with more than 1 child', () => {
        const nestedChild = buildMockCategoryFacetValue({
          numberOfResults: 10,
          state: 'selected',
          moreValuesAvailable: true,
        });
        const values = [
          buildMockCategoryFacetValue({
            numberOfResults: 10,
            moreValuesAvailable: false,
            children: [nestedChild],
          }),
        ];
        const response = buildMockCategoryFacetResponse({facetId, values});

        state.search.response.facets = [response];
        expect(categoryFacet.state.canShowMoreValues).toBe(true);
      });
    });
  });

  describe('#state.canShowLessValues', () => {
    it('is false when there are 0 values being displayed', () => {
      expect(categoryFacet.state.canShowLessValues).toBe(false);
    });

    it('is true when there are more than the initial numberOfValues being shown', () => {
      options.numberOfValues = 1;
      initCategoryFacet();

      const value = buildMockCategoryFacetValue();
      const values = [value, value];
      const response = buildMockCategoryFacetResponse({facetId, values});
      state.search.response.facets = [response];

      expect(categoryFacet.state.canShowLessValues).toBe(true);
    });
  });

  describe('#showMoreValues', () => {
    it('with no values, it dispatches #updateCategoryFacetNumberOfResults with the correct number of values', () => {
      categoryFacet.showMoreValues();

      expect(updateCategoryFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: defaultCategoryFacetOptions.numberOfValues,
      });
    });

    it('with a value, it dispatches #updateCategoryFacetNumberOfResults with the correct number of values', () => {
      const values = [buildMockCategoryFacetValue()];
      const response = buildMockCategoryFacetResponse({facetId, values});
      state.search.response.facets = [response];

      initCategoryFacet();
      categoryFacet.showMoreValues();
      expect(updateCategoryFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: 6,
      });
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      categoryFacet.showMoreValues();
      expect(updateFacetOptions).toHaveBeenCalled();
    });

    it('dispatches #fetchFacetValues', () => {
      categoryFacet.showMoreValues();
      expect(fetchFacetValues).toHaveBeenCalled();
    });
  });

  describe('#showLessValues', () => {
    beforeEach(() => categoryFacet.showLessValues());

    it('dispatches #updateCategoryFacetNumberOfResults with the correct numberOfValues', () => {
      expect(updateCategoryFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: 5,
      });
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      expect(updateFacetOptions).toHaveBeenCalled();
    });

    it('dispatches #fetchFacetValues', () => {
      expect(fetchFacetValues).toHaveBeenCalled();
    });
  });

  describe('#sortBy', () => {
    it('dispatches #toggleCategoryFacetValue with the passed selection', () => {
      const sortCriterion: CategoryFacetSortCriterion = 'alphanumeric';
      categoryFacet.sortBy(sortCriterion);

      expect(updateCategoryFacetSortCriterion).toHaveBeenCalledWith({
        facetId,
        criterion: sortCriterion,
      });
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      categoryFacet.sortBy('alphanumeric');

      expect(updateFacetOptions).toHaveBeenCalled();
    });

    it('dispatches #executeSearch', () => {
      categoryFacet.sortBy('alphanumeric');
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  it('#isSortedBy returns correct value', () => {
    expect(categoryFacet.isSortedBy('alphanumeric')).toBe(false);
    expect(categoryFacet.isSortedBy('occurrences')).toBe(true);
  });

  it('exposes a #facetSearch property', () => {
    vi.spyOn(CategoryFacetSearch, 'buildCoreCategoryFacetSearch');
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
