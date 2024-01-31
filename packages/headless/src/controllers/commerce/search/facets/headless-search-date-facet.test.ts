import {Action} from '@reduxjs/toolkit';
import {CommerceFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceDateFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceDateFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {buildMockCommerceEngine} from '../../../../test/mock-engine';
import {MockCommerceEngine} from '../../../../test/mock-engine';
import {CommerceDateFacet} from '../../core/facets/date/headless-commerce-date-facet';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {buildSearchDateFacet} from './headless-search-date-facet';

describe('SearchDateFacet', () => {
  const facetId: string = 'date_facet_id';
  const start = '2023-01-01';
  const end = '2024-01-01';
  let options: CommerceFacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let facet: CommerceDateFacet;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
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

  const expectContainAction = (action: Action) => {
    expect(engine.actions).toContainEqual(
      expect.objectContaining({
        type: action.type,
      })
    );
  };

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

      expectContainAction(executeSearch.pending);
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches #executeSearch', () => {
      const facetValue = buildMockCommerceDateFacetValue({start, end});
      facet.toggleExclude(facetValue);

      expectContainAction(executeSearch.pending);
    });
  });

  describe('#deselectAll', () => {
    it('dispatches #executeSearch', () => {
      facet.deselectAll();

      expectContainAction(executeSearch.pending);
    });
  });

  describe('#showMoreValues', () => {
    it('dispatches #executeSearch', () => {
      facet.showMoreValues();

      expectContainAction(executeSearch.pending);
    });
  });

  describe('#showLessValues', () => {
    it('dispatches #executeSearch', () => {
      facet.showLessValues();

      expectContainAction(executeSearch.pending);
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
