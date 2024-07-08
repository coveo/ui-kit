import {Schema} from '@coveo/bueno';
import {SuggestionHighlightingOptions} from '../../core/search-box/headless-core-search-box';
import {searchBoxOptionDefinitions as coreSearchBoxOptionDefinitions} from '../../core/search-box/headless-core-search-box-options';

export interface SearchBoxOptions {
  /**
   * A unique identifier for the controller.
   *
   * By default, a unique random identifier is generated.
   */
  id?: string;

  /**
   * The delimiters to use to highlight parts of a query suggestion depending on whether that part matches, does not match, or corrects the query.
   */
  highlightOptions?: SuggestionHighlightingOptions;

  /**
   * Whether to clear all active query filters when the end user submits a new query from the search box.
   *
   * Setting this option to `false` is not recommended and can lead to an increased number of queries returning no results.
   */
  clearFilters?: boolean;
}

type DefaultSearchBoxOptions = Pick<SearchBoxOptions, 'clearFilters'>;

export const defaultSearchBoxOptions: Required<DefaultSearchBoxOptions> = {
  clearFilters: true,
};

const {id, highlightOptions, clearFilters} = coreSearchBoxOptionDefinitions;
export const searchBoxOptionDefinitions = {id, highlightOptions, clearFilters};

export const searchBoxOptionsSchema = new Schema<Required<SearchBoxOptions>>(
  searchBoxOptionDefinitions
);
