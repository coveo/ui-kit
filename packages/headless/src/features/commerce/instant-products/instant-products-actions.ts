import {createAction} from '@reduxjs/toolkit';
import {
  validatePayload,
  requiredEmptyAllowedString,
  requiredNonEmptyString,
} from '../../../utils/validate-payload';

export interface RegisterInstantProductActionCreatorPayload {
  /**
   * The search box ID.
   */
  id: string;
}

export interface UpdateInstantProductQueryActionCreatorPayload {
  /**
   * The search box ID.
   */
  id: string;
  /**
   * The initial basic query expression for instant products.
   */
  query: string;
}

export interface ClearExpiredInstantProductsActionCreatorPayload {
  /**
   * The search box id.
   */
  id: string;
}

const instantProductsRegisterDefinition = {
  id: requiredNonEmptyString,
};

const instantProductsQueryDefinition = {
  ...instantProductsRegisterDefinition,
  query: requiredEmptyAllowedString,
};

export const registerInstantProducts = createAction(
  'instantProducts/register',
  (payload: RegisterInstantProductActionCreatorPayload) =>
    validatePayload(payload, instantProductsRegisterDefinition)
);

export const updateInstantProductsQuery = createAction(
  'instantProducts/updateQuery',
  (payload: UpdateInstantProductQueryActionCreatorPayload) =>
    validatePayload(payload, instantProductsQueryDefinition)
);

export const clearExpiredProducts = createAction(
  'instantProducts/clearExpired',
  (payload: ClearExpiredInstantProductsActionCreatorPayload) =>
    validatePayload(payload, instantProductsRegisterDefinition)
);

export interface FetchInstantProductsActionCreatorPayload {
  /**
   * The search box ID.
   */
  id: string;
  /**
   * The query for which instant products are retrieved.
   */
  query: string;
  /**
   * The maximum items to be stored in the instant product list for each query.
   */
  maxProductsPerQuery: number;
  /**
   * Number in milliseconds that cached products will be valid for. Set to 0 so that products never expire.
   */
  cacheTimeout?: number;
}
