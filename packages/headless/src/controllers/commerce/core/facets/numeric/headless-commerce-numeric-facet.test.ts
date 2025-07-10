import type {FacetType} from '../../../../../features/commerce/facets/facet-set/interfaces/common.js';
import type {NumericFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request.js';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
  updateManualNumericFacetRange,
} from '../../../../../features/commerce/facets/numeric-facet/numeric-facet-actions.js';
import type {CommerceAppState} from '../../../../../state/commerce-app-state.js';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request.js';
import {buildMockCommerceNumericFacetResponse} from '../../../../../test/mock-commerce-facet-response.js';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice.js';
import {buildMockCommerceNumericFacetValue} from '../../../../../test/mock-commerce-facet-value.js';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../../../test/mock-engine-v2.js';
import type {NumericRangeRequest} from '../headless-core-commerce-facet.js';
import {
  buildCommerceNumericFacet,
  type NumericFacet,
  type NumericFacetOptions,
} from './headless-commerce-numeric-facet.js';

vi.mock(
  '../../../../../features/commerce/facets/numeric-facet/numeric-facet-actions'
);

vi.mock(
  '../../../../../features/commerce/product-listing/product-listing-actions'
);

describe('NumericFacet', () => {
  const facetId: string = 'numeric_facet_id';
  const type: FacetType = 'numericalRange';
  const start = 0;
  const end = 100;
  const facetResponseSelector = vi.fn();
  const fetchProductsActionCreator = vi.fn();
  let options: NumericFacetOptions;
  let state: CommerceAppState;
  let engine: MockedCommerceEngine;
  let facet: NumericFacet;

  function initFacet() {
    engine = buildMockCommerceEngine(state);
    facet = buildCommerceNumericFacet(engine, options);
  }

  function setFacetRequest(config: Partial<NumericFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, type, ...config}),
    });
    facetResponseSelector.mockReturnValue(
      buildMockCommerceNumericFacetResponse({facetId})
    );
  }

  beforeEach(() => {
    vi.resetAllMocks();

    options = {
      facetId,
      fetchProductsActionCreator,
      facetResponseSelector,
      isFacetLoadingResponseSelector: vi.fn(),
    };

    state = buildMockCommerceState();
    setFacetRequest();

    initFacet();
  });

  it('initializes', () => {
    expect(facet).toBeTruthy();
  });

  it('exposes #subscribe method', () => {
    expect(facet.subscribe).toBeTruthy();
  });

  describe('#toggleSelect', () => {
    it('dispatches #toggleSelectNumericFacetValue', () => {
      const facetValue = buildMockCommerceNumericFacetValue({start, end});
      facet.toggleSelect(facetValue);
      expect(toggleSelectNumericFacetValue).toHaveBeenCalledWith({
        facetId,
        selection: facetValue,
      });
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches #toggleExcludeNumericFacetValue', () => {
      const facetValue = buildMockCommerceNumericFacetValue({start, end});
      facet.toggleExclude(facetValue);
      expect(toggleExcludeNumericFacetValue).toHaveBeenCalledWith({
        facetId,
        selection: facetValue,
      });
    });
  });

  describe('#setRanges', () => {
    let range: NumericRangeRequest;
    beforeEach(() => {
      range = {start, end, endInclusive: true, state: 'selected'};
      facet.setRanges([range]);
    });
    it('dispatches #updateManualNumericFacetRange with the correct payload', () => {
      expect(engine.dispatch).toHaveBeenCalledWith(
        updateManualNumericFacetRange({facetId, ...range})
      );
    });

    it('dispatches #fetchProductsActionCreator', () => {
      expect(fetchProductsActionCreator).toHaveBeenCalledTimes(1);
    });
  });

  describe('#state', () => {
    it('includes #domain if present in the response state', () => {
      const domain = {increment: 1, max: 100, min: 0};
      facetResponseSelector.mockReturnValue(
        buildMockCommerceNumericFacetResponse({facetId, domain})
      );

      initFacet();

      expect(facet.state.domain).toEqual({min: domain.min, max: domain.max});
    });

    it('does not include #domain if not present in the response state', () => {
      expect(facet.state.domain).toBeUndefined();
    });
  });

  it('#type returns "numericalRange"', () => {
    expect(facet.type).toBe('numericalRange');
  });
});
