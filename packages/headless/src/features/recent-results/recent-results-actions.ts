import * as z from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import type {Result} from '../../api/search/search/result.js';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';
import {validateResultPayload} from '../analytics/analytics-utils.js';

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

const rawPartialSchema = z.object({
  urihash: z.optional(z.string()),
  sourcetype: z.optional(z.string()),
  permanentid: z.optional(z.string()),
});

const resultPartialSchema = z.object({
  uniqueId: requiredNonEmptyString,
  raw: rawPartialSchema,
  title: requiredNonEmptyString,
  uri: requiredNonEmptyString,
  clickUri: requiredNonEmptyString,
  rankingModifier: z.optional(z.string()),
});

const registerRecentResultsPayloadDefinition = z.object({
  results: z.array(resultPartialSchema),
  maxLength: z.number().check(z.minimum(1)),
});

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
