export enum UserActionType {
  SEARCH = 'SEARCH',
  CLICK = 'CLICK',
  VIEW = 'VIEW',
  CUSTOM = 'CUSTOM',
  TICKET_CREATE = 'TICKET_CREATE',
}

export interface InsightUserActionsResponse {
  value: Array<UserAction>;
}

// interface UserActionTimeline {
//   sessions: UserSession[];
// }

// interface UserSession {
//   start: Date;
//   end: Date;
//   actions: UserAction[];
// }

interface UserAction {
  name: UserActionType;
  time: string;
  value: string;
}
