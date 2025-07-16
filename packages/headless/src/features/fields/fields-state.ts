import type {FieldDescription} from '../../api/search/fields/fields-response.js';

export interface FieldsState {
  /**
   * The names of the fields to include with each item in the query results. If specified, no other fields will be included.
   *
   * Example: ["clickableuri","author","date","filetype","language","coversationid","messageid","childid","adjustednumberoflikes"]
   */
  fieldsToInclude: string[];
  /**
   * A flag that specifies if all fields should be retrieved from the index. Useful in development or debugging scenarios.
   *
   * This should not be set to `true` in any production environment, as this can have a negative impact on query execution time.
   */
  fetchAllFields: boolean;
  /**
   * The description of all available fields from the index.
   */
  fieldsDescription: FieldDescription[];
}

/**
 * A list of the minimum fields required in a query.
 */
export const MinimumFieldsToInclude = [
  'author',
  'language',
  'urihash',
  'objecttype',
  'collection',
  'source',
  'permanentid',
];

/**
 * A list of the recommended fields to be used in a query.
 */
export const DefaultFieldsToInclude = [
  ...MinimumFieldsToInclude,
  'date',
  'filetype',
  'parents',
];

/**
 * A list of the recommended fields to be used in a query for an e-commerce page.
 */
export const EcommerceDefaultFieldsToInclude = [
  ...DefaultFieldsToInclude,
  'ec_price',
  'ec_name',
  'ec_description',
  'ec_brand',
  'ec_category',
  'ec_item_group_id',
  'ec_shortdesc',
  'ec_thumbnails',
  'ec_images',
  'ec_promo_price',
  'ec_in_stock',
  'ec_rating',
];

export const getFieldsInitialState: () => FieldsState = () => ({
  fieldsToInclude: MinimumFieldsToInclude,
  fetchAllFields: false,
  fieldsDescription: [],
});
