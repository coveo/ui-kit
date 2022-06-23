import {InsightAppState} from '../../../state/insight-app-state';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {
  buildInsightCategoryFacet,
  InsightCategoryFacet,
  InsightCategoryFacetOptions,
} from './headless-insight-category-facet';
import {
  categoryFacetSearchSet,
  categoryFacetSet,
  configuration,
  search,
} from '../../../app/reducers';
import {
  deselectAllCategoryFacetValues,
  registerCategoryFacet,
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
  updateCategoryFacetSortCriterion,
} from '../../../features/facets/category-facet-set/category-facet-set-actions';
import {defaultCategoryFacetOptions} from '../../../features/facets/category-facet-set/category-facet-set-slice';
import {
  CategoryFacetRequest,
  CategoryFacetSortCriterion,
} from '../../../features/facets/category-facet-set/interfaces/request';
import {buildMockCategoryFacetSlice} from '../../../test/mock-category-facet-slice';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request';
import {buildMockCategoryFacetValue} from '../../../test/mock-category-facet-value';
import {buildMockCategoryFacetResponse} from '../../../test/mock-category-facet-response';
import {
  executeSearch,
  fetchFacetValues,
} from '../../../features/insight-search/insight-search-actions';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';

describe('insight category facet', () => {
  const facetId = '1';
  let insightCategoryFacet: InsightCategoryFacet;
  let engine: MockInsightEngine;
  let state: InsightAppState;
  let options: InsightCategoryFacetOptions;

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

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      categoryFacetSet,
      categoryFacetSearchSet,
      search,
    });
  });

  it('#state.facetId exposes the facet id', () => {
    expect(insightCategoryFacet.state.facetId).toBe(facetId);
  });

  it('registers a category facet with the passed options and default optional parameters', () => {
    const action = registerCategoryFacet({
      ...defaultCategoryFacetOptions,
      ...options,
      facetId,
    });
    expect(engine.actions).toContainEqual(action);
  });

  it('when an option is invalid, it throws', () => {
    options.numberOfValues = 0;
    expect(() => initInsightCategoryFacet()).toThrow(
      'Check the options of buildCategoryFacet'
    );
  });

  it('is subscribable', () => {
    expect(insightCategoryFacet.subscribe).toBeDefined();
  });

  describe('when the search response is empty', () => {
    it('#state.values is an empty array', () => {
      expect(state.search.response.facets).toEqual([]);
      expect(insightCategoryFacet.state.values).toEqual([]);
    });

    it('#state.parents is an empty array', () => {
      expect(insightCategoryFacet.state.parents).toEqual([]);
    });
  });

  it(`when the search response has a category facet with a single level of values,
  #state.values contains the same values`, () => {
    const values = [buildMockCategoryFacetValue()];
    const response = buildMockCategoryFacetResponse({facetId, values});

    state.search.response.facets = [response];
    expect(insightCategoryFacet.state.values).toBe(values);
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
      expect(insightCategoryFacet.state.parents).toEqual([
        outerValue,
        middleValue,
      ]);
    });

    it('#state.values contains the innermost values', () => {
      expect(insightCategoryFacet.state.values).toBe(innerValues);
    });

    it('#state.parents contains the outer and middle values', () => {
      expect(insightCategoryFacet.state.parents).toEqual([
        outerValue,
        middleValue,
      ]);
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
      expect(insightCategoryFacet.state.parents).toEqual([selectedValue]);
    });

    it('#state.values is an empty array', () => {
      expect(insightCategoryFacet.state.values).toEqual([]);
    });
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

  describe('#state.hasActiveValues', () => {
    it('when there is a selected value, it is true', () => {
      const values = [buildMockCategoryFacetValue({state: 'selected'})];
      const response = buildMockCategoryFacetResponse({facetId, values});
      state.search.response.facets = [response];

      expect(insightCategoryFacet.state.hasActiveValues).toBe(true);
    });

    it('when nothing is selected, it is false', () => {
      const response = buildMockCategoryFacetResponse({facetId});
      state.search.response.facets = [response];

      expect(insightCategoryFacet.state.hasActiveValues).toBe(false);
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

        expect(insightCategoryFacet.state.canShowMoreValues).toBe(true);
      });

      it('if #moreValuesAvailable is false #state.canShowMoreValues is false', () => {
        const response = buildMockCategoryFacetResponse({
          facetId,
          moreValuesAvailable: false,
        });
        state.search.response.facets = [response];

        expect(insightCategoryFacet.state.canShowMoreValues).toBe(false);
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
        expect(insightCategoryFacet.state.canShowMoreValues).toBe(true);
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
        expect(insightCategoryFacet.state.canShowMoreValues).toBe(false);
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
        expect(insightCategoryFacet.state.canShowMoreValues).toBe(true);
      });
    });
  });

  describe('#state.canShowLessValues', () => {
    it('is false when there are 0 values being displayed', () => {
      expect(insightCategoryFacet.state.canShowLessValues).toBe(false);
    });

    it('is true when there are more than the initial numberOfValues being shown', () => {
      options.numberOfValues = 1;
      initInsightCategoryFacet();

      const value = buildMockCategoryFacetValue();
      const values = [value, value];
      const response = buildMockCategoryFacetResponse({facetId, values});
      state.search.response.facets = [response];

      expect(insightCategoryFacet.state.canShowLessValues).toBe(true);
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
