import {CoreEngine} from '../../../../app/engine';
import {
  clearFacetSearch,
  executeFacetSearch,
  executeFieldSuggest,
} from '../../../../features/facets/facet-search-set/generic/generic-facet-search-actions';
import {updateFacetSearch} from '../../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {SpecificFacetSearchState} from '../../../../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {
  ConfigurationSection,
  FacetSearchSection,
} from '../../../../state/state-sections';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../../test/mock-engine-v2';
import {buildMockFacetSearch} from '../../../../test/mock-facet-search';
import {buildMockFacetSearchRequestOptions} from '../../../../test/mock-facet-search-request-options';
import {buildMockFacetSearchResponse} from '../../../../test/mock-facet-search-response';
import {createMockState} from '../../../../test/mock-state';
import {
  buildGenericFacetSearch,
  GenericFacetSearch,
  GenericFacetSearchProps,
} from './facet-search';

jest.mock(
  '../../../../features/facets/facet-search-set/generic/generic-facet-search-actions'
);
jest.mock(
  '../../../../features/facets/facet-search-set/specific/specific-facet-search-actions'
);

describe('FacetSearch', () => {
  const facetId = '1';
  const numberOfValues = 7;
  let props: GenericFacetSearchProps<SpecificFacetSearchState>;
  let engine: MockedSearchEngine;
  let controller: GenericFacetSearch;

  function initFacetSearch() {
    controller = buildGenericFacetSearch(
      engine as CoreEngine<ConfigurationSection & FacetSearchSection>,
      props
    );
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
      isForFieldSuggestions: false,
      executeFacetSearchActionCreator: executeFacetSearch,
      executeFieldSuggestActionCreator: executeFieldSuggest,
    };

    const state = createMockState();

    engine = buildMockSearchEngine(state);
    initFacetSearch();
  });

  it('#updateText dispatches #updateFacetSearch and resets number of results', () => {
    const text = 'apple';
    controller.updateText(text);
    expect(updateFacetSearch).toHaveBeenCalledWith({
      facetId,
      query: text,
      numberOfValues,
    });
  });

  describe('#showMoreResults', () => {
    beforeEach(() => {
      const options = buildMockFacetSearchRequestOptions({
        numberOfValues,
      });
      engine.state.facetSearchSet![facetId] = buildMockFacetSearch({
        options,
      });
      controller.showMoreResults();
    });

    it('#showMoreResults dispatches #updateFacetSearch', () => {
      expect(updateFacetSearch).toHaveBeenCalledWith({
        facetId,
        numberOfValues: numberOfValues * 2,
      });
    });

    it('#showMoreResults dispatches #executeFacetSearch', () => {
      expect(executeFacetSearch).toHaveBeenCalled();
    });
  });

  it('#search dispatches #executeFacetSearch action', () => {
    controller.search();
    expect(executeFacetSearch).toHaveBeenCalled();
  });

  it('#clear dispatches #clearFacetSearch', () => {
    const options = buildMockFacetSearchRequestOptions();
    engine.state.facetSearchSet![facetId] = buildMockFacetSearch({
      options,
    });
    controller.clear();

    expect(clearFacetSearch).toHaveBeenCalledWith({facetId});
  });

  it('#updateCaptions dispatches #updateFacetSearch with the new captions', () => {
    const captions = {hello: 'world'};
    controller.updateCaptions({hello: 'world'});
    expect(updateFacetSearch).toHaveBeenCalledWith({facetId, captions});
  });

  it('calling #state returns the response', () => {
    const facetSearchState = {
      ...buildMockFacetSearchResponse(),
      isLoading: false,
      query: '',
    };

    engine.state.facetSearchSet![facetId] =
      buildMockFacetSearch(facetSearchState);
    expect(controller.state).toEqual(facetSearchState);
  });
});
