import {CommerceFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../../features/facets/facet-set/facet-set-actions';
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
import {commonOptions} from '../../../product-listing/facets/headless-product-listing-facet-options';
import {FacetValueRequest} from '../headless-core-commerce-facet';
import {
  RegularFacet,
  RegularFacetOptions,
  buildCommerceRegularFacet,
} from './headless-commerce-regular-facet';

jest.mock('../../../../../features/facets/facet-set/facet-set-actions');

describe('RegularFacet', () => {
  const facetId: string = 'regular_facet_id';
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let options: RegularFacetOptions;
  let facet: RegularFacet;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initCommerceRegularFacet() {
    facet = buildCommerceRegularFacet(engine, options);
  }

  function setFacetRequest(
    config: Partial<CommerceFacetRequest<FacetValueRequest>> = {}
  ) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.productListing.facets = [
      buildMockCommerceRegularFacetResponse({facetId}),
    ];
  }

  function setFacetSearch() {
    state.facetSearchSet[facetId] = buildMockFacetSearch();
  }

  beforeEach(() => {
    jest.resetAllMocks();

    options = {
      facetId,
      ...commonOptions,
    };

    state = buildMockCommerceState();
    setFacetRequest();
    setFacetSearch();

    initEngine(state);
    initCommerceRegularFacet();
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
});
