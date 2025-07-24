import {createAction} from '@reduxjs/toolkit';
import type {Result} from '../../api/search/search/result.js';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';

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
   * Number in milliseconds that cached results will be valid for. Set to 0 so that results never expire.
   */
  cacheTimeout?: number;
}

export interface FetchInstantResultsThunkReturn {
  results: Result[];
  searchUid: string;
  totalCountFiltered: number;
  duration: number;
}
