import type {Relay} from '@coveo/relay';
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
  navigatorContext: NavigatorContext,
  relay: Relay
): BaseCommerceAPIRequest => {
  const {view, location, ...restOfContext} = state.commerceContext;
  const {clientId, referrer, userAgent} = relay.getMeta('');
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
    ...(state.configuration.analytics.enabled ? {clientId} : {}),
    context: {
      user: {
        ...location,
        ...(userAgent ? {userAgent} : {}),
      },
      view: {
        ...view,
        ...(referrer ? {referrer} : {}),
      },
      capture:
        navigatorContext.capture ?? state.configuration.analytics.enabled,
      cart: getProductsFromCartState(state.cart),
      source: getAnalyticsSource(state.configuration.analytics),
    },
  };
};
