import {buildMockSearchAppEngine, MockEngine} from '../../../test/mock-engine';
import {updateFacetSearch} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {buildMockFacetSearchResponse} from '../../../test/mock-facet-search-response';
import {buildMockFacetSearch} from '../../../test/mock-facet-search';
import {buildMockFacetSearchResult} from '../../../test/mock-facet-search-result';
import {executeSearch} from '../../../features/search/search-actions';
import {buildMockFacetSearchStateOptions} from '../../../test/mock-facet-search-state-options';
import {
  buildGenericFacetSearch,
  GenericFacetSearch,
  GenericFacetSearchProps,
} from './facet-search';
import {SpecificFacetSearchState} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {
  clearFacetSearchResults,
  executeFacetSearch,
} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions';
import {SearchAppState} from '../../../state/search-app-state';
import {defaultFacetSearchOptions} from '../../../features/facets/facet-search-set/facet-search-reducer-helpers';

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
    const options = buildMockFacetSearchStateOptions({
      numberOfValues,
      initialNumberOfValues: numberOfValues,
    });
    return buildMockFacetSearch({options});
  }

  beforeEach(() => {
    props = {
      options: {facetId},
      getFacetSearch,
    };

    engine = buildMockSearchAppEngine();
    initFacetSearch();
  });

  it('#updateText dispatches #updateFacetSearch with the text wrapped by asterixes and resets number of results', () => {
    const text = 'apple';
    controller.updateText(text);

    const action = updateFacetSearch({
      facetId,
      query: `*${text}*`,
      numberOfValues,
    });

    expect(engine.actions).toContainEqual(action);
  });

  describe('#showMoreResults', () => {
    beforeEach(() => {
      const options = buildMockFacetSearchStateOptions({
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

  describe('#clear', () => {
    beforeEach(() => {
      const options = buildMockFacetSearchStateOptions();
      engine.state.facetSearchSet[facetId] = buildMockFacetSearch({
        options,
      });
      controller.clear();
    });

    it('#clear dispatches #updateFacetSearch', () => {
      const updateFacetSearchAction = updateFacetSearch({
        facetId,
        query: defaultFacetSearchOptions.query,
      });

      expect(engine.actions).toContainEqual(updateFacetSearchAction);
    });

    it('#clear dispatches #clearFacetSearchResults', () => {
      const clearFacetSearchResultsAction = clearFacetSearchResults({
        facetId,
      });

      expect(engine.actions).toContainEqual(clearFacetSearchResultsAction);
    });
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
