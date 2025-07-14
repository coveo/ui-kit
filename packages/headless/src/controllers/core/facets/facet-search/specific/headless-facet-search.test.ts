import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {CoreEngine} from '../../../../../app/engine.js';
import {
  executeFacetSearch,
  executeFieldSuggest,
} from '../../../../../features/facets/facet-search-set/generic/generic-facet-search-actions.js';
import {
  excludeFacetSearchResult,
  registerFacetSearch,
  selectFacetSearchResult,
} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-actions.js';
import {deselectAllFacetValues} from '../../../../../features/facets/facet-set/facet-set-actions.js';
import type {
  ConfigurationSection,
  FacetSearchSection,
} from '../../../../../state/state-sections.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../../../test/mock-engine-v2.js';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search.js';
import {buildMockFacetSearchResult} from '../../../../../test/mock-facet-search-result.js';
import {createMockState} from '../../../../../test/mock-state.js';
import type {CategoryFacetSearchResult} from '../../../../facets/category-facet/headless-category-facet.js';
import {
  buildFacetSearch,
  type FacetSearch,
  type FacetSearchProps,
} from './headless-facet-search.js';

vi.mock(
  '../../../../../features/facets/facet-search-set/specific/specific-facet-search-actions'
);
vi.mock('../../../../../features/facets/facet-set/facet-set-actions');

describe('FacetSearch', () => {
  const facetId = '1';
  let props: FacetSearchProps;
  let engine: MockedSearchEngine;
  let controller: FacetSearch;

  function initEngine() {
    const state = createMockState();
    state.facetSearchSet[facetId] = buildMockFacetSearch();
    engine = buildMockSearchEngine(state);
  }

  function initFacetSearch() {
    controller = buildFacetSearch(
      engine as CoreEngine<FacetSearchSection & ConfigurationSection>,
      props
    );
  }

  beforeEach(() => {
    props = {
      options: {facetId},
      select: vi.fn(),
      exclude: vi.fn(),
      isForFieldSuggestions: false,
      executeFacetSearchActionCreator: executeFacetSearch,
      executeFieldSuggestActionCreator: executeFieldSuggest,
    };

    initEngine();
    initFacetSearch();
  });

  it('on init, it dispatches a #registerFacetSearch action with the specified options', () => {
    expect(registerFacetSearch).toHaveBeenCalledWith(props.options);
  });

  it(`although the API returns an empty path for specific facet
  calling #state returns the values with only the relevant keys`, () => {
    const expectedValue = {count: 10, displayValue: 'Hello', rawValue: 'hello'};
    (engine.state.facetSearchSet![facetId].response
      .values as CategoryFacetSearchResult[]) = [{...expectedValue, path: []}];
    expect(controller.state.values[0]).toEqual(expectedValue);
  });

  describe('#select', () => {
    const value = buildMockFacetSearchResult();

    beforeEach(() => {
      controller.select(value);
    });

    it('dispatches #selectFacetSearchResult action', () => {
      expect(selectFacetSearchResult).toHaveBeenCalledWith({facetId, value});
    });

    it('calls the select prop #executeSearch action', () => {
      controller.select(value);
      expect(props.select).toHaveBeenCalled();
    });
  });

  describe('#exclude', () => {
    const value = buildMockFacetSearchResult();

    beforeEach(() => {
      controller.exclude(value);
    });

    it('dispatches #selectFacetSearchResult action', () => {
      expect(excludeFacetSearchResult).toHaveBeenCalledWith({facetId, value});
    });

    it('calls the exclude prop #executeSearch action', () => {
      controller.exclude(value);
      expect(props.exclude).toHaveBeenCalled();
    });
  });

  describe('#singleSelect', () => {
    const value = buildMockFacetSearchResult();

    beforeEach(() => {
      controller.singleSelect(value);
    });

    it('dispatches #deselectAllFacetValues action', () => {
      expect(deselectAllFacetValues).toHaveBeenCalledWith(facetId);
    });

    it('dispatches #selectFacetSearchResult action', () => {
      expect(selectFacetSearchResult).toHaveBeenCalledWith({facetId, value});
    });

    it('calls the select prop #executeSearch action', () => {
      controller.singleSelect(value);
      expect(props.select).toHaveBeenCalled();
    });
  });

  describe('#singleExclude', () => {
    const value = buildMockFacetSearchResult();

    beforeEach(() => {
      controller.singleExclude(value);
    });

    it('dispatches #deselectAllFacetValues action', () => {
      expect(deselectAllFacetValues).toHaveBeenCalledWith(facetId);
    });

    it('dispatches #excludeFacetSearchResult action', () => {
      expect(excludeFacetSearchResult).toHaveBeenCalledWith({facetId, value});
    });

    it('calls the exclude prop #executeSearch action', () => {
      controller.singleExclude(value);
      expect(props.exclude).toHaveBeenCalled();
    });
  });
});
