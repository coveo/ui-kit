import {buildMockSearchAppEngine, MockEngine} from '../../../test/mock-engine';
import {updateFacetSearch} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {buildMockFacetSearchResponse} from '../../../test/mock-facet-search-response';
import {buildMockFacetSearch} from '../../../test/mock-facet-search';
import {buildMockFacetSearchResult} from '../../../test/mock-facet-search-result';
import {executeSearch} from '../../../features/search/search-actions';
import {buildMockFacetSearchRequestOptions} from '../../../test/mock-facet-search-request-options';
import {
  buildGenericFacetSearch,
  GenericFacetSearch,
  GenericFacetSearchProps,
} from './facet-search';
import {SpecificFacetSearchState} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {
  clearFacetSearch,
  executeFacetSearch,
} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions';
import {SearchAppState} from '../../../state/search-app-state';

describe('FacetSearch', () => {
  const facetId = '1';
  const numberOfValues = 7;
  let props: GenericFacetSearchProps<SpecificFacetSearchState>;
  let engine: MockEngine<SearchAppState>;
  let controller: GenericFacetSearch;

  function initFacetSearch() {
    controller = buildGenericFacetSearch(engine, props);
  }

  function getFacetSearch() {
    const options = buildMockFacetSearchRequestOptions({
      numberOfValues,
    });
    return buildMockFacetSearch({
      options,
      initialNumberOfValues: numberOfValues,
    });
  }

  beforeEach(() => {
    props = {
      options: {facetId},
      getFacetSearch,
    };

    engine = buildMockSearchAppEngine();
    initFacetSearch();
  });

  it('#updateText dispatches #updateFacetSearch and resets number of results', () => {
    const text = 'apple';
    controller.updateText(text);

    const action = updateFacetSearch({
      facetId,
      query: text,
      numberOfValues,
    });

    expect(engine.actions).toContainEqual(action);
  });

  describe('#showMoreResults', () => {
    beforeEach(() => {
      const options = buildMockFacetSearchRequestOptions({
        numberOfValues,
      });
      engine.state.facetSearchSet[facetId] = buildMockFacetSearch({
        options,
      });
      controller.showMoreResults();
    });

    it('#showMoreResults dispatches #updateFacetSearch', () => {
      const incrementAction = updateFacetSearch({
        facetId,
        numberOfValues: numberOfValues * 2,
      });

      expect(engine.actions).toContainEqual(incrementAction);
    });

    it('#showMoreResults dispatches #executeFacetSearch', () => {
      const executeAction = engine.actions.find(
        (a) => a.type === executeFacetSearch.pending.type
      );

      expect(engine.actions).toContainEqual(executeAction);
    });
  });

  it('#search dispatches #executeFacetSearch action', () => {
    controller.search();
    const action = engine.actions.find(
      (a) => a.type === executeFacetSearch.pending.type
    );

    expect(action).toBeTruthy();
  });

  describe('#select', () => {
    beforeEach(() => {
      const value = buildMockFacetSearchResult();
      controller.select(value);
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('dispatches #executeSearch', () => {
      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  it('#clear dispatches #clearFacetSearch', () => {
    const options = buildMockFacetSearchRequestOptions();
    engine.state.facetSearchSet[facetId] = buildMockFacetSearch({
      options,
    });
    controller.clear();
    const clearFacetSearchAction = clearFacetSearch({
      facetId,
    });

    expect(engine.actions).toContainEqual(clearFacetSearchAction);
  });

  it('calling #state returns the response', () => {
    const facetSearchState = {
      ...buildMockFacetSearchResponse(),
      isLoading: false,
      query: '',
    };

    engine.state.facetSearchSet[facetId] = buildMockFacetSearch(
      facetSearchState
    );
    expect(controller.state).toEqual(facetSearchState);
  });
});
