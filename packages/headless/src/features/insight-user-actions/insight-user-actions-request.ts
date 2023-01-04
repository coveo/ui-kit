import {InsightUserActionsRequest} from '../../api/service/insight/user-actions/user-actions-request';
import {
  ConfigurationSection,
  InsightConfigurationSection,
  InsightUserActionSection,
} from '../../state/state-sections';

export type StateNeededByFetchUserActions = ConfigurationSection &
  InsightConfigurationSection &
  InsightUserActionSection;

export const buildFetchUserActionRequest = async (
  s: StateNeededByFetchUserActions
): Promise<InsightUserActionsRequest> => {
  return {
    accessToken: s.configuration.accessToken,
    organizationId: s.configuration.organizationId,
    url: s.configuration.platformUrl,
    insightId: s.insightConfiguration.insightId,
    ticketCreationDate:
      s.insightUserAction.ticketCreationDate ?? new Date().toISOString(),
    numberSessionsBefore: s.insightUserAction.numberSessionsBefore,
    numberSessionsAfter: s.insightUserAction.numberSessionsAfter,
    excludedCustomActions: s.insightUserAction.excludedCustomActions,
  };
};
