import type {CommercePlanRequest} from '../../../api/commerce/search/plan/plan-request.js';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {CommerceQuerySection} from '../../../state/state-sections.js';
import {
  buildBaseCommerceAPIRequest,
  type StateNeededForBaseCommerceAPIRequest,
} from '../common/base-commerce-api-request-builder.js';

export type StateNeededForPlanCommerceAPIRequest =
  StateNeededForBaseCommerceAPIRequest & CommerceQuerySection;

export const buildPlanRequest = (
  state: StateNeededForPlanCommerceAPIRequest,
  navigatorContext: NavigatorContext
): CommercePlanRequest => {
  const baseRequest = buildBaseCommerceAPIRequest(state, navigatorContext);
  return {
    ...baseRequest,
    context: {
      ...baseRequest.context,
      capture: false,
    },
    query: state.commerceQuery.query,
  };
};
