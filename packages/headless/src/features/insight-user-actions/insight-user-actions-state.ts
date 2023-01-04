import {InsightAPIErrorStatusResponse} from '../../insight.index';

export enum UserActionType {
  SEARCH = 'SEARCH',
  CLICK = 'CLICK',
  VIEW = 'VIEW',
  CUSTOM = 'CUSTOM',
}

export interface InsightUserActionTimeline {
  sessions: {
    start: Date;
    end: Date;
    actions: {
      actionType: UserActionType;
      timestamp: Date;
      eventData: {
        type?: string;
        value?: string;
      };
      cause?: string;
      searchHub?: string;
      document?: {
        title: string;
        clickUri: string;
        uriHash?: string;
        contentIdKey?: string;
        contentIdValue?: string;
      };
      query?: string;
    }[];
  }[];
}

export interface UserActionState {
  timeline: InsightUserActionTimeline;
  numberSessionsBefore: number;
  numberSessionsAfter: number;
  excludedCustomActions: string[];
  ticketCreationDate?: string;
  loading: boolean;
  error?: InsightAPIErrorStatusResponse;
}

export function getInsightUserActionsInitialState(): UserActionState {
  return {
    timeline: {
      sessions: [],
    },
    numberSessionsBefore: 0,
    numberSessionsAfter: 0,
    excludedCustomActions: [],
    loading: false,
  };
}
