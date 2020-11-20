import {BooleanValue, NumberValue, StringValue} from '@coveo/bueno';
import {randomID} from '../../utils/utils';

export const searchBoxOptionDefinitions = {
  /**
   * A unique identifier for the controller.
   * By default, a unique random identifier is generated.
   */
  id: new StringValue({
    default: () => randomID('search_box'),
    emptyAllowed: false,
  }),
  /**
   * The number of query suggestions to request from Coveo ML (e.g., `3`).
   *
   * Using the value `0` disables the query suggest feature.
   *
   * @default 5
   */
  numberOfSuggestions: new NumberValue({default: 5, min: 0}),
  /**
   * Whether to interpret advanced [Coveo Cloud query syntax](https://docs.coveo.com/en/1814/searching-with-coveo/search-prefixes-and-operators) in the query.
   *
   * @default false
   */
  enableQuerySyntax: new BooleanValue({default: false}),
};
