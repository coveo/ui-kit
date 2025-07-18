import type {PaginatedCommerceAPIRequest} from '../../../api/commerce/common/request.js';
import {
  defaultNodeJSNavigatorContextProvider,
  type NavigatorContext,
} from '../../../app/navigator-context-provider.js';
import {buildMockBaseCommerceAPIRequest} from '../../../test/mock-commerce-api-request.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {getCartInitialState} from '../context/cart/cart-state.js';
import {getContextInitialState} from '../context/context-state.js';
import {getCommercePaginationInitialState} from '../pagination/pagination-state.js';
import {buildBaseCommerceAPIRequest} from './base-commerce-api-request-builder.js';
import {
  buildPaginatedCommerceAPIRequest,
  type StateNeededForPaginatedCommerceAPIRequest,
} from './paginated-commerce-api-request-builder.js';

vi.mock('./base-commerce-api-request-builder.js');

describe('#buildPaginatedCommerceAPIRequest', () => {
  let state: StateNeededForPaginatedCommerceAPIRequest;
  let navigatorContext: NavigatorContext;

  const slotId = 'slotId';
  const mockBaseCommerceAPIRequest = buildMockBaseCommerceAPIRequest();

  const setState = (
    configuration?: Partial<StateNeededForPaginatedCommerceAPIRequest>
  ) => {
    state = {
      configuration: getConfigurationInitialState(),
      cart: getCartInitialState(),
      commerceContext: getContextInitialState(),
      commercePagination: getCommercePaginationInitialState(),
      ...configuration,
    };
  };

  const setNavigatorContext = (configuration?: Partial<NavigatorContext>) => {
    navigatorContext = {
      ...defaultNodeJSNavigatorContextProvider(),
      ...configuration,
    };
  };
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(buildBaseCommerceAPIRequest).mockReturnValue(
      mockBaseCommerceAPIRequest
    );
    setState();
    setNavigatorContext();
  });

  it('sets base properties to the value returned by #buildBaseCommerceAPIRequest(#state, #navigatorContext)', () => {
    const {
      page: _page,
      perPage: _perPage,
      ...restOfRequest
    } = buildPaginatedCommerceAPIRequest(state, navigatorContext, slotId);

    expect(buildBaseCommerceAPIRequest).toHaveBeenCalledWith(
      state,
      navigatorContext
    );
    expect(restOfRequest).toEqual(mockBaseCommerceAPIRequest);
  });

  describe('when #state.commercePagination is undefined', () => {
    let request: PaginatedCommerceAPIRequest;
    beforeEach(() => {
      setState({
        commercePagination: undefined,
      });
      request = buildPaginatedCommerceAPIRequest(state, navigatorContext);
    });

    it('does not set #page', () => {
      expect(request.page).toBeUndefined();
    });

    it('does not set #perPage', () => {
      expect(request.perPage).toBeUndefined();
    });
  });

  describe('when #state.commercePagination is defined', () => {
    const recommendationsPage = 0;
    const recommendationsPerPage = 25;
    const principalPage = recommendationsPage + 1;
    const principalPerPage = recommendationsPerPage + 1;

    beforeEach(() => {
      state.commercePagination = {
        principal: {
          page: principalPage,
          perPage: principalPerPage,
          totalEntries: 100,
          totalPages: 10,
        },
        recommendations: {
          [slotId]: {
            page: recommendationsPage,
            perPage: recommendationsPerPage,
            totalEntries: 100,
            totalPages: 4,
          },
        },
      };
    });

    describe('when #slotId is undefined', () => {
      let request: PaginatedCommerceAPIRequest;
      beforeEach(() => {
        request = buildPaginatedCommerceAPIRequest(state, navigatorContext);
      });
      it('sets #page to #state.commercePagination.principal.page', () => {
        expect(request.page).toEqual(principalPage);
      });

      it('sets #perPage to #state.commercePagination.principal.perPage', () => {
        expect(request.perPage).toEqual(principalPerPage);
      });
    });

    describe('when #slotId is defined', () => {
      let request: PaginatedCommerceAPIRequest;
      beforeEach(() => {
        request = buildPaginatedCommerceAPIRequest(
          state,
          navigatorContext,
          slotId
        );
      });

      it('sets #page to #state.commercePagination.recommendations[slotId].page', () => {
        expect(request.page).toEqual(recommendationsPage);
      });

      it('sets #perPage to #state.commercePagination.recommendations[slotId].perPage', () => {
        expect(request.perPage).toEqual(recommendationsPerPage);
      });
    });
  });
});
