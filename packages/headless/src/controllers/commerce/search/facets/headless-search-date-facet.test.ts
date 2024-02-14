import {CommerceFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceDateFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceDateFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {CommerceDateFacet} from '../../core/facets/date/headless-commerce-date-facet';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {buildSearchDateFacet} from './headless-search-date-facet';

jest.mock('../../../../features/commerce/search/search-actions');

describe('SearchDateFacet', () => {
  const facetId: string = 'date_facet_id';
  const start = '2023-01-01';
  const end = '2024-01-01';
  let options: CommerceFacetOptions;
  let state: CommerceAppState;
  let engine: MockedCommerceEngine;
  let facet: CommerceDateFacet;

  function initFacet() {
    engine = buildMockCommerceEngine(state);
    facet = buildSearchDateFacet(engine, options);
  }

  function setFacetRequest(config: Partial<CommerceFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.commerceSearch.facets = [
      buildMockCommerceDateFacetResponse({facetId}),
    ];
  }

  beforeEach(() => {
    options = {
      facetId,
    };

    state = buildMockCommerceState();
    setFacetRequest();

    initFacet();
  });

  it('initializes', () => {
    expect(facet).toBeTruthy();
  });

  it('adds #commerceSearch reducer to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({commerceSearch});
  });

  describe('#toggleSelect', () => {
    it('dispatches #executeSearch', () => {
      const facetValue = buildMockCommerceDateFacetValue({start, end});
      facet.toggleSelect(facetValue);

      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches #executeSearch', () => {
      const facetValue = buildMockCommerceDateFacetValue({start, end});
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
  });
});
