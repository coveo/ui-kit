import {Schema} from '@coveo/bueno';
import {
  searchBoxOptionDefinitions as coreSearchBoxOptionDefinitions,
  SearchBoxOptions as CoreSearchBoxOptions,
} from '../../core/search-box/headless-core-search-box-options.js';

export type SearchBoxOptions = Pick<
  CoreSearchBoxOptions,
  'id' | 'highlightOptions' | 'clearFilters'
>;

type DefaultSearchBoxOptions = Pick<SearchBoxOptions, 'clearFilters'>;

export const defaultSearchBoxOptions: Required<DefaultSearchBoxOptions> = {
  clearFilters: true,
};

const {id, highlightOptions, clearFilters} = coreSearchBoxOptionDefinitions;
export const searchBoxOptionDefinitions = {id, highlightOptions, clearFilters};

export const searchBoxOptionsSchema = new Schema<Required<SearchBoxOptions>>(
  searchBoxOptionDefinitions
);
