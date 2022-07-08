import {InsightAppState} from '../../../../state/insight-app-state';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../../test/mock-engine';
import {buildMockInsightState} from '../../../../test/mock-insight-state';
import {
  buildInsightCategoryFacet,
  InsightCategoryFacet,
} from './headless-insight-category-facet';
import {
  deselectAllCategoryFacetValues,
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
  updateCategoryFacetSortCriterion,
} from '../../../../features/facets/category-facet-set/category-facet-set-actions';
import {defaultCategoryFacetOptions} from '../../../../features/facets/category-facet-set/category-facet-set-slice';
import {
  CategoryFacetRequest,
  CategoryFacetSortCriterion,
} from '../../../../features/facets/category-facet-set/interfaces/request';
import {buildMockCategoryFacetSlice} from '../../../../test/mock-category-facet-slice';
import {buildMockCategoryFacetRequest} from '../../../../test/mock-category-facet-request';
import {buildMockCategoryFacetValue} from '../../../../test/mock-category-facet-value';
import {buildMockCategoryFacetResponse} from '../../../../test/mock-category-facet-response';
import {
  executeSearch,
  fetchFacetValues,
} from '../../../../features/insight-search/insight-search-actions';
import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions';
import {CategoryFacetOptions} from '../../../core/facets/category-facet/headless-core-category-facet';

describe('insight category facet', () => {
  const facetId = '1';
  let insightCategoryFacet: InsightCategoryFacet;
  let engine: MockInsightEngine;
  let state: InsightAppState;
  let options: CategoryFacetOptions;

  function initInsightCategoryFacet() {
    engine = buildMockInsightEngine({state});
    insightCategoryFacet = buildInsightCategoryFacet(engine, {options});
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

      const action = toggleSelectCategoryFacetValue({
        facetId,
        selection,
        retrieveCount: defaultCategoryFacetOptions.numberOfValues,
      });
      expect(engine.actions).toContainEqual(action);
    });

    it('if the numberOfValues is set it dispatches #toggleCategoryFacetValue with the correct retireveCount', () => {
      options.numberOfValues = 10;
      initInsightCategoryFacet();
      const selection = buildMockCategoryFacetValue({value: 'A'});
      insightCategoryFacet.toggleSelect(selection);

      const action = toggleSelectCategoryFacetValue({
        facetId,
        selection,
        retrieveCount: 10,
      });
      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      const selection = buildMockCategoryFacetValue({value: 'A'});
      insightCategoryFacet.toggleSelect(selection);

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('executes a search', () => {
      const selection = buildMockCategoryFacetValue({value: 'A'});
      insightCategoryFacet.toggleSelect(selection);

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  describe('#deselectAll', () => {
    beforeEach(() => insightCategoryFacet.deselectAll());

    it('dispatches #deselectAllCategoryFacetValues', () => {
      expect(engine.actions).toContainEqual(
        deselectAllCategoryFacetValues(facetId)
      );
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('executes a search', () => {
      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  describe('#showMoreValues', () => {
    it('with no values, it dispatches #updateCategoryFacetNumberOfResults with the correct number of values', () => {
      insightCategoryFacet.showMoreValues();

      const action = updateCategoryFacetNumberOfValues({
        facetId,
        numberOfValues: defaultCategoryFacetOptions.numberOfValues,
      });
      expect(engine.actions).toContainEqual(action);
    });

    it('with a value, it dispatches #updateCategoryFacetNumberOfResults with the correct number of values', () => {
      const values = [buildMockCategoryFacetValue()];
      const response = buildMockCategoryFacetResponse({facetId, values});
      state.search.response.facets = [response];

      initInsightCategoryFacet();

      const action = updateCategoryFacetNumberOfValues({
        facetId,
        numberOfValues: 6,
      });
      insightCategoryFacet.showMoreValues();
      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      insightCategoryFacet.showMoreValues();

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('dispatches #fetchFacetValues', () => {
      insightCategoryFacet.showMoreValues();

      const action = engine.findAsyncAction(fetchFacetValues.pending);
      expect(action).toBeTruthy();
    });
  });

  describe('#showLessValues', () => {
    beforeEach(() => insightCategoryFacet.showLessValues());

    it('dispatches #updateCategoryFacetNumberOfResults with the correct numberOfValues', () => {
      const action = updateCategoryFacetNumberOfValues({
        facetId,
        numberOfValues: 5,
      });
      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('dispatches #fetchFacetValues', () => {
      const action = engine.actions.find(
        (a) => a.type === fetchFacetValues.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  describe('#sortBy', () => {
    it('dispatches #toggleCategoryFacetValue with the passed selection', () => {
      const sortCriterion: CategoryFacetSortCriterion = 'alphanumeric';
      insightCategoryFacet.sortBy(sortCriterion);
      const action = updateCategoryFacetSortCriterion({
        facetId,
        criterion: sortCriterion,
      });
      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      insightCategoryFacet.sortBy('alphanumeric');

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('dispatches #executeSearch', () => {
      insightCategoryFacet.sortBy('alphanumeric');
      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  it('#isSortedBy returns correct value', () => {
    expect(insightCategoryFacet.isSortedBy('alphanumeric')).toBe(false);
    expect(insightCategoryFacet.isSortedBy('occurrences')).toBe(true);
  });
});
