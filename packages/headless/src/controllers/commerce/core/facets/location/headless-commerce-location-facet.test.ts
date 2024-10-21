import {LocationFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request.js';
import {
  toggleExcludeLocationFacetValue,
  toggleSelectLocationFacetValue,
} from '../../../../../features/commerce/facets/location-facet/location-facet-actions.js';
import {CommerceAppState} from '../../../../../state/commerce-app-state.js';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request.js';
import {buildMockCommerceLocationFacetResponse} from '../../../../../test/mock-commerce-facet-response.js';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice.js';
import {buildMockCommerceLocationFacetValue} from '../../../../../test/mock-commerce-facet-value.js';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state.js';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine-v2.js';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search.js';
import {
  LocationFacet,
  LocationFacetOptions,
  buildCommerceLocationFacet,
} from './headless-commerce-location-facet.js';

vi.mock(
  '../../../../../features/commerce/facets/location-facet/location-facet-actions'
);

describe('LocationFacet', () => {
  const facetId: string = 'location_facet_id';
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let options: LocationFacetOptions;
  let facet: LocationFacet;
  const facetResponseSelector = vi.fn();

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initFacet() {
    facet = buildCommerceLocationFacet(engine, options);
  }

  function setFacetRequest(config: Partial<LocationFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.productListing.facets = [
      buildMockCommerceLocationFacetResponse({facetId}),
    ];
    state.facetSearchSet[facetId] = buildMockFacetSearch();
    facetResponseSelector.mockReturnValue(
      buildMockCommerceLocationFacetResponse({facetId})
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

  it('#toggleSelect dispatches #toggleSelectLocationFacetValue with correct payload', () => {
    const facetValue = buildMockCommerceLocationFacetValue({value: 'TED'});
    facet.toggleSelect(facetValue);

    expect(toggleSelectLocationFacetValue).toHaveBeenCalledWith({
      facetId,
      selection: facetValue,
    });
  });

  it('#toggleExclude dispatches #toggleExcludeLocationFacetValue with correct payload', () => {
    const facetValue = buildMockCommerceLocationFacetValue({value: 'TED'});
    facet.toggleExclude(facetValue);

    expect(toggleExcludeLocationFacetValue).toHaveBeenCalledWith({
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

  it('#type returns "location"', () => {
    expect(facet.type).toBe('location');
  });
});
