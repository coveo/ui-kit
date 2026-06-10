import {z} from '@coveo/bueno/zod';
import {
  type SearchBoxOptions,
  searchBoxOptionDefinitions,
} from '../core/search-box/headless-core-search-box-options.js';

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

export const standaloneSearchBoxSchema = z.object({
  ...searchBoxOptionDefinitions,
  redirectionUrl: z.string().check(z.minLength(1)),
  overwrite: z.optional(z.boolean()),
});
