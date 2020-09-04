import {
  buildFacetSearch,
  FacetSearch,
  FacetSearchProps,
} from './headless-facet-search';
import {buildMockEngine, MockEngine} from '../../../test/mock-engine';
import {buildMockFacetSearchResponse} from '../../../test/mock-facet-search-response';
import {buildMockFacetSearch} from '../../../test/mock-facet-search';
import {buildMockFacetSearchResult} from '../../../test/mock-facet-search-result';
import {executeSearch} from '../../../features/search/search-actions';
import {buildMockFacetSearchRequestOptions} from '../../../test/mock-facet-search-request-options';
import {
  registerFacetSearch,
  updateFacetSearch,
  executeFacetSearch,
  selectFacetSearchResult,
} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions';

describe('FacetSearch', () => {
  let props: FacetSearchProps;
  let engine: MockEngine;
  let controller: FacetSearch;

  function initFacetSearch() {
    controller = buildFacetSearch(engine, props);
  }

  function getFacetId() {
    return props.options.facetId;
  }

  beforeEach(() => {
    props = {
      options: {
        facetId: '',
      },
    };

    engine = buildMockEngine();
    initFacetSearch();
  });

  it('on init, it dispatches a #registerFacetSearch action with the specified options', () => {
    expect(engine.actions).toContainEqual(registerFacetSearch(props.options));
  });

  it('#updateText dispatches #updateFacetSearch with the text wrapped by asterixes and resets number of results', () => {
    const text = 'apple';
    controller.updateText(text);

    const facetId = getFacetId();
    const action = updateFacetSearch({
      facetId,
      query: `*${text}*`,
      numberOfValues: 10,
    });

    expect(engine.actions).toContainEqual(action);
  });

  describe('#showMoreResults', () => {
    beforeEach(() => {
      const facetId = getFacetId();
      const options = buildMockFacetSearchRequestOptions({numberOfValues: 5});
      engine.state.facetSearchSet[facetId] = buildMockFacetSearch({options});
      controller.showMoreResults();
    });

    it('#showMoreResults dispatches #updateFacetSearch', () => {
      const facetId = getFacetId();
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

    const action = selectFacetSearchResult({facetId: getFacetId(), value});
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
    const facetId = getFacetId();
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
