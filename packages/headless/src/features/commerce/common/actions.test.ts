import {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {MockInstance} from 'vitest';
import {getCommerceApiBaseUrl} from '../../../api/commerce/commerce-api-client.js';
import {
  BaseCommerceAPIRequest,
  CommerceAPIRequest,
} from '../../../api/commerce/common/request.js';
import {NavigatorContext} from '../../../app/navigatorContextProvider.js';
import {buildMockCommerceFacetRequest} from '../../../test/mock-commerce-facet-request.js';
import {buildMockCommerceFacetSlice} from '../../../test/mock-commerce-facet-slice.js';
import {buildMockCommerceRegularFacetValue} from '../../../test/mock-commerce-facet-value.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {buildMockNavigatorContextProvider} from '../../../test/mock-navigator-context-provider.js';
import {VERSION} from '../../../utils/version.js';
import {CommerceFacetSlice} from '../facets/facet-set/facet-set-state.js';
import {ManualNumericFacetSetSlice} from '../facets/numeric-facet/manual-numeric-facet-state.js';
import {
  getCommercePaginationInitialSlice,
  getCommercePaginationInitialState,
} from '../pagination/pagination-state.js';
import {getCommerceSortInitialState} from '../sort/sort-state.js';
import {SortBy, SortCriterion, SortDirection} from '../sort/sort.js';
import * as Actions from './actions.js';

describe('commerce common actions', () => {
  let navigatorContext: NavigatorContext;

  beforeEach(() => {
    navigatorContext = buildMockNavigatorContextProvider({
      userAgent: 'user_agent',
      referrer: 'referrer',
      clientId: 'client_id',
    })();
  });

  describe('#buildBaseCommerceAPIRequest', () => {
    let expected: BaseCommerceAPIRequest;
    let state: Actions.StateNeededByQueryCommerceAPI;
    beforeEach(() => {
      const product = {
        productId: 'product_id',
        name: 'product_name',
        quantity: 1,
        price: 1,
        sku: 'product_sku',
      };

      expected = {
        url: getCommerceApiBaseUrl('org_id'),
        accessToken: 'access_token',
        organizationId: 'org_id',
        trackingId: 'tracking_id',
        language: 'en',
        country: 'CA',
        currency: 'CAD',
        clientId: 'client_id',
        page: 0,
        context: {
          user: {
            userAgent: 'user_agent',
          },
          view: {
            url: 'https://example.com',
            referrer: 'referrer',
          },
          capture: true,
          cart: [
            {
              productId: product.productId,
              quantity: product.quantity,
            },
          ],
          source: ['@coveo/atomic@version', `@coveo/headless@${VERSION}`],
        },
      };

      state = buildMockCommerceState();

      state.configuration.accessToken = expected.accessToken;
      state.configuration.organizationId = expected.organizationId;
      state.configuration.analytics.trackingId = expected.trackingId;
      state.configuration.analytics.source = {
        '@coveo/atomic': 'version',
      };
      state.commerceContext.language = expected.language;
      state.commerceContext.country = expected.country;
      state.commerceContext.currency = expected.currency as CurrencyCodeISO4217;
      state.commerceContext.view = expected.context.view;
      state.cart.cartItems = [product.productId];
      state.cart.cart = {
        [product.productId]: {
          ...product,
        },
      };
    });

    it('given a basic state, returns the expected base request', () => {
      const request = Actions.buildBaseCommerceAPIRequest(
        state,
        navigatorContext
      );

      expect(request).toEqual(expected);
    });

    it('given a state with no commercePagination section, returns the expected base request', () => {
      delete state.commercePagination;

      const {page, ...expectedWithoutPagination} = expected;

      const request = Actions.buildBaseCommerceAPIRequest(
        state,
        navigatorContext
      );

      expect(request).toEqual(expectedWithoutPagination);
    });

    it('given a state that has the commercePagination section, returns expected base request with expected #page and #perPage', () => {
      state.commercePagination = {
        ...getCommercePaginationInitialState(),
        principal: {
          ...getCommercePaginationInitialSlice(),
          page: 1,
          perPage: 10,
        },
      };

      const expectedWithPagination: CommerceAPIRequest = {
        ...expected,
        page: state.commercePagination.principal.page,
        perPage: state.commercePagination.principal.perPage,
      };

      const request = Actions.buildBaseCommerceAPIRequest(
        state,
        navigatorContext
      );

      expect(request).toEqual(expectedWithPagination);
    });

    it('given a slotId, returns expected base request with the effective pagination for that slot', () => {
      const slotId = 'slot_id';
      state.commercePagination = {
        ...getCommercePaginationInitialState(),
        recommendations: {
          [slotId]: {
            ...getCommercePaginationInitialSlice(),
            page: 2,
            perPage: 17,
          },
        },
      };

      const expectedWithPagination: CommerceAPIRequest = {
        ...expected,
        page: state.commercePagination.recommendations[slotId]!.page,
        perPage: state.commercePagination.recommendations[slotId]!.perPage,
      };

      const request = Actions.buildBaseCommerceAPIRequest(
        state,
        navigatorContext,
        slotId
      );

      expect(request).toEqual(expectedWithPagination);
    });

    it('given a state that has latitude and longitude, returns expected base request with expected #latitude and #longitude', () => {
      state.commerceContext.location = {
        latitude: 48.8566,
        longitude: 2.3522,
      };

      const expectedWithLatitudeAndLongitude: CommerceAPIRequest = {
        ...expected,
        context: {
          ...expected.context,
          user: {
            ...expected.context.user,
            latitude: state.commerceContext.location.latitude,
            longitude: state.commerceContext.location.longitude,
          },
        },
      };

      const request = Actions.buildBaseCommerceAPIRequest(
        state,
        navigatorContext
      );

      expect(request).toEqual(expectedWithLatitudeAndLongitude);
    });
  });

  describe('#buildCommerceAPIRequest', () => {
    let state: Actions.ListingAndSearchStateNeededByQueryCommerceAPI;
    let mockedBuildBaseCommerceAPIRequest: MockInstance;
    beforeEach(() => {
      vi.clearAllMocks();
      state = buildMockCommerceState();
      mockedBuildBaseCommerceAPIRequest = vi.spyOn(
        Actions,
        'buildCommerceAPIRequest'
      );
    });

    it('given a state with none of the optional sections, returns the expected base request along an empty #facets array', () => {
      delete state.commerceSort;
      delete state.facetOrder;
      delete state.commerceFacetSet;

      const request = Actions.buildCommerceAPIRequest(state, navigatorContext);

      expect(mockedBuildBaseCommerceAPIRequest).toHaveBeenCalledWith(
        state,
        navigatorContext
      );

      expect(request).toEqual({
        ...mockedBuildBaseCommerceAPIRequest.mock.results[0].value,
        facets: [],
      });
    });

    it('given a state that has the facetOrder section but not the commerceFacetSet section, returns the expected base request with an empty #facets array', () => {
      delete state.commerceSort;
      delete state.commerceFacetSet;

      state.facetOrder = ['facet_id'];

      const request = Actions.buildCommerceAPIRequest(state, navigatorContext);

      expect(mockedBuildBaseCommerceAPIRequest).toHaveBeenCalledWith(
        state,
        navigatorContext
      );

      expect(request).toEqual({
        ...mockedBuildBaseCommerceAPIRequest.mock.results[0].value,
        facets: [],
      });
    });

    it('given a state that has the commerceFacetSet section but not the facetOrder section, returns the expected base request with an empty #facets array', () => {
      delete state.commerceSort;
      delete state.commerceFacetSet;

      state.commerceFacetSet = {
        facet_id: buildMockCommerceFacetSlice(),
      };

      const request = Actions.buildCommerceAPIRequest(state, navigatorContext);

      expect(mockedBuildBaseCommerceAPIRequest).toHaveBeenCalledWith(
        state,
        navigatorContext
      );

      expect(request).toEqual({
        ...mockedBuildBaseCommerceAPIRequest.mock.results[0].value,
        facets: [],
      });
    });

    it.each([true, false])(
      'sets the capture property from the analytics configuration',
      (analyticsEnabled) => {
        state.configuration.analytics.enabled = analyticsEnabled;

        const request = Actions.buildCommerceAPIRequest(
          state,
          navigatorContext
        );

        expect(mockedBuildBaseCommerceAPIRequest).toHaveBeenCalledWith(
          state,
          navigatorContext
        );

        expect(request.context.capture).toEqual(analyticsEnabled);
      }
    );

    it.each([true, false])(
      'sets the clientId conditionally upon the analytics configuration',
      (analyticsEnabled) => {
        state.configuration.analytics.enabled = analyticsEnabled;

        const request = Actions.buildCommerceAPIRequest(
          state,
          navigatorContext
        );

        expect(mockedBuildBaseCommerceAPIRequest).toHaveBeenCalledWith(
          state,
          navigatorContext
        );

        expect(request.clientId).toEqual(
          analyticsEnabled ? 'client_id' : undefined
        );
      }
    );

    describe('given a state that has the commerceFacetSet and manualNumericFacetSet', () => {
      let facet1: CommerceFacetSlice;
      let manualFacet1: ManualNumericFacetSetSlice;

      beforeEach(() => {
        delete state.commerceSort;
        facet1 = buildMockCommerceFacetSlice({
          request: {
            ...buildMockCommerceFacetRequest({
              facetId: 'facet_id_1',
              values: [buildMockCommerceRegularFacetValue()],
            }),
          },
        });

        manualFacet1 = {
          manualRange: {
            start: 0,
            end: 10,
            endInclusive: false,
            state: 'selected',
          },
        };

        state.facetOrder = ['facet_id_1'];

        state.commerceFacetSet = {
          [facet1.request.facetId]: facet1,
        };

        state.manualNumericFacetSet = {
          facet_id_1: manualFacet1,
        };
      });

      it('includes only the manual numeric facet in the #facets array of the returned request', () => {
        const request = Actions.buildCommerceAPIRequest(
          state,
          navigatorContext
        );

        expect(mockedBuildBaseCommerceAPIRequest).toHaveBeenCalledWith(
          state,
          navigatorContext
        );

        expect(request).toEqual({
          ...mockedBuildBaseCommerceAPIRequest.mock.results[0].value,
          facets: [
            {
              facetId: 'facet_id_1',
              field: 'facet_id_1',
              initialNumberOfValues: 1,
              isFieldExpanded: false,
              numberOfValues: 1,
              preventAutoSelect: true,
              type: 'numericalRange',
              values: [
                {start: 0, end: 10, endInclusive: false, state: 'selected'},
              ],
            },
          ],
        });
      });
    });

    describe('given a state that has the commerceFacetSet and facetOrder sections', () => {
      let facet1: CommerceFacetSlice;
      let facet2: CommerceFacetSlice;

      beforeEach(() => {
        delete state.commerceSort;

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
      it('includes all non-empty facets in the #facets array of the returned request', () => {
        const request = Actions.buildCommerceAPIRequest(
          state,
          navigatorContext
        );

        expect(mockedBuildBaseCommerceAPIRequest).toHaveBeenCalledWith(
          state,
          navigatorContext
        );

        expect(request).toEqual({
          ...mockedBuildBaseCommerceAPIRequest.mock.results[0].value,
          facets: [facet1.request, facet2.request],
        });
      });

      it('does not include empty facets in the #facets array of the returned request', () => {
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

        const request = Actions.buildCommerceAPIRequest(
          state,
          navigatorContext
        );

        expect(mockedBuildBaseCommerceAPIRequest).toHaveBeenCalledWith(
          state,
          navigatorContext
        );

        expect(request).toEqual({
          ...mockedBuildBaseCommerceAPIRequest.mock.results[0].value,
          facets: [facet1.request, facet2.request],
        });
      });
    });

    describe('given a state that has the commerceSort section', () => {
      beforeEach(() => {
        delete state.facetOrder;
        delete state.commerceFacetSet;
      });

      it('when applied sort is "relevance", returns expected base request with expected #sort.sortCriteria', () => {
        state.commerceSort = {
          ...getCommerceSortInitialState(),
          appliedSort: {
            by: SortBy.Relevance,
          },
        };

        const request = Actions.buildCommerceAPIRequest(
          state,
          navigatorContext
        );

        expect(mockedBuildBaseCommerceAPIRequest).toHaveBeenCalledWith(
          state,
          navigatorContext
        );

        const expectedWithSort: CommerceAPIRequest = {
          ...mockedBuildBaseCommerceAPIRequest.mock.results[0].value,
          facets: [],
          sort: {
            sortCriteria: SortBy.Relevance,
          },
        };

        expect(request).toEqual(expectedWithSort);
      });

      it('when applied sort is "fields", returns expected base request with expected #sort.sortCriteria and #sort.fields', () => {
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

        const request = Actions.buildCommerceAPIRequest(
          state,
          navigatorContext
        );

        expect(mockedBuildBaseCommerceAPIRequest).toHaveBeenCalledWith(
          state,
          navigatorContext
        );

        const expectedWithSort: CommerceAPIRequest = {
          ...mockedBuildBaseCommerceAPIRequest.mock.results[0].value,
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

        expect(request).toEqual(expectedWithSort);
      });
    });
  });

  describe('#buildInstantProductsAPIRequest', () => {
    let state: Actions.ListingAndSearchStateNeededByQueryCommerceAPI;
    let mockedBuildInstantProductsAPIRequest: MockInstance;

    beforeEach(() => {
      vi.clearAllMocks();
      state = buildMockCommerceState();
      mockedBuildInstantProductsAPIRequest = vi.spyOn(
        Actions,
        'buildInstantProductsAPIRequest'
      );
    });

    it('given a state that has commercePagination, returns request without it', () => {
      state.commercePagination = {
        principal: {
          page: 1,
          perPage: 10,
          totalEntries: 50,
          totalPages: 5,
        },
        recommendations: {},
      };

      const request = Actions.buildInstantProductsAPIRequest(
        state,
        navigatorContext
      );

      expect(mockedBuildInstantProductsAPIRequest).toHaveBeenCalledWith(
        state,
        navigatorContext
      );

      expect(request.page).toEqual(undefined);
    });
  });
});
