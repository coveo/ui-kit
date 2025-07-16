import type {
  PageParam,
  PerPageParam,
  QueryParam,
} from '../../../api/commerce/commerce-api-params.js';
import type {BaseCommerceAPIRequest} from '../../../api/commerce/common/request.js';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {CommerceQuerySection} from '../../../state/state-sections.js';
import {
  buildBaseCommerceAPIRequest,
  type StateNeededForBaseCommerceAPIRequest,
} from '../common/base-commerce-api-request-builder.js';

export type StateNeededForPlanCommerceAPIRequest =
  StateNeededForBaseCommerceAPIRequest & CommerceQuerySection;

type CommercePlanRequest = BaseCommerceAPIRequest &
  QueryParam &
  PageParam &
  PerPageParam;

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
    page: 0,
    perPage: 1,
    query: state.commerceQuery.query,
  };
};
