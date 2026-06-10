import {z} from '@coveo/bueno/zod';
import type {SuggestionHighlightingOptions} from '../../../utils/highlight.js';
import {requiredNonEmptyString} from '../../../utils/validate-payload.js';

export interface SearchBoxOptions {
  /**
   * A unique identifier for the controller.
   * By default, a unique random identifier is generated.
   */
  id?: string;

  /**
   * Whether to interpret advanced [Coveo query syntax](https://docs.coveo.com/en/1552/) in the query.
   *
   * @defaultValue `false`
   */
  enableQuerySyntax?: boolean;

  /**
   * Specifies delimiters to highlight parts of a query suggestion that e.g match, do not match the query.
   */
  highlightOptions?: SuggestionHighlightingOptions;

  /**
   * The number of query suggestions to request from Coveo ML (for example, `3`).
   *
   * Using the value `0` disables the query suggest feature.
   *
   * @defaultValue `5`
   */
  numberOfSuggestions?: number;

  /**
   * Whether to clear all active query filters when the end user submits a new query from the search box.
   * Setting this option to "false" is not recommended and can lead to an increasing number of queries returning no results.
   */
  clearFilters?: boolean;
}

type DefaultSearchBoxOptions = Pick<
  SearchBoxOptions,
  'enableQuerySyntax' | 'numberOfSuggestions' | 'clearFilters'
>;

export const defaultSearchBoxOptions: Required<DefaultSearchBoxOptions> = {
  enableQuerySyntax: false,
  numberOfSuggestions: 5,
  clearFilters: true,
};

const openCloseDelimitersSchema = z.object({
  open: z.optional(z.string()),
  close: z.optional(z.string()),
});

export const searchBoxOptionDefinitions = {
  id: requiredNonEmptyString,
  numberOfSuggestions: z.optional(z.number().check(z.minimum(0))),
  enableQuerySyntax: z.optional(z.boolean()),
  highlightOptions: z.optional(
    z.object({
      notMatchDelimiters: z.optional(openCloseDelimitersSchema),
      exactMatchDelimiters: z.optional(openCloseDelimitersSchema),
      correctionDelimiters: z.optional(openCloseDelimitersSchema),
    })
  ),
  clearFilters: z.optional(z.boolean()),
};

export const searchBoxOptionsSchema = z.object(searchBoxOptionDefinitions);
