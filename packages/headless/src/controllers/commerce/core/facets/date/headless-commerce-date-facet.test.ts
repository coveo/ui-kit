import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
  updateDateFacetValues,
} from '../../../../../features/commerce/facets/date-facet/date-facet-actions';
import {FacetType} from '../../../../../features/commerce/facets/facet-set/interfaces/common';
import {DateFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {CommerceAppState} from '../../../../../state/commerce-app-state';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {buildMockCommerceDateFacetResponse} from '../../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceDateFacetValue} from '../../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../../test/mock-engine-v2';
import {DateRangeRequest} from '../headless-core-commerce-facet';
import {
  DateFacet,
  DateFacetOptions,
  buildCommerceDateFacet,
} from './headless-commerce-date-facet';

jest.mock(
  '../../../../../features/commerce/facets/date-facet/date-facet-actions'
);

describe('DateFacet', () => {
  const facetId: string = 'date_facet_id';
  const type: FacetType = 'dateRange';
  const start = '2023-01-01';
  const end = '2024-01-01';
  const fetchProductsActionCreator = jest.fn();
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
    jest.resetAllMocks();

    options = {
      facetId,
      fetchProductsActionCreator,
      facetResponseSelector: jest.fn(),
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
