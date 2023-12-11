import {CommerceFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {fetchProductListing} from '../../../../../features/commerce/product-listing/product-listing-actions';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../../features/facets/facet-set/facet-set-actions';
import {CommerceAppState} from '../../../../../state/commerce-app-state';
import {MockCommerceEngine, buildMockCommerceEngine} from '../../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {buildMockCommerceRegularFacetResponse} from '../../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceRegularFacetValue} from '../../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  CommerceRegularFacet,
  CommerceRegularFacetOptions,
  buildCommerceRegularFacet,
} from './headless-commerce-regular-facet';

describe('CommerceRegularFacet', () => {
  const facetId: string = 'regular_facet_id';
  let options: CommerceRegularFacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let facet: CommerceRegularFacet;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
    facet = buildCommerceRegularFacet(engine, options);
  }

  function setFacetRequest(config: Partial<CommerceFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.productListing.facets = [
      buildMockCommerceRegularFacetResponse({facetId}),
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
    it('dispatches a #toggleSelectFacetValue', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);

      expect(engine.actions).toContainEqual(
        toggleSelectFacetValue({facetId, selection: facetValue})
      );
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches a #toggleExcludeFacetValue', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      facet.toggleExclude(facetValue);

      expect(engine.actions).toContainEqual(
        toggleExcludeFacetValue({facetId, selection: facetValue})
      );
    });
  });

  describe('#toggleSingleSelect', () => {
    it('dispatches a #toggleSelectFacetValue', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      facet.toggleSingleSelect(facetValue);

      expect(engine.actions).toContainEqual(
        toggleSelectFacetValue({facetId, selection: facetValue})
      );
    });
  });

  describe('#toggleSingleExclude', () => {
    it('dispatches a #toggleExcludeFacetValue', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      facet.toggleSingleExclude(facetValue);

      expect(engine.actions).toContainEqual(
        toggleExcludeFacetValue({facetId, selection: facetValue})
      );
    });
  });
});
