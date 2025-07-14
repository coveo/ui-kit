import {BooleanValue, Schema, StringValue} from '@coveo/bueno';
import {
  type SearchBoxOptions,
  searchBoxOptionDefinitions,
} from '../search-box/headless-search-box-options.js';

export interface StandaloneSearchBoxOptions extends SearchBoxOptions {
  /**
   * The default Url the user should be redirected to, when a query is submitted.
   * If a query pipeline redirect is triggered, it will redirect to that Url instead.
   */
  redirectionUrl: string;
  /**
   * Whether to overwrite the existing standalone search box with the same id.
   */
  overwrite?: boolean;
}

export const standaloneSearchBoxSchema = new Schema<
  Required<StandaloneSearchBoxOptions>
>({
  ...searchBoxOptionDefinitions,
  redirectionUrl: new StringValue({
    required: true,
    emptyAllowed: false,
  }),
  overwrite: new BooleanValue({
    required: false,
  }),
});
