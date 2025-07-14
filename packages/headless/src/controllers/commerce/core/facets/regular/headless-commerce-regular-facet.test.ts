import type {RegularFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request.js';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../../features/commerce/facets/regular-facet/regular-facet-actions.js';
import type {CommerceAppState} from '../../../../../state/commerce-app-state.js';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request.js';
import {buildMockCommerceRegularFacetResponse} from '../../../../../test/mock-commerce-facet-response.js';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice.js';
import {buildMockCommerceRegularFacetValue} from '../../../../../test/mock-commerce-facet-value.js';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../../../test/mock-engine-v2.js';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search.js';
import {
  buildCommerceRegularFacet,
  type RegularFacet,
  type RegularFacetOptions,
} from './headless-commerce-regular-facet.js';

vi.mock(
  '../../../../../features/commerce/facets/regular-facet/regular-facet-actions'
);

describe('RegularFacet', () => {
  const facetId: string = 'regular_facet_id';
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let options: RegularFacetOptions;
  let facet: RegularFacet;
  const facetResponseSelector = vi.fn();

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initFacet() {
    facet = buildCommerceRegularFacet(engine, options);
  }

  function setFacetRequest(config: Partial<RegularFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.productListing.facets = [
      buildMockCommerceRegularFacetResponse({facetId}),
    ];
    state.facetSearchSet[facetId] = buildMockFacetSearch();
    facetResponseSelector.mockReturnValue(
      buildMockCommerceRegularFacetResponse({facetId})
    );
  }

  beforeEach(() => {
    vi.resetAllMocks();

    options = {
      facetId,
      fetchProductsActionCreator: vi.fn(),
      facetResponseSelector,
      isFacetLoadingResponseSelector: vi.fn(),
      facetSearch: {type: 'SEARCH'},
    };

    state = buildMockCommerceState();
    setFacetRequest();

    initEngine(state);
    initFacet();
  });

  describe('initialization', () => {
    it('initializes', () => {
      expect(facet).toBeTruthy();
    });

    it('exposes #subscribe method', () => {
      expect(facet.subscribe).toBeTruthy();
    });
  });

  it('#toggleSelect dispatches #toggleSelectFacetValue with correct payload', () => {
    const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
    facet.toggleSelect(facetValue);

    expect(toggleSelectFacetValue).toHaveBeenCalledWith({
      facetId,
      selection: facetValue,
    });
  });

  it('#toggleExclude dispatches #toggleExcludeFacetValue with correct payload', () => {
    const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
    facet.toggleExclude(facetValue);

    expect(toggleExcludeFacetValue).toHaveBeenCalledWith({
      facetId,
      selection: facetValue,
    });
  });

  it('#state.facetSearch returns the facet search state', () => {
    const facetSearchState = buildMockFacetSearch();
    facetSearchState.isLoading = true;
    facetSearchState.response.moreValuesAvailable = true;
    facetSearchState.options.query = 'test';
    facetSearchState.response.values = [
      {count: 1, displayValue: 'test', rawValue: 'test'},
    ];

    state.facetSearchSet[facetId] = facetSearchState;

    expect(facet.state.facetSearch).toEqual({
      isLoading: true,
      moreValuesAvailable: true,
      query: 'test',
      values: [{count: 1, displayValue: 'test', rawValue: 'test'}],
    });
  });

  it('#type returns "regular"', () => {
    expect(facet.type).toBe('regular');
  });
});
