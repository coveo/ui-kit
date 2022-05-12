import {requiredNonEmptyString} from '../../utils/validate-payload';
import {Schema} from '@coveo/bueno';

export interface InstantResultOptions {
  /**
   * A unique identifier for the search box.
   */
  searchBoxId: string;
}

export const instantResultsOptionDefinitions = {
  searchBoxId: requiredNonEmptyString,
};

export const instantResultsOptionsSchema = new Schema<
  Required<InstantResultOptions>
>(instantResultsOptionDefinitions);
