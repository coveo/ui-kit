import {ArrayValue, NumberValue, RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import type {Result} from '../../api/search/search/result.js';
import {validatePayload} from '../../utils/validate-payload.js';
import {
  resultPartialDefinition,
  validateResultPayload,
} from '../analytics/analytics-utils.js';

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

export const registerRecentResults = createAction(
  'recentResults/registerRecentResults',
  (payload: RegisterRecentResultsCreatorPayload) =>
    validatePayload(payload, registerRecentResultsPayloadDefinition)
);

export const pushRecentResult = createAction(
  'recentResults/pushRecentResult',
  (payload: Result) => {
    validateResultPayload(payload);
    return {
      payload,
    };
  }
);

export const clearRecentResults = createAction(
  'recentResults/clearRecentResults'
);
