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

export const StandardCommerceFields = [
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
] as const;

/**
 * A list of the recommended fields to be used in a query for an e-commerce page.
 */
export const EcommerceDefaultFieldsToInclude = [
  ...DefaultFieldsToInclude,
  ...StandardCommerceFields,
];
