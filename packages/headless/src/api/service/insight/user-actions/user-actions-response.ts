import {UserActionType} from '../../../../features/insight-user-actions/insight-user-actions-state';

export interface InsightUserActionsResponse {
  value: Array<UserAction>;
}

interface UserAction {
  name: UserActionType;
  time: string;
  value: string;
}
