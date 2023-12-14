import {CommerceFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {FacetType} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {fetchProductListing} from '../../../../../features/commerce/product-listing/product-listing-actions';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {CommerceAppState} from '../../../../../state/commerce-app-state';
import {MockCommerceEngine, buildMockCommerceEngine} from '../../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {buildMockCommerceNumericFacetResponse} from '../../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceNumericFacetValue} from '../../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  CommerceNumericFacet,
  CommerceNumericFacetOptions,
  buildCommerceNumericFacet,
} from './headless-commerce-numeric-facet';

describe('CommerceNumericFacet', () => {
  const facetId: string = 'numeric_facet_id';
  const type: FacetType = 'numericalRange';
  const start = 0;
  const end = 100;
  let options: CommerceNumericFacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let facet: CommerceNumericFacet;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
    facet = buildCommerceNumericFacet(engine, options);
  }

  function setFacetRequest(config: Partial<CommerceFacetRequest> = {}) {
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
      fetchResultsActionCreator: fetchProductListing,
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

      expect(engine.actions).toContainEqual(
        toggleSelectNumericFacetValue({facetId, selection: facetValue})
      );
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches #toggleExcludeNumericFacetValue', () => {
      const facetValue = buildMockCommerceNumericFacetValue({start, end});
      facet.toggleExclude(facetValue);

      expect(engine.actions).toContainEqual(
        toggleExcludeNumericFacetValue({facetId, selection: facetValue})
      );
    });
  });
});
