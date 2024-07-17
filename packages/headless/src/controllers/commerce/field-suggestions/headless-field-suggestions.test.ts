import {executeCommerceFieldSuggest} from '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions';
import {RegularFacetRequest} from '../../../features/commerce/facets/facet-set/interfaces/request';
import {updateFacetSearch} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {CommerceAppState} from '../../../state/commerce-app-state';
import {buildMockCommerceFacetRequest} from '../../../test/mock-commerce-facet-request';
import {buildMockCommerceFacetSlice} from '../../../test/mock-commerce-facet-slice';
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

  function initFacet() {
    engine = buildMockCommerceEngine(state);
    fieldSuggestions = buildFieldSuggestions(engine, options);
  }

  function setFacetRequest(config: Partial<RegularFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.facetSearchSet[facetId] = buildMockFacetSearch({
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
    setFacetRequest();

    initFacet();
  });

  it('should dispatch an #updateFacetSearch and #executeFieldSuggest action on #updateText', () => {
    fieldSuggestions.updateText('foo');
    expect(updateFacetSearch).toHaveBeenCalled();
    expect(executeCommerceFieldSuggest).toHaveBeenCalled();
  });
});
