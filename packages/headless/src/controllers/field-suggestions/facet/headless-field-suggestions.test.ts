import {executeFieldSuggest} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions';
import {updateFacetSearch} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {registerFacet} from '../../../features/facets/facet-set/facet-set-actions';
import {defaultFacetOptions} from '../../../features/facets/facet-set/facet-set-slice';
import {FacetRequest} from '../../../features/facets/facet-set/interfaces/request';
import {SearchAppState} from '../../../state/search-app-state';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../test/mock-engine-v2';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {buildMockFacetSearch} from '../../../test/mock-facet-search';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice';
import {createMockState} from '../../../test/mock-state';
import {
  buildFieldSuggestions,
  FieldSuggestions,
  FieldSuggestionsOptions,
} from './headless-field-suggestions';

jest.mock('../../../features/facets/facet-set/facet-set-actions');
jest.mock(
  '../../../features/facets/facet-search-set/generic/generic-facet-search-actions'
);
jest.mock(
  '../../../features/facets/facet-search-set/specific/specific-facet-search-actions'
);

describe('fieldSuggestions', () => {
  const field = 'author';
  const facetId = 'test';
  let state: SearchAppState;
  let engine: MockedSearchEngine;
  let fieldSuggestions: FieldSuggestions;
  let options: FieldSuggestionsOptions;

  function initFacet() {
    engine = buildMockSearchEngine(state);
    fieldSuggestions = buildFieldSuggestions(engine, {options});
  }

  function setFacetRequest(config: Partial<FacetRequest> = {}) {
    state.facetSet[facetId] = buildMockFacetSlice({
      request: buildMockFacetRequest({facetId, ...config}),
    });
    state.facetSearchSet[facetId] = buildMockFacetSearch({
      initialNumberOfValues: 5,
    });
  }

  beforeEach(() => {
    jest.resetAllMocks();
    options = {
      facet: {
        facetId,
        field: 'author',
      },
    };

    state = createMockState();
    setFacetRequest();

    initFacet();
  });

  it('should dispatch an #registerFacet action when initialized', () => {
    expect(registerFacet).toHaveBeenCalledWith({
      ...defaultFacetOptions,
      facetId,
      field,
    });
  });

  it('should dispatch an #updateFacetSearch and #executeFieldSuggest action on #updateText', () => {
    fieldSuggestions.updateText('foo');
    expect(updateFacetSearch).toHaveBeenCalled();
    expect(executeFieldSuggest).toHaveBeenCalled();
  });
});
