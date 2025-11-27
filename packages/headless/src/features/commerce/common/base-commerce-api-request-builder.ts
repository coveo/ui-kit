import {getAnalyticsSource} from '../../../api/analytics/analytics-selectors.js';
import {getCommerceApiBaseUrl} from '../../../api/commerce/commerce-api-client.js';
import type {BaseCommerceAPIRequest} from '../../../api/commerce/common/request.js';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {
  CartSection,
  CommerceConfigurationSection,
  CommerceContextSection,
  VersionSection,
} from '../../../state/state-sections.js';
import {getProductsFromCartState} from '../context/cart/cart-state.js';

export type StateNeededForBaseCommerceAPIRequest =
  CommerceConfigurationSection &
    CommerceContextSection &
    CartSection &
    Partial<VersionSection>;

export const buildBaseCommerceAPIRequest = (
  state: StateNeededForBaseCommerceAPIRequest,
  navigatorContext: NavigatorContext
): BaseCommerceAPIRequest => {
  const {view, location, ...restOfContext} = state.commerceContext;
  return {
    accessToken: state.configuration.accessToken,
    url:
      state.configuration.commerce.apiBaseUrl ??
      getCommerceApiBaseUrl(
        state.configuration.organizationId,
        state.configuration.environment
      ),
    organizationId: state.configuration.organizationId,
    trackingId: state.configuration.analytics.trackingId!,
    ...restOfContext,
    ...(state.configuration.analytics.enabled
      ? {clientId: navigatorContext.clientId}
      : {}),
    context: {
      user: {
        ...location,
        ...(navigatorContext.userAgent
          ? {userAgent: navigatorContext.userAgent}
          : {}),
      },
      view: {
        ...view,
        ...(navigatorContext.referrer
          ? {referrer: navigatorContext.referrer}
          : {}),
      },
      capture:
        navigatorContext.capture ??
        (state.configuration.analytics.enabled &&
          navigatorContext.clientId !== ''),
      cart: getProductsFromCartState(state.cart),
      source: getAnalyticsSource(state.configuration.analytics),
    },
  };
};
