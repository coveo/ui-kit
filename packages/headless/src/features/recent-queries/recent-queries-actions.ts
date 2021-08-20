import {createAction} from '@reduxjs/toolkit';
import {ArrayValue, NumberValue, StringValue} from '@coveo/bueno';
import {validatePayload} from '../../utils/validate-payload';

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

const registerRecentQueriesPayloadDefinition = {
  queries: new ArrayValue({
    required: true,
    each: new StringValue({emptyAllowed: false}),
  }),
  maxLength: new NumberValue({required: true, min: 1, default: 10}),
};

/**
 * Initializes the `recentQueries` state.
 * @param payload (RegisterRecentQueriesCreatorPayload) The initial state and options.
 */
export const registerRecentQueries = createAction(
  'recentQueries/registerRecentQueries',
  (payload: RegisterRecentQueriesCreatorPayload) =>
    validatePayload(payload, registerRecentQueriesPayloadDefinition)
);

/**
 * Clears the recent queries list.
 */
export const clearRecentQueries = createAction(
  'recentQueries/clearRecentQueries'
);
