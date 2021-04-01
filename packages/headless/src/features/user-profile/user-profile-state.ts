import {Result} from '../../api/search/search/result';
import {MLAPIErrorWithStatusCode} from '../../api/machine-learning/ml-api-client';

/**
 * User Actions posible type.
 */
export enum UserActionType {
  Search = 'SEARCH',
  Click = 'CLICK',
  PageView = 'VIEW',
  Custom = 'CUSTOM',
}

/**
 * Pased Action History item format.
 */
export interface ActionHistory {
  /**
   * Type of the action.
   */
  name: UserActionType;
  /**
   * When the action was done.
   */
  time: number;
  /**
   * Value associated to an actions.
   */
  value: {
    [key: string]: string;
  };
}

/**
 * Represent an action that a user has made.
 */
export class UserAction {
  constructor(
    public type: UserActionType,
    public timestamp: Date,
    public raw: {
      [key: string]: string | undefined;
      query_expression?: string;
      uri_hash?: string;
      event_type?: string;
      event_value?: string;
      origin_level_1?: string;
      cause?: string;
      content_id_key?: string;
      content_id_value?: string;
    },
    public document?: Result,
    public query?: string
  ) {}
}

export interface UserActionsState {
  actions: UserAction[];
  duration: number;
  error: MLAPIErrorWithStatusCode | null;
  isLoading: boolean;
}

export interface UserProfileState {
  userId: string;
  userActions: UserActionsState;
  debug: boolean;
}

export function getUserProfileInitialState(): UserProfileState {
  return {
    userId: '',
    userActions: {
      actions: [],
      duration: 0,
      error: null,
      isLoading: false,
    },
    debug: false,
  };
}
