import * as z from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload.js';

export interface AdvancedSearchQueryActionCreatorPayload {
  /**
   * The advanced query.
   */
  aq?: string;

  /**
   * The constant query.
   */
  cq?: string;

  /**
   * The large query.
   */
  lq?: string;

  /**
   * The disjunction query
   */
  dq?: string;
}

const advancedSearchQueriesSchema = z.object({
  aq: z.optional(z.string()),
  cq: z.optional(z.string()),
  lq: z.optional(z.string()),
  dq: z.optional(z.string()),
});

export const updateAdvancedSearchQueries = createAction(
  'advancedSearchQueries/update',
  (payload: AdvancedSearchQueryActionCreatorPayload) =>
    validatePayload(payload, advancedSearchQueriesSchema)
);

export const registerAdvancedSearchQueries = createAction(
  'advancedSearchQueries/register',
  (payload: AdvancedSearchQueryActionCreatorPayload) =>
    validatePayload(payload, advancedSearchQueriesSchema)
);
