import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {buildMockProduct} from '../../../test/mock-product.js';
import {
  isLoadingSelector,
  moreRecommendationsAvailableSelector,
  numberOfRecommendationsSelector,
} from './recommendations-selectors.js';

describe('commerce recommendations selectors', () => {
  it('#numberOfRecommendationsSelector should return the number of recommendations in the recommendations section', () => {
    const state = buildMockCommerceState({
      recommendations: {
        'some-slot-id': {
          products: [buildMockProduct(), buildMockProduct()],
          isLoading: false,
          error: null,
          headline: 'foo',
          responseId: 'some-response-id',
        },
      },
    });
    expect(numberOfRecommendationsSelector(state, 'some-slot-id')).toEqual(2);
  });

  it('#numberOfRecommendationsSelector should return 0 when the recommendations are not set', () => {
    const state = buildMockCommerceState();
    expect(numberOfRecommendationsSelector(state, 'some-slot-id')).toEqual(0);
  });
  it('#numberOfRecommendationsSelector should return 0 when the recommendations does not exist for a slot id', () => {
    const state = buildMockCommerceState({
      recommendations: {
        'some-slot-id': {
          products: [],
          isLoading: false,
          error: null,
          headline: 'foo',
          responseId: 'some-response-id',
        },
      },
    });
    expect(
      numberOfRecommendationsSelector(state, 'some-other-slot-id')
    ).toEqual(0);
  });

  it('#moreRecommendationsAvailableSelector should return true when the number of recommendations is less than the total number of entries', () => {
    const state = buildMockCommerceState({
      recommendations: {
        'some-slot-id': {
          products: [buildMockProduct(), buildMockProduct()],
          isLoading: false,
          error: null,
          headline: 'foo',
          responseId: 'some-response-id',
        },
      },
      commercePagination: {
        principal: {perPage: 10, page: 1, totalEntries: 100, totalPages: 10},
        recommendations: {
          'some-slot-id': {
            perPage: 10,
            page: 1,
            totalEntries: 100,
            totalPages: 10,
          },
        },
      },
    });
    expect(moreRecommendationsAvailableSelector(state, 'some-slot-id')).toBe(
      true
    );
  });

  it('#moreRecommendationsAvailableSelector should return false when the number of recommendations is equal to the total number of entries', () => {
    const state = buildMockCommerceState({
      recommendations: {
        'some-slot-id': {
          products: [buildMockProduct(), buildMockProduct()],
          isLoading: false,
          error: null,
          headline: 'foo',
          responseId: 'some-response-id',
        },
      },
      commercePagination: {
        principal: {perPage: 10, page: 1, totalEntries: 2, totalPages: 1},
        recommendations: {
          'some-slot-id': {
            totalEntries: 2,
            page: 1,
            totalPages: 1,
            perPage: 10,
          },
        },
      },
    });
    expect(moreRecommendationsAvailableSelector(state, 'some-slot-id')).toBe(
      false
    );
  });

  it('#isLoadingSelector should return the isLoading value from the recommendations section', () => {
    const state = buildMockCommerceState({
      recommendations: {
        'some-slot-id': {
          products: [],
          isLoading: true,
          error: null,
          headline: 'foo',
          responseId: 'some-response-id',
        },
      },
    });
    expect(isLoadingSelector(state, 'some-slot-id')).toBe(true);
  });

  it('#isLoadingSelector should return false when the isLoading value is not set', () => {
    const state = buildMockCommerceState();
    expect(isLoadingSelector(state, 'some-slot-id')).toBe(false);
  });
});
