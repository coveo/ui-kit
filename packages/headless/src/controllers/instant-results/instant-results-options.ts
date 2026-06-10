import * as z from '@coveo/bueno/zod';
import {nonEmptyString} from '../../utils/validate-payload.js';

export interface InstantResultOptions {
  /**
   * A unique identifier for the search box.
   */
  searchBoxId?: string;
  /**
   * The maximum items to be stored in the instant result list for each query.
   */
  maxResultsPerQuery: number;
  /**
   * Number in milliseconds that cached results will be valid for. Defaults to 1 minute. Set to 0 so that results never expire.
   */
  cacheTimeout?: number;
}

const instantResultsOptionDefinitions = {
  searchBoxId: nonEmptyString,
  maxResultsPerQuery: z.number().check(z.minimum(1)),
  cacheTimeout: z.optional(z.number()),
};

export const instantResultsOptionsSchema = z.object(
  instantResultsOptionDefinitions
);
