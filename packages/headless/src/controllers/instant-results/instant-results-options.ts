import {NumberValue, Schema} from '@coveo/bueno';
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
  maxResultsPerQuery: new NumberValue({
    required: true,
    min: 1,
  }),
  cacheTimeout: new NumberValue(),
};

export const instantResultsOptionsSchema = new Schema<
  Required<InstantResultOptions>
>(instantResultsOptionDefinitions);
