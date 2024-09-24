import {ArrayValue, NumberValue, StringValue} from '@coveo/bueno';
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

export const registerRecentQueriesPayloadDefinition = {
  queries: new ArrayValue({
    required: true,
    each: new StringValue({emptyAllowed: false}),
  }),
  maxLength: new NumberValue({required: true, min: 1, default: 10}),
};

export const registerRecentQueries = createAction(
  'recentQueries/registerRecentQueries',
  (payload: RegisterRecentQueriesCreatorPayload) =>
    validatePayload(payload, registerRecentQueriesPayloadDefinition)
);

export const clearRecentQueries = createAction(
  'recentQueries/clearRecentQueries'
);
