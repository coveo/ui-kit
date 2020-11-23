import {Schema, StringValue} from '@coveo/bueno';
import {
  searchBoxOptionDefinitions,
  SearchBoxOptions,
} from '../search-box/headless-search-box-options';

export interface StandaloneSearchBoxOptions extends SearchBoxOptions {
  redirectionUrl: string;
}

export const standaloneSearchBoxSchema = new Schema<
  Required<StandaloneSearchBoxOptions>
>({
  ...searchBoxOptionDefinitions,
  /**
   * The default Url the user should be redirected to, when a query is submitted.
   * If a query pipeline redirect is triggered, it will redirect to that Url instead.
   */
  redirectionUrl: new StringValue({
    required: true,
    emptyAllowed: false,
    url: true,
  }),
});
