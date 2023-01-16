import {UserActionTimeline} from '../../api/service/insight/user-actions/user-actions-response';
import {InsightAPIErrorStatusResponse} from '../../insight.index';

export enum UserActionType {
  SEARCH = 'SEARCH',
  CLICK = 'CLICK',
  VIEW = 'VIEW',
  CUSTOM = 'CUSTOM',
}

export interface UserActionsState {
  timeline?: UserActionTimeline;
  numberSessionsBefore: number;
  numberSessionsAfter: number;
  excludedCustomActions: string[];
  ticketCreationDate?: string;
  loading: boolean;
  error?: InsightAPIErrorStatusResponse;
}

export function getInsightUserActionsInitialState(): UserActionsState {
  return {
    timeline: undefined,
    numberSessionsBefore: 0,
    numberSessionsAfter: 0,
    excludedCustomActions: [],
    loading: false,
  };
}
