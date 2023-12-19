import {toggleSelectCommerceCategoryFacetValue} from '../../../../../features/commerce/facets/facet-set/facet-set-actions';
import {CommerceFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {fetchProductListing} from '../../../../../features/commerce/product-listing/product-listing-actions';
import {CommerceAppState} from '../../../../../state/commerce-app-state';
import {MockCommerceEngine, buildMockCommerceEngine} from '../../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {buildMockCommerceCategoryFacetResponse} from '../../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceCategoryFacetValue} from '../../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  CommerceCategoryFacet,
  CommerceCategoryFacetOptions,
  buildCommerceCategoryFacet,
} from './headless-commerce-category-facet';

describe('CommerceCategoryFacet', () => {
  const facetId: string = 'category_facet_id';
  let options: CommerceCategoryFacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let facet: CommerceCategoryFacet;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
    facet = buildCommerceCategoryFacet(engine, options);
  }

  function setFacetRequest(config: Partial<CommerceFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.productListing.facets = [
      buildMockCommerceCategoryFacetResponse({facetId}),
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
      const facetValue = buildMockCommerceCategoryFacetValue();
      facet.toggleSelect(facetValue);

      expect(engine.actions).toContainEqual(
        toggleSelectCommerceCategoryFacetValue({
          facetId,
          selection: facetValue,
        })
      );
    });
  });
});
