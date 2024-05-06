import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {buildMockCommerceEngine} from '../../../../test/mock-engine-v2';
import {buildMockProduct} from '../../../../test/mock-product';
import {buildListingSummary} from './headless-product-listing-summary';

describe('commerce product-listing summary', () => {
  it('should return correct state when there is an error', () => {
    const controller = buildListingSummary(
      buildMockCommerceEngine(
        buildMockCommerceState({
          productListing: {
            error: {message: 'boom', statusCode: 500, type: 'boom'},
            products: [],
            facets: [],
            isLoading: false,
            requestId: '',
            responseId: '',
          },
        })
      )
    );

    expect(controller.state.hasError).toBe(true);
  });

  it('should return correct state when no search has been executed', () => {
    const controller = buildListingSummary(
      buildMockCommerceEngine(buildMockCommerceState())
    );
    expect(controller.state.firstSearchExecuted).toBe(false);
    expect(controller.state.hasProducts).toBe(false);
    expect(controller.state.isLoading).toBe(false);
  });

  it('should return correct state when search has been executed but no products are returned', () => {
    const controller = buildListingSummary(
      buildMockCommerceEngine(
        buildMockCommerceState({
          commercePagination: {
            principal: {
              page: 1,
              totalEntries: 0,
              totalPages: 0,
              perPage: 20,
            },
            recommendations: {},
          },
          productListing: {
            error: null,
            products: [],
            facets: [],
            isLoading: false,
            requestId: 'bar',
            responseId: 'baz',
          },
        })
      )
    );
    expect(controller.state).toEqual({
      firstProduct: 0,
      firstSearchExecuted: true,
      lastProduct: 0,
      totalNumberOfProducts: 0,
      hasProducts: false,
      hasError: false,
      isLoading: false,
    });
  });

  it('should return correct state when on the first page', () => {
    const controller = buildListingSummary(
      buildMockCommerceEngine(
        buildMockCommerceState({
          commercePagination: {
            principal: {
              page: 0,
              totalEntries: 100,
              totalPages: 5,
              perPage: 20,
            },
            recommendations: {},
          },
          productListing: {
            error: null,
            products: [...Array(20).keys()].map((_) => buildMockProduct()),
            facets: [],
            isLoading: false,
            requestId: 'bar',
            responseId: 'baz',
          },
        })
      )
    );
    expect(controller.state).toEqual({
      firstProduct: 1,
      firstSearchExecuted: true,
      lastProduct: 20,
      totalNumberOfProducts: 100,
      hasProducts: true,
      hasError: false,
      isLoading: false,
    });
  });

  it('should return correct state when not on the first page', () => {
    const controller = buildListingSummary(
      buildMockCommerceEngine(
        buildMockCommerceState({
          commercePagination: {
            principal: {
              page: 3,
              totalEntries: 100,
              totalPages: 5,
              perPage: 20,
            },
            recommendations: {},
          },
          productListing: {
            error: null,
            products: [...Array(20).keys()].map((_) => buildMockProduct()),
            facets: [],
            isLoading: false,
            requestId: 'bar',
            responseId: 'baz',
          },
        })
      )
    );
    expect(controller.state).toEqual({
      firstProduct: 61,
      firstSearchExecuted: true,
      lastProduct: 80,
      totalNumberOfProducts: 100,
      hasProducts: true,
      hasError: false,
      isLoading: false,
    });
  });
});
