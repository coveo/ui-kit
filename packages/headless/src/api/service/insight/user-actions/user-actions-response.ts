export interface InsightUserActionsResponse {
  timeline?: UserActionTimeline;
}

interface UserActionTimeline {
  sessions: UserSession[];
}

interface UserSession {
  start: Date;
  end: Date;
  actions: UserAction[];
}

type UserActionType = 'SEARCH' | 'CLICK' | 'VIEW' | 'CUSTOM';
interface UserAction {
  actionType: UserActionType;
  timestamp: Date;
  raw: Record<string, string>;
  searchHub?: string;
  document?: string;
  query?: string;
}
