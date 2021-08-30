import {createAction} from '@reduxjs/toolkit';
import {ArrayValue, NumberValue, RecordValue} from '@coveo/bueno';
import {validatePayload} from '../../utils/validate-payload';
import {Result} from '../../api/search/search/result';
import {
  resultPartialDefinition,
  validateResultPayload,
} from '../analytics/analytics-utils';

export interface RegisterRecentResultsCreatorPayload {
  /**
   * The recent results viewed by the user prior to instantiating the controller.
   */
  results: Result[];
  /**
   * The maximum number of queries to retain in the list.
   */
  maxLength: number;
}

const registerRecentResultsPayloadDefinition = {
  results: new ArrayValue({
    required: true,
    each: new RecordValue({values: resultPartialDefinition}),
  }),
  maxLength: new NumberValue({required: true, min: 1, default: 10}),
};

/**
 * Initialize the `recentResults` state.
 * @param payload (RegisterRecentResultsCreatorPayload) The initial state and options.
 */
export const registerRecentResults = createAction(
  'recentResults/registerRecentResults',
  (payload: RegisterRecentResultsCreatorPayload) =>
    validatePayload(payload, registerRecentResultsPayloadDefinition)
);

/**
 * Push a recent result to the list.
 * @param payload (Result) The recently viewed result to push to the list.
 */
export const pushRecentResult = createAction(
  'recentResults/pushRecentResult',
  (payload: Result) => {
    validateResultPayload(payload);
    return {
      payload,
    };
  }
);

/**
 * Clear the recent results list.
 */
export const clearRecentResults = createAction(
  'recentResults/clearRecentResults'
);
