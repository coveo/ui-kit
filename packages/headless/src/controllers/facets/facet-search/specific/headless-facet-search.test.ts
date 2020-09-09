import {
  buildFacetSearch,
  FacetSearch,
  FacetSearchProps,
} from './headless-facet-search';
import {buildMockEngine, MockEngine} from '../../../../test/mock-engine';
import {buildMockFacetSearch} from '../../../../test/mock-facet-search';
import {registerFacetSearch} from '../../../../features/facets/facet-search-set/specific/specific-facet-search-actions';

describe('FacetSearch', () => {
  const facetId = '1';
  let props: FacetSearchProps;
  let engine: MockEngine;
  let controller: FacetSearch;

  function initEngine() {
    engine = buildMockEngine();
    engine.state.facetSearchSet[facetId] = buildMockFacetSearch();
  }

  function initFacetSearch() {
    controller = buildFacetSearch(engine, props);
  }

  beforeEach(() => {
    props = {
      options: {facetId},
    };

    initEngine();
    initFacetSearch();
  });

  it('on init, it dispatches a #registerFacetSearch action with the specified options', () => {
    expect(engine.actions).toContainEqual(registerFacetSearch(props.options));
  });

  it('calling #state returns the latest state', () => {
    engine.state.facetSearchSet[facetId].isLoading = true;
    expect(controller.state.isLoading).toBe(true);
  });
});
