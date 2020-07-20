import {
  facetSearchController,
  FacetSearch,
  FacetSearchProps,
} from './headless-facet-search';
import {buildMockEngine, MockEngine} from '../../../test/mock-engine';
import {
  registerFacetSearch,
  updateFacetSearch,
  executeFacetSearch,
  selectFacetSearchResult,
} from '../../../features/facets/facet-search-set/facet-search-actions';
import {buildMockFacetSearchResponse} from '../../../test/mock-facet-search-response';
import {buildFacetSearch} from '../../../features/facets/facet-search-set/facet-search-set-slice';
import {buildMockFacetSearchResult} from '../../../test/mock-facet-search-result';
import {executeSearch} from '../../../features/search/search-actions';

describe('FacetSearch', () => {
  let props: FacetSearchProps;
  let engine: MockEngine;
  let controller: FacetSearch;

  function initFacetSearch() {
    controller = facetSearchController(engine, props);
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

  it('#updateText dispatches #updateFacetSearch with the text wrapped by asterixes', () => {
    const text = 'apple';
    controller.updateText(text);

    const facetId = getFacetId();
    const action = updateFacetSearch({facetId, query: `*${text}*`});

    expect(engine.actions).toContainEqual(action);
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
    const response = buildMockFacetSearchResponse();

    engine.state.facetSearchSet[facetId] = buildFacetSearch({response});
    expect(controller.state).toEqual(response);
  });
});
