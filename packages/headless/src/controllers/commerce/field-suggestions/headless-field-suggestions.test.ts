import {
  executeCommerceFieldSuggest,
  getFacetIdWithCommerceFieldSuggestionNamespace,
} from '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../features/commerce/facets/facet-set/facet-set-slice.js';
import {fieldSuggestionsOrderReducer as fieldSuggestionsOrder} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-slice.js';
import {updateFacetSearch} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions.js';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice.js';
import {CommerceAppState} from '../../../state/commerce-app-state.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockFacetSearch} from '../../../test/mock-facet-search.js';
import {RegularFacetOptions} from '../core/facets/regular/headless-commerce-regular-facet.js';
import {
  buildFieldSuggestions,
  FieldSuggestions,
} from './headless-field-suggestions.js';

vi.mock(
  '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions'
);
vi.mock(
  '../../../features/facets/facet-search-set/specific/specific-facet-search-actions'
);

describe('fieldSuggestions', () => {
  const facetId = 'test';
  let state: CommerceAppState;
  let engine: MockedCommerceEngine;
  let fieldSuggestions: FieldSuggestions;
  let options: RegularFacetOptions;

  function initFieldSuggestions() {
    engine = buildMockCommerceEngine(state);
    fieldSuggestions = buildFieldSuggestions(engine, options);
  }

  function setFacetSearchRequest() {
    state.facetSearchSet[
      getFacetIdWithCommerceFieldSuggestionNamespace(facetId)
    ] = buildMockFacetSearch({
      initialNumberOfValues: 5,
    });
  }

  beforeEach(() => {
    vi.resetAllMocks();
    options = {
      facetId,
      fetchProductsActionCreator: vi.fn(),
      facetResponseSelector: vi.fn(),
      isFacetLoadingResponseSelector: vi.fn(),
      facetSearch: {type: 'SEARCH'},
    };

    state = buildMockCommerceState();
    setFacetSearchRequest();

    initFieldSuggestions();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      fieldSuggestionsOrder,
      commerceFacetSet,
      facetSearchSet,
    });
  });

  it('should dispatch an #updateFacetSearch and #executeFieldSuggest action on #updateText', () => {
    fieldSuggestions.updateText('foo');
    expect(updateFacetSearch).toHaveBeenCalled();
    expect(executeCommerceFieldSuggest).toHaveBeenCalled();
  });
});
