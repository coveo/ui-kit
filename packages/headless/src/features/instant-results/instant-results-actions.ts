import {createAction} from '@reduxjs/toolkit';
import {InstantResultSection} from '../../state/state-sections';
import {
  validatePayload,
  requiredEmptyAllowedString,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {StateNeededByExecuteSearch} from '../search/search-actions';
import {Result} from '../../case-assist.index';
export interface RegisterInstantResultActionCreatorPayload {
  /**
   * The search box ID.
   */
  id: string;
}

export interface UpdateInstantResultQueryActionCreatorPayload {
  /**
   * The search box ID.
   */
  id: string;
  /**
   * The initial basic query expression for instant results.
   */
  q: string;
}

export interface ClearExpiredInstantResultsActionCreatorPayload {
  /**
   * The search box id.
   */
  id: string;
}

const instantResultsRegisterDefinition = {
  id: requiredNonEmptyString,
};

const instantResultsQueryDefinition = {
  ...instantResultsRegisterDefinition,
  q: requiredEmptyAllowedString,
};

export const registerInstantResults = createAction(
  'instantResults/register',
  (payload: RegisterInstantResultActionCreatorPayload) =>
    validatePayload(payload, instantResultsRegisterDefinition)
);

export const updateInstantResultsQuery = createAction(
  'instantResults/updateQuery',
  (payload: UpdateInstantResultQueryActionCreatorPayload) =>
    validatePayload(payload, instantResultsQueryDefinition)
);

export const clearExpiredResults = createAction(
  'instantResults/clearExpired',
  (payload: ClearExpiredInstantResultsActionCreatorPayload) =>
    validatePayload(payload, instantResultsRegisterDefinition)
);

export interface FetchInstantResultsActionCreatorPayload {
  /**
   * The search box ID.
   */
  id: string;
  /**
   * The query for which instant results are retrieved.
   */
  q: string;
  /**
   * The maximum items to be stored in the instant result list for each query.
   */
  maxResultsPerQuery: number;
  /**
   * The maximum items to be stored in the instant result list for each query.
   */
  cacheTimeout?: number;
}

export interface FetchInstantResultsThunkReturn {
  results: Result[];
}

export type StateNeededByInstantResults = StateNeededByExecuteSearch &
  InstantResultSection;
