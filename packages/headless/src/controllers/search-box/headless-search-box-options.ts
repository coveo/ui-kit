import {
  BooleanValue,
  NumberValue,
  Schema,
  StringValue,
  RecordValue,
} from '@coveo/bueno';
import {SuggestionHighlightingOptions} from '../../utils/highlight';

export interface SearchBoxOptions extends DefaultSearchBoxOptions {
  id?: string;
  highlightOptions?: SuggestionHighlightingOptions;
}

interface DefaultSearchBoxOptions {
  numberOfSuggestions?: number;
  enableQuerySyntax?: boolean;
}

export const defaultSearchBoxOptions: Required<DefaultSearchBoxOptions> = {
  enableQuerySyntax: false,
  numberOfSuggestions: 5,
};

const openCloseDelimitersDefinition = {
  open: new StringValue(),
  close: new StringValue(),
};

export const searchBoxOptionDefinitions = {
  /**
   * A unique identifier for the controller.
   * By default, a unique random identifier is generated.
   */
  id: new StringValue({required: true, emptyAllowed: false}),
  /**
   * The number of query suggestions to request from Coveo ML (e.g., `3`).
   *
   * Using the value `0` disables the query suggest feature.
   *
   * @default 5
   */
  numberOfSuggestions: new NumberValue({min: 0}),
  /**
   * Whether to interpret advanced [Coveo Cloud query syntax](https://docs.coveo.com/en/1814/searching-with-coveo/search-prefixes-and-operators) in the query.
   *
   * @default false
   */
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

const defaultOpenClose = {
  open: '',
  close: '',
};

export const defaultSuggestionHighlightingOptions: SuggestionHighlightingOptions = {
  notMatchDelimiters: defaultOpenClose,
  exactMatchDelimiters: defaultOpenClose,
  correctionDelimiters: defaultOpenClose,
};
