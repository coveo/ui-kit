import {
  PageParam,
  PerPageParam,
  QueryParam,
} from '../../../api/commerce/commerce-api-params.js';
import {BaseCommerceAPIRequest} from '../../../api/commerce/common/request.js';
import {NavigatorContext} from '../../../app/navigatorContextProvider.js';
import {CommerceQuerySection} from '../../../state/state-sections.js';
import {
  buildBaseCommerceAPIRequest,
  StateNeededForBaseCommerceAPIRequest,
} from '../common/base-commerce-api-request-builder.js';

export type StateNeededForPlanCommerceAPIRequest =
  StateNeededForBaseCommerceAPIRequest & CommerceQuerySection;

export type CommercePlanRequest = BaseCommerceAPIRequest &
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
