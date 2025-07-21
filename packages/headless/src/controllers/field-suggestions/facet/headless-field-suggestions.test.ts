import {executeFieldSuggest} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions.js';
import {updateFacetSearch} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions.js';
import {registerFacet} from '../../../features/facets/facet-set/facet-set-actions.js';
import {defaultFacetOptions} from '../../../features/facets/facet-set/facet-set-slice.js';
import type {FacetRequest} from '../../../features/facets/facet-set/interfaces/request.js';
import type {SearchAppState} from '../../../state/search-app-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockFacetRequest} from '../../../test/mock-facet-request.js';
import {buildMockFacetSearch} from '../../../test/mock-facet-search.js';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  buildFieldSuggestions,
  type FieldSuggestions,
  type FieldSuggestionsOptions,
} from './headless-field-suggestions.js';

vi.mock('../../../features/facets/facet-set/facet-set-actions');
vi.mock(
  '../../../features/facets/facet-search-set/generic/generic-facet-search-actions'
);
vi.mock(
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
    vi.resetAllMocks();
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
