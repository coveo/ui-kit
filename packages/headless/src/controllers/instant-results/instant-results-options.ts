import {requiredNonEmptyString} from '../../utils/validate-payload';
import {NumberValue, Schema} from '@coveo/bueno';

export interface InstantResultOptions {
  /**
   * A unique identifier for the search box.
   */
  searchBoxId: string;
  /**
   * The maximum items to be stored in the instant result list for each query.
   */
  maxResultsPerQuery: number;
}

export const instantResultsOptionDefinitions = {
  searchBoxId: requiredNonEmptyString,
  maxResultsPerQuery: new NumberValue({
    required: true,
    min: 1,
  }),
};

export const instantResultsOptionsSchema = new Schema<
  Required<InstantResultOptions>
>(instantResultsOptionDefinitions);
