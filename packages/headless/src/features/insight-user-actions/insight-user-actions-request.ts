import {InsightUserActionsRequest} from '../../api/service/insight/user-actions/user-actions-request';
import {
  ConfigurationSection,
  InsightConfigurationSection,
  InsightUserActionSection,
} from '../../state/state-sections';

export type StateNeededByFetchUserActions = ConfigurationSection &
  InsightConfigurationSection &
  InsightUserActionSection;

export const buildFetchUserActionsRequest = async (
  state: StateNeededByFetchUserActions,
  userId: string
): Promise<InsightUserActionsRequest> => {
  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    url: state.configuration.platformUrl,
    userId,
  };
};
