import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
  updateDateFacetValues,
} from '../../../../../features/commerce/facets/date-facet/date-facet-actions.js';
import type {FacetType} from '../../../../../features/commerce/facets/facet-set/interfaces/common.js';
import type {DateFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request.js';
import type {CommerceAppState} from '../../../../../state/commerce-app-state.js';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request.js';
import {buildMockCommerceDateFacetResponse} from '../../../../../test/mock-commerce-facet-response.js';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice.js';
import {buildMockCommerceDateFacetValue} from '../../../../../test/mock-commerce-facet-value.js';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../../../test/mock-engine-v2.js';
import type {DateRangeRequest} from '../headless-core-commerce-facet.js';
import {
  buildCommerceDateFacet,
  type DateFacet,
  type DateFacetOptions,
} from './headless-commerce-date-facet.js';

vi.mock(
  '../../../../../features/commerce/facets/date-facet/date-facet-actions'
);

describe('DateFacet', () => {
  const facetId: string = 'date_facet_id';
  const type: FacetType = 'dateRange';
  const start = '2023-01-01';
  const end = '2024-01-01';
  const fetchProductsActionCreator = vi.fn();
  let options: DateFacetOptions;
  let state: CommerceAppState;
  let engine: MockedCommerceEngine;
  let facet: DateFacet;

  function initFacet() {
    engine = buildMockCommerceEngine(state);
    facet = buildCommerceDateFacet(engine, options);
  }

  function setFacetRequest(config: Partial<DateFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, type, ...config}),
    });
    state.productListing.facets = [
      buildMockCommerceDateFacetResponse({facetId}),
    ];
  }

  beforeEach(() => {
    vi.resetAllMocks();

    options = {
      facetId,
      fetchProductsActionCreator,
      facetResponseSelector: vi.fn(),
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
    it('dispatches #toggleSelectDateFacetValue', () => {
      const facetValue = buildMockCommerceDateFacetValue({start, end});
      facet.toggleSelect(facetValue);
      expect(toggleSelectDateFacetValue).toHaveBeenCalledWith({
        facetId,
        selection: facetValue,
      });
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches #toggleExcludeDateFacetValue', () => {
      const facetValue = buildMockCommerceDateFacetValue({start, end});
      facet.toggleExclude(facetValue);
      expect(toggleExcludeDateFacetValue).toHaveBeenCalledWith({
        facetId,
        selection: facetValue,
      });
    });
  });

  describe('#setRanges', () => {
    let values: DateRangeRequest[];
    beforeEach(() => {
      values = [buildMockCommerceDateFacetValue()].map(
        ({start, end, endInclusive, state}) => ({
          start,
          end,
          endInclusive,
          state,
        })
      );
      facet.setRanges(values);
    });
    it('dispatches #updateDateFacetValues with the correct payload', () => {
      expect(updateDateFacetValues).toHaveBeenCalledWith({
        facetId,
        values: values.map((value) => ({...value, numberOfResults: 0})),
      });
    });

    it('dispatches #fetchProductsActionCreator', () => {
      expect(fetchProductsActionCreator).toHaveBeenCalledTimes(1);
    });
  });

  it('#type returns "dateRange"', () => {
    expect(facet.type).toBe('dateRange');
  });
});
