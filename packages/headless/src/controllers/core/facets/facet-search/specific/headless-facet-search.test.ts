import {
  registerFacetSearch,
  selectFacetSearchResult,
} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {deselectAllFacetValues} from '../../../../../features/facets/facet-set/facet-set-actions';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../../../../test/mock-engine';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search';
import {buildMockFacetSearchResult} from '../../../../../test/mock-facet-search-result';
import {CategoryFacetSearchResult} from '../../../../facets/category-facet/headless-category-facet';
import {
  buildFacetSearch,
  FacetSearch,
  FacetSearchProps,
} from './headless-facet-search';

describe('FacetSearch', () => {
  const facetId = '1';
  let props: FacetSearchProps;
  let engine: MockSearchEngine;
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
      select: jest.fn(),
      isForFieldSuggestions: false,
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

  it(`although the API returns an empty path for specific facet
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

    it('dispatches #selectFacetSearchResult action', () => {
      const action = selectFacetSearchResult({
        facetId,
        value,
      });
      expect(engine.actions).toContainEqual(action);
    });

    it('calls the select prop #executeSearch action', () => {
      expect(props.select).toHaveBeenCalled();
    });
  });

  describe('#singleSelect', () => {
    const value = buildMockFacetSearchResult();

    beforeEach(() => {
      controller.singleSelect(value);
    });

    it('dispatches #deselectAllFacetValues action', () => {
      const action = deselectAllFacetValues(facetId);
      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches #selectFacetSearchResult action', () => {
      const action = selectFacetSearchResult({
        facetId,
        value,
      });
      expect(engine.actions).toContainEqual(action);
    });

    it('calls the select prop #executeSearch action', () => {
      expect(props.select).toHaveBeenCalled();
    });
  });
});
