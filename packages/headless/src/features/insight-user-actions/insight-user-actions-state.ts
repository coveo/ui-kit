import {InsightAPIErrorStatusResponse} from '../../api/service/insight/insight-api-client';

// If ticketcreation date not in a session, we pass preceding/following sessions based on the ticket creation date
export interface UserActionTimeline {
  precedingSessions: UserSession[];
  session: UserSession | undefined;
  followingSessions: UserSession[];
  caseSessionFound: boolean;
}

export interface UserSession {
  start: string;
  end: string;
  actions: UserAction[];
}

export interface UserAction {
  actionType: UserActionType;
  timestamp: string;
  eventData?: {
    type?: string;
    value?: string;
  };
  cause?: string;
  searchHub?: string;
  document?: {
    title?: string;
    clickUri?: string; // Will be supported later
    uriHash?: string;
    contentIdKey?: string;
    contentIdValue?: string;
  };
  query?: string;
}

export enum UserActionType {
  SEARCH = 'SEARCH',
  CLICK = 'CLICK',
  VIEW = 'VIEW',
  CUSTOM = 'CUSTOM',
  TICKET_CREATION = 'TICKET_CREATION',
}

export interface UserActionsState {
  /**
   * The timeline of user actions.
   */
  timeline?: UserActionTimeline;
  /**
   * The names of custom actions to exclude from the user actions.
   */
  excludedCustomActions: string[];
  /**
   * The ticket creation date in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format.
   */
  ticketCreationDate?: string;
  /**
   * `true` if fetching the user actions is in progress and `false` otherwise.
   */
  loading: boolean;
  /**
   * The error response if fetching the user actions failed.
   */
  error?: InsightAPIErrorStatusResponse;
}

export function getInsightUserActionsInitialState(): UserActionsState {
  return {
    timeline: undefined,
    excludedCustomActions: [],
    loading: false,
  };
}
