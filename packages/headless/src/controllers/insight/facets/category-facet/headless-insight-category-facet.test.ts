import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions.js';
import {
  deselectAllCategoryFacetValues,
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
  updateCategoryFacetSortCriterion,
} from '../../../../features/facets/category-facet-set/category-facet-set-actions.js';
import {defaultCategoryFacetOptions} from '../../../../features/facets/category-facet-set/category-facet-set-slice.js';
import type {
  CategoryFacetRequest,
  CategoryFacetSortCriterion,
} from '../../../../features/facets/category-facet-set/interfaces/request.js';
import {
  executeSearch,
  fetchFacetValues,
} from '../../../../features/insight-search/insight-search-actions.js';
import type {InsightAppState} from '../../../../state/insight-app-state.js';
import {buildMockCategoryFacetRequest} from '../../../../test/mock-category-facet-request.js';
import {buildMockCategoryFacetResponse} from '../../../../test/mock-category-facet-response.js';
import {buildMockCategoryFacetSlice} from '../../../../test/mock-category-facet-slice.js';
import {buildMockCategoryFacetValue} from '../../../../test/mock-category-facet-value.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../../test/mock-insight-state.js';
import {
  buildCategoryFacet,
  type CategoryFacet,
  type CategoryFacetOptions,
} from './headless-insight-category-facet.js';

vi.mock(
  '../../../../features/facets/category-facet-set/category-facet-set-actions'
);
vi.mock('../../../../features/insight-search/insight-search-actions');
vi.mock('../../../../features/facet-options/facet-options-actions');

describe('insight category facet', () => {
  const facetId = '1';
  let insightCategoryFacet: CategoryFacet;
  let engine: MockedInsightEngine;
  let state: InsightAppState;
  let options: CategoryFacetOptions;

  function initInsightCategoryFacet() {
    engine = buildMockInsightEngine(state);
    insightCategoryFacet = buildCategoryFacet(engine, {options});
  }

  function setFacetRequest(config: Partial<CategoryFacetRequest> = {}) {
    const request = buildMockCategoryFacetRequest({facetId, ...config});
    state.categoryFacetSet[facetId] = buildMockCategoryFacetSlice({request});
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'geography',
    };

    state = buildMockInsightState();
    setFacetRequest();
    initInsightCategoryFacet();
  });

  describe('#toggleSelect', () => {
    it('dispatches #toggleCategoryFacetValue with the passed selection', () => {
      const selection = buildMockCategoryFacetValue({value: 'A'});
      insightCategoryFacet.toggleSelect(selection);

      expect(toggleSelectCategoryFacetValue).toHaveBeenCalledWith({
        facetId,
        selection,
        retrieveCount: defaultCategoryFacetOptions.numberOfValues,
      });
    });

    it('if the numberOfValues is set it dispatches #toggleCategoryFacetValue with the correct retrieveCount', () => {
      options.numberOfValues = 10;
      initInsightCategoryFacet();
      const selection = buildMockCategoryFacetValue({value: 'A'});
      insightCategoryFacet.toggleSelect(selection);

      expect(toggleSelectCategoryFacetValue).toHaveBeenCalledWith({
        facetId,
        selection,
        retrieveCount: 10,
      });
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      const selection = buildMockCategoryFacetValue({value: 'A'});
      insightCategoryFacet.toggleSelect(selection);

      expect(updateFacetOptions).toHaveBeenCalledWith();
    });

    it('executes a search', () => {
      const selection = buildMockCategoryFacetValue({value: 'A'});
      insightCategoryFacet.toggleSelect(selection);

      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#deselectAll', () => {
    beforeEach(() => insightCategoryFacet.deselectAll());

    it('dispatches #deselectAllCategoryFacetValues', () => {
      expect(deselectAllCategoryFacetValues).toHaveBeenCalledWith(facetId);
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      expect(updateFacetOptions).toHaveBeenCalledWith();
    });

    it('executes a search', () => {
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#showMoreValues', () => {
    it('with no values, it dispatches #updateCategoryFacetNumberOfResults with the correct number of values', () => {
      insightCategoryFacet.showMoreValues();

      expect(updateCategoryFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: defaultCategoryFacetOptions.numberOfValues,
      });
    });

    it('with a value, it dispatches #updateCategoryFacetNumberOfResults with the correct number of values', () => {
      const values = [buildMockCategoryFacetValue()];
      const response = buildMockCategoryFacetResponse({facetId, values});
      state.search.response.facets = [response];

      initInsightCategoryFacet();

      insightCategoryFacet.showMoreValues();
      expect(updateCategoryFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: 6,
      });
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      insightCategoryFacet.showMoreValues();
      expect(updateFacetOptions).toHaveBeenCalledWith();
    });

    it('dispatches #fetchFacetValues', () => {
      insightCategoryFacet.showMoreValues();

      expect(fetchFacetValues).toHaveBeenCalled();
    });
  });

  describe('#showLessValues', () => {
    beforeEach(() => insightCategoryFacet.showLessValues());

    it('dispatches #updateCategoryFacetNumberOfResults with the correct numberOfValues', () => {
      expect(updateCategoryFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: 5,
      });
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      expect(updateFacetOptions).toHaveBeenCalledWith();
    });

    it('dispatches #fetchFacetValues', () => {
      expect(fetchFacetValues).toHaveBeenCalled();
    });
  });

  describe('#sortBy', () => {
    it('dispatches #toggleCategoryFacetValue with the passed selection', () => {
      const sortCriterion: CategoryFacetSortCriterion = 'alphanumeric';
      insightCategoryFacet.sortBy(sortCriterion);

      expect(updateCategoryFacetSortCriterion).toHaveBeenCalledWith({
        facetId,
        criterion: sortCriterion,
      });
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      insightCategoryFacet.sortBy('alphanumeric');
      expect(updateFacetOptions).toHaveBeenCalledWith();
    });

    it('dispatches #executeSearch', () => {
      insightCategoryFacet.sortBy('alphanumeric');
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  it('#isSortedBy returns correct value', () => {
    expect(insightCategoryFacet.isSortedBy('alphanumeric')).toBe(false);
    expect(insightCategoryFacet.isSortedBy('occurrences')).toBe(true);
  });
});
