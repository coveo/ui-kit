import {RegularFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../../features/commerce/facets/regular-facet/regular-facet-actions';
import {CommerceAppState} from '../../../../../state/commerce-app-state';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {buildMockCommerceRegularFacetResponse} from '../../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceRegularFacetValue} from '../../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine-v2';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search';
import {
  RegularFacet,
  RegularFacetOptions,
  buildCommerceRegularFacet,
} from './headless-commerce-regular-facet';

jest.mock(
  '../../../../../features/commerce/facets/regular-facet/regular-facet-actions'
);

describe('RegularFacet', () => {
  const facetId: string = 'regular_facet_id';
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let options: RegularFacetOptions;
  let facet: RegularFacet;

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
