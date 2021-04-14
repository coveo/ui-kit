import {
  buildFacetSearch,
  FacetSearch,
  FacetSearchProps,
} from './headless-facet-search';
import {
  buildMockSearchAppEngine,
  MockEngine,
} from '../../../../test/mock-engine';
import {buildMockFacetSearch} from '../../../../test/mock-facet-search';
import {
  registerFacetSearch,
  selectFacetSearchResult,
} from '../../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {executeSearch} from '../../../../features/search/search-actions';
import {buildMockFacetSearchResult} from '../../../../test/mock-facet-search-result';
import {SearchAppState} from '../../../../state/search-app-state';
import {CategoryFacetSearchResult} from '../../category-facet/headless-category-facet';

describe('FacetSearch', () => {
  const facetId = '1';
  let props: FacetSearchProps;
  let engine: MockEngine<SearchAppState>;
  let controller: FacetSearch;

  function initEngine() {
    engine = buildMockSearchAppEngine();
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

  it(`althought the API returns an empty path for specific facet
  calling #state returns the values with only the relevant keys`, () => {
    const expectedValue = {count: 10, displayValue: 'Hello', rawValue: 'hello'};
    (engine.state.facetSearchSet[facetId].response
      .values as CategoryFacetSearchResult[]) = [{...expectedValue, path: []}];
    expect(controller.state.values[0]).toEqual(expectedValue);
  });

  describe('#select', () => {
    const value = buildMockFacetSearchResult();

    beforeEach(() => {
      controller.select(value);
    });

    it('#select dispatches #selectFacetSearchResult action', () => {
      const action = selectFacetSearchResult({
        facetId,
        value,
      });
      expect(engine.actions).toContainEqual(action);
    });

    it('#select dispatches #executeSearch action', () => {
      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });
});
