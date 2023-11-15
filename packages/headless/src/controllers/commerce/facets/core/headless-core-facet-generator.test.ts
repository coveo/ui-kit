import {buildCoreFacetGenerator, FacetGenerator, FacetGeneratorOptions} from './headless-core-facet-generator';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildProductListingFacet} from '../../product-listing/facets/headless-product-listing-facet';
import {buildCoreFacet} from './headless-core-facet';
import {facetOrderReducer as facetOrder} from '../../../../features/facets/facet-order/facet-order-slice';
import {
  commerceFacetSetReducer as commerceFacetSet
} from '../../../../features/commerce/facets/facet-set/facet-set-slice';
import {buildMockCommerceFacetResponse} from '../../../../test/mock-commerce-facet-response';

describe('facet generator', () => {
  let engine: MockCommerceEngine;
  let facetGenerator: FacetGenerator;
  let options: FacetGeneratorOptions;

  function initFacetGenerator() {
    engine = buildMockCommerceEngine();

    options = {
      buildFacet: buildCoreFacet
    }
    facetGenerator = buildCoreFacetGenerator(engine, options);
  }

  beforeEach(() => {
    initFacetGenerator();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toBeCalledWith({
      facetOrder,
      commerceFacetSet
    });
  });

  it('exposes #subscribe method', () => {
    expect(facetGenerator.subscribe).toBeTruthy();
  });

  it('should return facet controllers', () => {
    // eslint-disable-next-line @cspell/spellchecker
    // TODO CAPI-90, CAPI-91: Add test cases that ensure proper facet controllers are created from the facet.type
    const facet = {
      facetId: 'facet_id'
    }
    const mockState = buildMockCommerceState();
    const engine = buildMockCommerceEngine({
      state: {
        ...mockState,
        productListing: {
          ...mockState.productListing,
          facets: [buildMockCommerceFacetResponse({
            ...facet,
            field: 'some_field',
          })]
        },
        facetOrder: [facet.facetId],
        commerceFacetSet: {
          [facet.facetId]: { request: buildMockCommerceFacetRequest(facet)},
        },
      },
    });
    facetGenerator = buildCoreFacetGenerator(engine, options);

    expect(facetGenerator.state.facets.length).toEqual(1);
    expect(facetGenerator.state.facets[0].state).toEqual(
      buildProductListingFacet(engine, {options: facet}).state
    );
  });
});
