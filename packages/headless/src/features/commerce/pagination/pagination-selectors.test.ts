import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  pagePrincipalSelector,
  pageRecommendationSelector,
  perPagePrincipalSelector,
  perPageRecommendationSelector,
  totalEntriesPrincipalSelector,
  totalEntriesRecommendationSelector,
} from './pagination-selectors.js';

describe('commerce pagination selectors', () => {
  it('#perPagePrincipalSelector should return the perPage value from the principal section', () => {
    const state = buildMockCommerceState({
      commercePagination: {
        principal: {perPage: 10, page: 1, totalEntries: 100, totalPages: 10},
        recommendations: {},
      },
    });
    expect(perPagePrincipalSelector(state)).toEqual(10);
  });

  it('#perPagePrincipalSelector should return 0 when the perPage value is not set', () => {
    const state = buildMockCommerceState();
    expect(perPagePrincipalSelector(state)).toEqual(0);
  });

  it('#perPageRecommendationSelector should return the perPage value from the recommendation section', () => {
    const state = buildMockCommerceState({
      commercePagination: {
        principal: {
          perPage: 0,
          page: 0,
          totalEntries: 0,
          totalPages: 0,
        },
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

    expect(perPageRecommendationSelector(state, 'some-slot-id')).toEqual(10);
  });

  it('#perPageRecommendationSelector should return 0 when the perPage value is not set', () => {
    const state = buildMockCommerceState();
    expect(perPageRecommendationSelector(state, 'some-slot-id')).toEqual(0);
  });
  it('#totalEntriesPrincipalSelector should return the totalEntries value from the principal section', () => {
    const state = buildMockCommerceState({
      commercePagination: {
        principal: {perPage: 10, page: 1, totalEntries: 100, totalPages: 10},
        recommendations: {},
      },
    });
    expect(totalEntriesPrincipalSelector(state)).toEqual(100);
  });

  it('#totalEntriesPrincipalSelector should return 0 when the totalEntries value is not set', () => {
    const state = buildMockCommerceState();
    expect(totalEntriesPrincipalSelector(state)).toEqual(0);
  });

  it('#totalEntriesRecommendationSelector should return the totalEntries value from the recommendation section', () => {
    const state = buildMockCommerceState({
      commercePagination: {
        principal: {
          perPage: 0,
          page: 0,
          totalEntries: 0,
          totalPages: 0,
        },
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

    expect(totalEntriesRecommendationSelector(state, 'some-slot-id')).toEqual(
      100
    );
  });

  it('#totalEntriesRecommendationSelector should return 0 when the totalEntries value is not set', () => {
    const state = buildMockCommerceState();
    expect(totalEntriesRecommendationSelector(state, 'some-slot-id')).toEqual(
      0
    );
  });

  it('#pagePrincipalSelector should return the page value from the principal section', () => {
    const state = buildMockCommerceState({
      commercePagination: {
        principal: {perPage: 10, page: 1, totalEntries: 100, totalPages: 10},
        recommendations: {},
      },
    });
    expect(pagePrincipalSelector(state)).toEqual(1);
  });

  it('#pagePrincipalSelector should return 0 when the page value is not set', () => {
    const state = buildMockCommerceState();
    expect(pagePrincipalSelector(state)).toEqual(0);
  });

  it('#pageRecommendationSelector should return the page value from the recommendation section', () => {
    const state = buildMockCommerceState({
      commercePagination: {
        principal: {
          perPage: 0,
          page: 0,
          totalEntries: 0,
          totalPages: 0,
        },
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

    expect(pageRecommendationSelector(state, 'some-slot-id')).toEqual(1);
  });

  it('#pageRecommendationSelector should return 0 when the page value is not set', () => {
    const state = buildMockCommerceState();
    expect(pageRecommendationSelector(state, 'some-slot-id')).toEqual(0);
  });
});
