import {CommerceFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceRegularFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceRegularFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {buildMockFacetSearch} from '../../../../test/mock-facet-search';
import {
  CommerceFacetOptions,
  FacetValueRequest,
} from '../../core/facets/headless-core-commerce-facet';
import {RegularFacet} from '../../core/facets/regular/headless-commerce-regular-facet';
import {buildSearchRegularFacet} from './headless-search-regular-facet';

jest.mock('../../../../features/commerce/search/search-actions');

describe('SearchRegularFacet', () => {
  const facetId: string = 'regular_facet_id';
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let options: CommerceFacetOptions;
  let facet: RegularFacet;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initSearchRegularFacet() {
    facet = buildSearchRegularFacet(engine, options);
  }

  function setFacetRequest(
    config: Partial<CommerceFacetRequest<FacetValueRequest>> = {}
  ) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.commerceSearch.facets = [
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
    };

    state = buildMockCommerceState();
    setFacetRequest();
    setFacetSearch();

    initEngine(state);
    initSearchRegularFacet();
  });

  it('initializes', () => {
    expect(facet).toBeTruthy();
  });

  it('adds #commerceSearch reducer to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({commerceSearch});
  });

  describe('#toggleSelect', () => {
    it('dispatches #executeSearch', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches #executeSearch', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      facet.toggleExclude(facetValue);
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#deselectAll', () => {
    it('dispatches #executeSearch', () => {
      facet.deselectAll();
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#showMoreValues', () => {
    it('dispatches #executeSearch', () => {
      facet.showMoreValues();
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#showLessValues', () => {
    it('dispatches #executeSearch', () => {
      facet.showLessValues();

      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#facetSearch', () => {
    it('#facetSearch.select dispatches #executeSearch', () => {
      const value = 'ted';
      facet.facetSearch.select({
        count: 0,
        displayValue: value,
        rawValue: value,
      });

      expect(executeSearch).toHaveBeenCalled();
    });

    it('#facetSearch.exclude dispatches #executeSearch', () => {
      const value = 'ted';
      facet.facetSearch.exclude({
        count: 0,
        displayValue: value,
        rawValue: value,
      });

      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#state', () => {
    it('#state.values uses #facetResponseSelector', () => {
      expect(facet.state.facetId).toEqual(
        state.commerceSearch.facets[0].facetId
      );
    });

    it('#state.isLoading uses #isFacetLoadingResponseSelector', () => {
      state.commerceSearch.isLoading = true;
      expect(facet.state.isLoading).toBe(true);
    });

    it('#state.facetSearch exposes the facet search state', () => {
      expect(facet.state.facetSearch).toBeTruthy();
      expect(facet.state.facetSearch.isLoading).toBe(false);

      state.facetSearchSet[facetId].isLoading = true;
      initSearchRegularFacet();
      expect(facet.state.facetSearch.isLoading).toBe(true);
    });
  });
});
