import {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {
  BaseCommerceAPIRequest,
  CommerceAPIRequest,
} from '../../../api/commerce/common/request';
import {buildMockCommerceFacetRequest} from '../../../test/mock-commerce-facet-request';
import {buildMockCommerceFacetSlice} from '../../../test/mock-commerce-facet-slice';
import {buildMockCommerceRegularFacetValue} from '../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {CommerceFacetSlice} from '../facets/facet-set/facet-set-state';
import {getCommercePaginationInitialState} from '../pagination/pagination-state';
import {SortBy, SortCriterion, SortDirection} from '../sort/sort';
import {getCommerceSortInitialState} from '../sort/sort-state';
import {
  StateNeededByQueryCommerceAPI,
  buildCommerceAPIRequest,
} from './actions';

describe('buildCommerceAPIRequest', () => {
  let expected: BaseCommerceAPIRequest;
  let state: StateNeededByQueryCommerceAPI;
  beforeEach(() => {
    const product = {
      name: 'product_name',
      quantity: 1,
      price: 1,
      productId: 'product_id',
    };

    expected = {
      url: 'https://platform.cloud.coveo.com',
      accessToken: 'access_token',
      organizationId: 'org_id',
      trackingId: 'tracking_id',
      language: 'en',
      country: 'CA',
      currency: 'CAD',
      clientId: expect.any(String),
      context: {
        user: {
          userId: 'user_id',
          email: 'email',
          userIp: 'user_ip',
          userAgent: 'user_agent',
        },
        view: {
          url: 'https://example.com',
          referrer: 'https://referrer.com',
        },
        cart: [
          {
            productId: product.productId,
            quantity: product.quantity,
          },
        ],
      },
    };

    state = buildMockCommerceState();

    state.configuration.platformUrl = expected.url;
    state.configuration.accessToken = expected.accessToken;
    state.configuration.organizationId = expected.organizationId;
    state.configuration.analytics.trackingId = expected.trackingId;
    state.commerceContext.language = expected.language;
    state.commerceContext.country = expected.country;
    state.commerceContext.currency = expected.currency as CurrencyCodeISO4217;
    state.commerceContext.user = expected.context.user;
    state.commerceContext.view = expected.context.view;
    state.cart.cartItems = [product.productId];
    state.cart.cart = {
      [product.productId]: {
        ...product,
      },
    };
  });

  it('when state has none of the optional sections, returns the expected base request along an empty #facets array', async () => {
    delete state.commerceSort;
    delete state.commercePagination;
    delete state.facetOrder;
    delete state.commerceFacetSet;

    const request = await buildCommerceAPIRequest(state);

    expect(request).toEqual({...expected, facets: []});
  });

  it('when state has facetOrder but not commerceFacetSet, returns the expected base request with an empty #facets array', async () => {
    delete state.commerceSort;
    delete state.commercePagination;
    delete state.commerceFacetSet;

    state.facetOrder = ['facet_id'];

    const request = await buildCommerceAPIRequest(state);

    expect(request).toEqual({...expected, facets: []});
  });

  it('when state has commerceFacetSet but not facetOrder, returns the expected base request with an empty #facets array', async () => {
    delete state.commerceSort;
    delete state.commercePagination;
    delete state.commerceFacetSet;

    state.commerceFacetSet = {
      facet_id: buildMockCommerceFacetSlice(),
    };

    const request = await buildCommerceAPIRequest(state);

    expect(request).toEqual({...expected, facets: []});
  });

  describe('when state has commerceFacetSet and facetOrder', () => {
    let facet1: CommerceFacetSlice;
    let facet2: CommerceFacetSlice;

    beforeEach(() => {
      delete state.commerceSort;
      delete state.commercePagination;

      facet1 = buildMockCommerceFacetSlice({
        request: {
          ...buildMockCommerceFacetRequest({
            facetId: 'facet_1_id',
            values: [buildMockCommerceRegularFacetValue()],
          }),
        },
      });

      facet2 = buildMockCommerceFacetSlice({
        request: {
          ...buildMockCommerceFacetRequest({
            facetId: 'facet_2_id',
            values: [buildMockCommerceRegularFacetValue()],
          }),
        },
      });

      state.facetOrder = [facet1.request.facetId, facet2.request.facetId];

      state.commerceFacetSet = {
        [facet1.request.facetId]: facet1,
        [facet2.request.facetId]: facet2,
      };
    });
    it('includes all non-empty facets in the #facets array of the returned request', async () => {
      const request = await buildCommerceAPIRequest(state);

      expect(request).toEqual({
        ...expected,
        facets: [facet1.request, facet2.request],
      });
    });

    it('does not include empty facets in the #facets array of the returned request', async () => {
      const facet3 = buildMockCommerceFacetSlice({
        request: {
          ...buildMockCommerceFacetRequest({
            facetId: 'facet_3_id',
          }),
        },
      });

      state.facetOrder = [facet1.request.facetId, facet2.request.facetId];

      state.commerceFacetSet![facet3.request.facetId] = facet3;
      state.facetOrder.push(facet3.request.facetId);

      const request = await buildCommerceAPIRequest(state);

      expect(request).toEqual({
        ...expected,
        facets: [facet1.request, facet2.request],
      });
    });
  });

  it('when state has commercePagination, returns expected base request with expected #page and #perPage', async () => {
    delete state.commerceSort;
    delete state.facetOrder;
    delete state.commerceFacetSet;

    state.commercePagination = {
      ...getCommercePaginationInitialState(),
      page: 1,
      perPage: 10,
    };

    const expectedWithPagination: CommerceAPIRequest = {
      ...expected,
      facets: [],
      page: state.commercePagination.page,
      perPage: state.commercePagination.perPage,
    };

    const request = await buildCommerceAPIRequest(state);

    expect(request).toEqual(expectedWithPagination);
  });

  describe('when state has commerceSort', () => {
    beforeEach(() => {
      delete state.commercePagination;
      delete state.facetOrder;
      delete state.commerceFacetSet;
    });

    it('when applied sort is relevance, returns expected base request with expected #sort.sortCriteria', async () => {
      state.commerceSort = {
        ...getCommerceSortInitialState(),
        appliedSort: {
          by: SortBy.Relevance,
        },
      };

      const expectedWithSort: CommerceAPIRequest = {
        ...expected,
        facets: [],
        sort: {
          sortCriteria: SortBy.Relevance,
        },
      };

      const request = await buildCommerceAPIRequest(state);

      expect(request).toEqual(expectedWithSort);
    });

    it('when applied sort is field, returns expected base request with expected #sort.sortCriteria and #sort.fields', async () => {
      const sortCriterion: SortCriterion = {
        by: SortBy.Fields,
        fields: [
          {
            name: 'field_name',
            direction: SortDirection.Ascending,
            displayName: 'field_display_name',
          },
        ],
      };
      state.commerceSort = {
        ...getCommerceSortInitialState(),
        appliedSort: sortCriterion,
      };

      const expectedWithSort: CommerceAPIRequest = {
        ...expected,
        facets: [],
        sort: {
          sortCriteria: sortCriterion.by,
          fields: [
            {
              field: sortCriterion.fields[0].name,
              direction: sortCriterion.fields[0].direction,
            },
          ],
        },
      };

      const request = await buildCommerceAPIRequest(state);

      expect(request).toEqual(expectedWithSort);
    });
  });
});
