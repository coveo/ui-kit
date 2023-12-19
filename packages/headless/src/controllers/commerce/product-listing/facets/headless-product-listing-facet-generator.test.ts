import {FacetType} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {
  buildMockCommerceRegularFacetResponse,
  buildMockCommerceNumericFacetResponse,
  buildMockCommerceDateFacetResponse,
} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildProductListingFacetGenerator,
  ProductListingFacetGenerator,
} from './headless-product-listing-facet-generator';

describe('ProductListingFacetGenerator', () => {
  let engine: MockCommerceEngine;
  let facetGenerator: ProductListingFacetGenerator;

  function initFacetGenerator(facetType: FacetType = 'regular') {
    const facet = {
      facetId: 'regular_facet_id',
      type: facetType,
    };
    const mockState = buildMockCommerceState();
    const facets = [];
    switch (facetType) {
      case 'regular':
        facets.push(
          buildMockCommerceRegularFacetResponse({
            facetId: facet.facetId,
            field: 'some_regular_field',
          })
        );
        break;
      case 'numericalRange':
        facets.push(
          buildMockCommerceNumericFacetResponse({
            facetId: facet.facetId,
            field: 'some_numeric_field',
          })
        );
        break;
      case 'dateRange':
        facets.push(
          buildMockCommerceDateFacetResponse({
            facetId: facet.facetId,
            field: 'some_date_field',
          })
        );
        break;
      case 'hierarchical': // TODO
      default:
        break;
    }
    engine = buildMockCommerceEngine({
      state: {
        ...mockState,
        productListing: {
          ...mockState.productListing,
          facets: [
            buildMockCommerceRegularFacetResponse({
              facetId: facet.facetId,
              field: 'some_regular_field',
            }),
          ],
        },
        facetOrder: [facet.facetId],
        commerceFacetSet: {
          [facet.facetId]: {request: buildMockCommerceFacetRequest(facet)},
        },
      },
    });
    facetGenerator = buildProductListingFacetGenerator(engine);
  }

  it('exposes #subscribe method', () => {
    initFacetGenerator();
    expect(facetGenerator.subscribe).toBeTruthy();
  });

  it('generated regular facet controllers should dispatch #fetchProductListing', () => {
    initFacetGenerator('regular');

    facetGenerator.state.facets[0].deselectAll();

    expect(engine.findAsyncAction(fetchProductListing.pending)).toBeTruthy();
  });
  it('generated regular numeric facet controllers should dispatch #fetchProductListing', () => {
    initFacetGenerator('numericalRange');

    facetGenerator.state.facets[0].deselectAll();

    expect(engine.findAsyncAction(fetchProductListing.pending)).toBeTruthy();
  });

  it('generated date facet controllers dispatches #fetchProductListing', () => {
    initFacetGenerator('dateRange');

    facetGenerator.state.facets[0].deselectAll();

    expect(engine.findAsyncAction(fetchProductListing.pending)).toBeTruthy();
  });
});
