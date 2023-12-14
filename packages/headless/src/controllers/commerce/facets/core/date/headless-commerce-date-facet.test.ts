import {CommerceFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {FacetType} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {fetchProductListing} from '../../../../../features/commerce/product-listing/product-listing-actions';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {CommerceAppState} from '../../../../../state/commerce-app-state';
import {MockCommerceEngine, buildMockCommerceEngine} from '../../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {buildMockCommerceDateFacetResponse} from '../../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceDateFacetValue} from '../../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  CommerceDateFacet,
  CommerceDateFacetOptions,
  buildCommerceDateFacet,
} from './headless-commerce-date-facet';

describe('CommerceDateFacet', () => {
  const facetId: string = 'date_facet_id';
  const type: FacetType = 'dateRange';
  const start = '2023-01-01';
  const end = '2024-01-01';
  let options: CommerceDateFacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let facet: CommerceDateFacet;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
    facet = buildCommerceDateFacet(engine, options);
  }

  function setFacetRequest(config: Partial<CommerceFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, type, ...config}),
    });
    state.productListing.facets = [
      buildMockCommerceDateFacetResponse({facetId}),
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
    it('dispatches #toggleSelectDateFacetValue', () => {
      const facetValue = buildMockCommerceDateFacetValue({start, end});
      facet.toggleSelect(facetValue);

      expect(engine.actions).toContainEqual(
        toggleSelectDateFacetValue({facetId, selection: facetValue})
      );
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches #toggleExcludeDateFacetValue', () => {
      const facetValue = buildMockCommerceDateFacetValue({start, end});
      facet.toggleExclude(facetValue);

      expect(engine.actions).toContainEqual(
        toggleExcludeDateFacetValue({facetId, selection: facetValue})
      );
    });
  });
});
