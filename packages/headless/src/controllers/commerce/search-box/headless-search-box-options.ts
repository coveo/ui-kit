import {BooleanValue, Schema} from '@coveo/bueno';
import {
  type SearchBoxOptions as CoreSearchBoxOptions,
  searchBoxOptionDefinitions as coreSearchBoxOptionDefinitions,
} from '../../core/search-box/headless-core-search-box-options.js';

export type SearchBoxOptions = Pick<
  CoreSearchBoxOptions,
  'id' | 'highlightOptions' | 'clearFilters'
> & {
  /**
   * When set to true, fills the `results` field rather than the `products` field
   * in the response. It may also include Spotlight Content in the results.
   * @default false
   */
  enableResults?: boolean;
};

type DefaultSearchBoxOptions = Pick<
  SearchBoxOptions,
  'clearFilters' | 'enableResults'
>;

export const defaultSearchBoxOptions: Required<DefaultSearchBoxOptions> = {
  clearFilters: true,
  enableResults: false,
};

const {id, highlightOptions, clearFilters} = coreSearchBoxOptionDefinitions;
export const searchBoxOptionDefinitions = {
  id,
  highlightOptions,
  clearFilters,
  enableResults: new BooleanValue(),
};

export const searchBoxOptionsSchema = new Schema<Required<SearchBoxOptions>>(
  searchBoxOptionDefinitions
);
