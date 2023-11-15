import {FacetGenerator} from '../../facets/core/headless-core-facet-generator';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {buildProductListingFacetGenerator} from './headless-product-listing-facet-generator';
import {buildProductListingFacet} from './headless-product-listing-facet';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceFacetResponse} from '../../../../test/mock-commerce-facet-response';

describe('FacetGenerator', () => {
  let engine: MockCommerceEngine;
  let facetGenerator: FacetGenerator;

  function initFacetGenerator() {
    engine = buildMockCommerceEngine();

    facetGenerator = buildProductListingFacetGenerator(engine);
  }

  beforeEach(() => {
    initFacetGenerator();
  });

  it('exposes #subscribe method', () => {
    expect(facetGenerator.subscribe).toBeTruthy();
  });

  it('should return facet controllers', () => {
    // eslint-disable-next-line @cspell/spellchecker
    // TODO CAPI-90, CAPI-91: Add test cases that ensure proper facet controllers are created from the facet.type
    const facet = {
      facetId: 'some_facet_field'
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
    facetGenerator = buildProductListingFacetGenerator(engine);

    expect(facetGenerator.state.facets.length).toEqual(1);
    expect(facetGenerator.state.facets[0].state).toEqual(
      buildProductListingFacet(engine, {options: facet}).state
    );
  });
});
