import type {UserActionType} from '../../../../features/insight-user-actions/insight-user-actions-state.js';

export interface InsightUserActionsResponse {
  value: Array<UserAction>;
}

interface UserAction {
  name: UserActionType;
  time: string;
  value: string;
}
