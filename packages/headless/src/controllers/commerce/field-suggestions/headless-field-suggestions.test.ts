import {
  executeCommerceFieldSuggest,
  getFacetIdWithCommerceFieldSuggestionNamespace,
} from '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../features/commerce/facets/facet-set/facet-set-slice';
import {fieldSuggestionsOrderReducer as fieldSuggestionsOrder} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-slice';
import {updateFacetSearch} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {CommerceAppState} from '../../../state/commerce-app-state';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../test/mock-engine-v2';
import {buildMockFacetSearch} from '../../../test/mock-facet-search';
import {RegularFacetOptions} from '../core/facets/regular/headless-commerce-regular-facet';
import {
  buildFieldSuggestions,
  FieldSuggestions,
} from './headless-field-suggestions';

jest.mock(
  '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions'
);
jest.mock(
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
    jest.resetAllMocks();
    options = {
      facetId,
      fetchProductsActionCreator: jest.fn(),
      facetResponseSelector: jest.fn(),
      isFacetLoadingResponseSelector: jest.fn(),
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
