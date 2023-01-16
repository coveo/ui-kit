export enum UserActionType {
  SEARCH = 'SEARCH',
  CLICK = 'CLICK',
  VIEW = 'VIEW',
  CUSTOM = 'CUSTOM',
}

export interface InsightUserActionsResponse {
  timeline: UserActionTimeline;
}

export interface UserActionTimeline {
  precedingSessions: UserSession[];
  session: UserSession;
  followingSessions: UserSession[];
}

export interface UserSession {
  start: string;
  end: string;
  actions: UserAction[];
}

export interface UserAction {
  actionType: UserActionType;
  timestamp: string;
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
}
