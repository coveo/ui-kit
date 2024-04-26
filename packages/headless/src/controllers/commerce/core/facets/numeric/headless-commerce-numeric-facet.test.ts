import {CommerceFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {FacetType} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
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
import {commonOptions} from '../../../product-listing/facets/headless-product-listing-facet-options';
import {NumericRangeRequest} from '../headless-core-commerce-facet';
import {
  NumericFacet,
  NumericFacetOptions,
  buildCommerceNumericFacet,
} from './headless-commerce-numeric-facet';

jest.mock(
  '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions'
);

describe('NumericFacet', () => {
  const facetId: string = 'numeric_facet_id';
  const type: FacetType = 'numericalRange';
  const start = 0;
  const end = 100;
  let options: NumericFacetOptions;
  let state: CommerceAppState;
  let engine: MockedCommerceEngine;
  let facet: NumericFacet;

  function initFacet() {
    engine = buildMockCommerceEngine(state);
    facet = buildCommerceNumericFacet(engine, options);
  }

  function setFacetRequest(
    config: Partial<CommerceFacetRequest<NumericRangeRequest>> = {}
  ) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, type, ...config}),
    });
    state.productListing.facets = [
      buildMockCommerceNumericFacetResponse({facetId}),
    ];
  }

  beforeEach(() => {
    options = {
      facetId,
      ...commonOptions,
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

  it('#type returns "numericalRange"', () => {
    expect(facet.type).toBe('numericalRange');
  });
});
