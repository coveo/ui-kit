import {FacetType} from '../../../../../features/commerce/facets/facet-set/interfaces/common';
import {NumericFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
  updateManualNumericFacetRange,
  updateNumericFacetValues,
} from '../../../../../features/commerce/facets/numeric-facet/numeric-facet-actions';
import {CommerceAppState} from '../../../../../state/commerce-app-state';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {buildMockCommerceNumericFacetResponse} from '../../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceNumericFacetValue} from '../../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../../test/mock-engine-v2';
import {NumericRangeRequest} from '../headless-core-commerce-facet';
import {
  NumericFacet,
  NumericFacetOptions,
  buildCommerceNumericFacet,
} from './headless-commerce-numeric-facet';

jest.mock(
  '../../../../../features/commerce/facets/numeric-facet/numeric-facet-actions'
);

jest.mock(
  '../../../../../features/commerce/product-listing/product-listing-actions'
);

describe('NumericFacet', () => {
  const facetId: string = 'numeric_facet_id';
  const type: FacetType = 'numericalRange';
  const start = 0;
  const end = 100;
  const facetResponseSelector = jest.fn();
  const fetchProductsActionCreator = jest.fn();
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
    jest.resetAllMocks();

    options = {
      facetId,
      fetchProductsActionCreator,
      facetResponseSelector,
      isFacetLoadingResponseSelector: jest.fn(),
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
    let values: NumericRangeRequest[];
    beforeEach(() => {
      values = [buildMockCommerceNumericFacetValue()].map(
        ({start, end, endInclusive, state}) => ({
          start,
          end,
          endInclusive,
          state,
        })
      );
      facet.setRanges(values);
    });
    it('dispatches #updateNumericFacetValues with the correct payload', () => {
      expect(updateNumericFacetValues).toHaveBeenCalledWith({
        facetId,
        values: values.map((value) => ({...value, numberOfResults: 0})),
      });
    });

    it('dispatches #fetchProductsActionCreator', () => {
      expect(fetchProductsActionCreator).toHaveBeenCalledTimes(1);
    });
  });

  describe('#setManualRange', () => {
    let range: NumericRangeRequest;
    beforeEach(() => {
      range = {start, end, endInclusive: true, state: 'selected'};
      facet.setManualRange(range);
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
