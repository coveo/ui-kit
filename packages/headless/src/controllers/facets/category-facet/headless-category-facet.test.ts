import {
  buildCategoryFacet,
  CategoryFacet,
  CategoryFacetOptions,
} from './headless-category-facet';
import {SearchPageState} from '../../../state';
import {buildMockEngine, createMockState, MockEngine} from '../../../test';
import {
  registerCategoryFacet,
  toggleSelectCategoryFacetValue,
  deselectAllCategoryFacetValues,
  updateCategoryFacetNumberOfValues,
  updateCategoryFacetSortCriterion,
} from '../../../features/facets/category-facet-set/category-facet-set-actions';
import {buildMockCategoryFacetValue} from '../../../test/mock-category-facet-value';
import {buildMockCategoryFacetResponse} from '../../../test/mock-category-facet-response';
import {executeSearch} from '../../../features/search/search-actions';
import {defaultCategoryFacetOptions} from '../../../features/facets/category-facet-set/category-facet-set-slice';
import {
  CategoryFacetRequest,
  CategoryFacetSortCriterion,
} from '../../../features/facets/category-facet-set/interfaces/request';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request';

describe('category facet', () => {
  const facetId = '1';
  let options: CategoryFacetOptions;
  let state: SearchPageState;
  let engine: MockEngine;
  let categoryFacet: CategoryFacet;

  function initCategoryFacet() {
    engine = buildMockEngine({state});
    categoryFacet = buildCategoryFacet(engine, {options});
  }

  function setFacetRequest(config: Partial<CategoryFacetRequest> = {}) {
    state.categoryFacetSet[facetId] = buildMockCategoryFacetRequest({
      facetId,
      ...config,
    });
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

  it('registers a category facet with the passed options and default optional parameters', () => {
    const action = registerCategoryFacet({
      facetId,
      ...options,
      ...defaultCategoryFacetOptions,
    });
    expect(engine.actions).toContainEqual(action);
  });

  it('is subscribable', () => {
    expect(categoryFacet.subscribe).toBeDefined();
  });

  describe('when the search response is empty', () => {
    it('#state.values is an empty array', () => {
      expect(state.search.response.facets).toEqual([]);
      expect(categoryFacet.state.values).toEqual([]);
    });

    it('#state.parents is an empty array', () => {
      expect(categoryFacet.state.parents).toEqual([]);
    });
  });

  it(`when the search response has a category facet with a single level of values,
  #state.values contains the same values`, () => {
    const values = [buildMockCategoryFacetValue()];
    const response = buildMockCategoryFacetResponse({facetId, values});

    state.search.response.facets = [response];
    expect(categoryFacet.state.values).toBe(values);
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
      state.search.response.facets = [response];
    });

    it('#state.parents contains the selected leaf value', () => {
      expect(categoryFacet.state.parents).toEqual([selectedValue]);
    });

    it('#state.values is an empty array', () => {
      expect(categoryFacet.state.values).toEqual([]);
    });
  });

  describe('#toggleSelect', () => {
    it('dispatches #toggleCategoryFacetValue with the passed selection', () => {
      const selection = buildMockCategoryFacetValue({value: 'A'});
      categoryFacet.toggleSelect(selection);

      const action = toggleSelectCategoryFacetValue({facetId, selection});
      expect(engine.actions).toContainEqual(action);
    });

    it('executes a search', () => {
      const selection = buildMockCategoryFacetValue({value: 'A'});
      categoryFacet.toggleSelect(selection);

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  describe('#deselectAll', () => {
    beforeEach(() => categoryFacet.deselectAll());

    it('dispatches #deselectAllCategoryFacetValues', () => {
      expect(engine.actions).toContainEqual(
        deselectAllCategoryFacetValues(facetId)
      );
    });

    it('dispatches #updateCategoryFacetNumberOfValues with the initial number of values', () => {
      const {numberOfValues} = defaultCategoryFacetOptions;
      const action = updateCategoryFacetNumberOfValues({
        facetId,
        numberOfValues,
      });
      expect(engine.actions).toContainEqual(action);
    });

    it('executes a search', () => {
      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
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

  it('#sortBy dispatches #toggleCategoryFacetValue with the passed selection', () => {
    const sortCriterion: CategoryFacetSortCriterion = 'alphanumeric';
    categoryFacet.sortBy(sortCriterion);
    const action = updateCategoryFacetSortCriterion({
      facetId,
      criterion: sortCriterion,
    });
    expect(engine.actions).toContainEqual(action);
  });

  it('#isSortedBy returns correct value', () => {
    expect(categoryFacet.isSortedBy('alphanumeric')).toBe(false);
    expect(categoryFacet.isSortedBy('occurrences')).toBe(true);
  });
});
