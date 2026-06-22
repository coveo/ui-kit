import * as z from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload.js';

export interface RegisterRecentQueriesCreatorPayload {
  /**
   * The recent queries made by the user prior to instantiating the controller.
   */
  queries: string[];
  /**
   * The maximum number of queries to retain in the list.
   */
  maxLength: number;
}

export const registerRecentQueriesPayloadDefinition = z.object({
  queries: z.array(z.string().check(z.minLength(1))),
  maxLength: z.number().check(z.minimum(1)),
});

export const registerRecentQueries = createAction(
  'recentQueries/registerRecentQueries',
  (payload: RegisterRecentQueriesCreatorPayload) =>
    validatePayload(payload, registerRecentQueriesPayloadDefinition)
);

export const clearRecentQueries = createAction(
  'recentQueries/clearRecentQueries'
);
