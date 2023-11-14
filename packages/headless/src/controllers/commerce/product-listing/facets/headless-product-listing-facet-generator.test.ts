import {FacetGenerator} from '../../facets/core/headless-core-facet-generator';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {buildMockCommerceFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockFacetSlice} from '../../../../test/mock-facet-slice';
import {buildMockFacetRequest} from '../../../../test/mock-facet-request';
import {buildMockFacetOptions} from '../../../../test/mock-facet-options';
import {buildProductListingFacetGenerator} from './headless-product-listing-facet-generator';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {buildProductListingFacet} from './headless-product-listing-facet';

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

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toBeCalledWith({
      productListing,
    });
  });

  it('exposes #subscribe method', () => {
    expect(facetGenerator.subscribe).toBeTruthy();
  });

  it('should return facet controllers', () => {
    // eslint-disable-next-line @cspell/spellchecker
    // TODO CAPI-90, CAPI-91: Add test cases that ensure proper facet controllers are created from the facet.type
    const facet = {
      facetId: 'some-facet-id',
      field: 'some_field',
    };
    const engine = buildMockCommerceEngine({
      state: {
        ...buildMockCommerceState(),
        commerceFacetSet: {
          facets: [buildMockCommerceFacetResponse(facet)],
        },
        facetSet: {
          [facet.facetId]: buildMockFacetSlice({
            request: buildMockFacetRequest(facet),
          }),
        },
        facetOptions: buildMockFacetOptions({
          facets: {
            [facet.facetId]: {enabled: true},
          },
        }),
      },
    });
    facetGenerator = buildProductListingFacetGenerator(engine);

    expect(facetGenerator.state.facets.length).toEqual(1);
    expect(facetGenerator.state.facets[0].state).toEqual(
      buildProductListingFacet(engine, {options: facet}).state
    );
  });
});
