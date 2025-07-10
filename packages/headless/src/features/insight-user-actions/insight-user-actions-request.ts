import {getOrganizationEndpoint} from '../../api/platform-client.js';
import type {InsightUserActionsRequest} from '../../api/service/insight/user-actions/user-actions-request.js';
import type {StateNeededByFetchUserActions} from './insight-user-actions-actions.js';

export const buildFetchUserActionsRequest = async (
  state: StateNeededByFetchUserActions,
  userId: string
): Promise<InsightUserActionsRequest> => {
  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    url: getOrganizationEndpoint(
      state.configuration.organizationId,
      state.configuration.environment
    ),
    userId,
  };
};
