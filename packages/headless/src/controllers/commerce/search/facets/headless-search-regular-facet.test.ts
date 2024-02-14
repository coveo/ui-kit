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
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {CommerceRegularFacet} from '../../core/facets/regular/headless-commerce-regular-facet';
import {buildSearchRegularFacet} from './headless-search-regular-facet';

jest.mock('../../../../features/commerce/search/search-actions');

describe('SearchRegularFacet', () => {
  const facetId: string = 'regular_facet_id';
  let options: CommerceFacetOptions;
  let state: CommerceAppState;
  let engine: MockedCommerceEngine;
  let facet: CommerceRegularFacet;

  function initFacet() {
    engine = buildMockCommerceEngine(state);
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
