import {createAction} from '@reduxjs/toolkit';
import {ArrayValue, NumberValue} from '../../../../bueno/dist';
import {validatePayload} from '../../utils/validate-payload';

export interface RegisterRecentQueriesCreatorPayload {
  /**
   * The recent queries made by the user prior to instantiating the controller.
   */
  queries: string[];
  /**
   * The maximum number of queries to retain in the list.
   */
  maxQueries: number;
}

const registerRecentQueriesPayloadDefinition = {
  queries: new ArrayValue({required: false}),
  maxQueries: new NumberValue({required: true, default: 10}),
};

/**
 * Initialize the `recentQueries` state.
 * @param payload (RegisterRecentQueriesCreatorPayload) The initial state and options.
 */
export const registerRecentQueries = createAction(
  'recentQueries/registerRecentQueries',
  (payload: RegisterRecentQueriesCreatorPayload) =>
    validatePayload(payload, registerRecentQueriesPayloadDefinition)
);

/**
 * Clear the recent queries list.
 */
export const clearRecentQueries = createAction(
  'recentQueries/clearRecentQueries'
);
