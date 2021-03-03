import {
  BooleanValue,
  NumberValue,
  Schema,
  StringValue,
  RecordValue,
} from '@coveo/bueno';
import {SuggestionHighlightingOptions} from '../../utils/highlight';
import {requiredNonEmptyString} from '../../utils/validate-payload';

export interface SearchBoxOptions {
  /**
   * A unique identifier for the controller.
   * By default, a unique random identifier is generated.
   */
  id?: string;

  /**
   * Whether to interpret advanced [Coveo Cloud query syntax](https://docs.coveo.com/en/1814/searching-with-coveo/search-prefixes-and-operators) in the query.
   *
   * @default false
   */
  enableQuerySyntax?: boolean;

  /**
   * Specifies delimiters to highlight parts of a query suggestion that e.g match, do not match the query.
   */
  highlightOptions?: SuggestionHighlightingOptions;

  /**
   * The number of query suggestions to request from Coveo ML (e.g., `3`).
   *
   * Using the value `0` disables the query suggest feature.
   *
   * @default 5
   */
  numberOfSuggestions?: number;
}

type DefaultSearchBoxOptions = Pick<
  SearchBoxOptions,
  'enableQuerySyntax' | 'numberOfSuggestions'
>;

export const defaultSearchBoxOptions: Required<DefaultSearchBoxOptions> = {
  enableQuerySyntax: false,
  numberOfSuggestions: 5,
};

const openCloseDelimitersDefinition = {
  open: new StringValue(),
  close: new StringValue(),
};

export const searchBoxOptionDefinitions = {
  id: requiredNonEmptyString,
  numberOfSuggestions: new NumberValue({min: 0}),
  enableQuerySyntax: new BooleanValue(),
  highlightOptions: new RecordValue({
    values: {
      notMatchDelimiters: new RecordValue({
        values: openCloseDelimitersDefinition,
      }),

      exactMatchDelimiters: new RecordValue({
        values: openCloseDelimitersDefinition,
      }),

      correctionDelimiters: new RecordValue({
        values: openCloseDelimitersDefinition,
      }),
    },
  }),
};

export const searchBoxOptionsSchema = new Schema<Required<SearchBoxOptions>>(
  searchBoxOptionDefinitions
);
