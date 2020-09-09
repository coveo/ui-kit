import {buildMockEngine, MockEngine} from '../../../test/mock-engine';
import {
  updateFacetSearch,
  executeFacetSearch,
  selectFacetSearchResult,
} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
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
import {SpecificFacetSearchState} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';

describe('FacetSearch', () => {
  const facetId = '1';
  let props: GenericFacetSearchProps<SpecificFacetSearchState>;
  let engine: MockEngine;
  let controller: GenericFacetSearch;

  function initFacetSearch() {
    controller = buildGenericFacetSearch(engine, props);
  }

  function getFacetSearch() {
    const options = buildMockFacetSearchRequestOptions({numberOfValues: 5});
    return buildMockFacetSearch({options});
  }

  beforeEach(() => {
    props = {
      options: {facetId},
      getFacetSearch,
    };

    engine = buildMockEngine();
    initFacetSearch();
  });

  it('#updateText dispatches #updateFacetSearch with the text wrapped by asterixes and resets number of results', () => {
    const text = 'apple';
    controller.updateText(text);

    const action = updateFacetSearch({
      facetId,
      query: `*${text}*`,
      numberOfValues: 10,
    });

    expect(engine.actions).toContainEqual(action);
  });

  describe('#showMoreResults', () => {
    beforeEach(() => {
      const options = buildMockFacetSearchRequestOptions({numberOfValues: 5});
      engine.state.facetSearchSet[facetId] = buildMockFacetSearch({options});
      controller.showMoreResults();
    });

    it('#showMoreResults dispatches #updateFacetSearch', () => {
      const incrementAction = updateFacetSearch({
        facetId,
        numberOfValues: 15,
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

  it('#select dispatches #selectFacetSearchResult action', () => {
    const value = buildMockFacetSearchResult();
    controller.select(value);

    const action = selectFacetSearchResult({facetId, value});
    expect(engine.actions).toContainEqual(action);
  });

  it('#select dispatches #executeSearch', () => {
    const value = buildMockFacetSearchResult();
    controller.select(value);

    const action = engine.actions.find(
      (a) => a.type === executeSearch.pending.type
    );
    expect(action).toBeTruthy();
  });

  it('calling #state returns the response', () => {
    const facetSearchState = {
      ...buildMockFacetSearchResponse(),
      isLoading: false,
    };

    engine.state.facetSearchSet[facetId] = buildMockFacetSearch(
      facetSearchState
    );
    expect(controller.state).toEqual(facetSearchState);
  });
});
