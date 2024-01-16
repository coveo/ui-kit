import {Action} from '@reduxjs/toolkit';
import {CommerceRegularFacet} from '../../../../commerce.index';
import {CommerceFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceRegularFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceRegularFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {CommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';
import {buildSearchRegularFacet} from './headless-search-regular-facet';

describe('SearchRegularFacet', () => {
  const facetId: string = 'regular_facet_id';
  let options: CommerceFacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let facet: CommerceRegularFacet;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
    facet = buildSearchRegularFacet(engine, options);
  }

  function setFacetRequest(config: Partial<CommerceFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.commerceSearch.facets = [
      buildMockCommerceRegularFacetResponse({facetId}),
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
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);

      expectContainAction(executeSearch.pending);
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches #executeSearch', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
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
