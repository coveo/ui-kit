import type {Product} from '@coveo/headless/commerce';

export const buildFakeProduct = (product?: Partial<Product>): Product =>
  ({
    clickUri: '',
    additionalFields: {
      cat_available_sizes: ['XS', 'S', 'M', 'L', 'XL'],
    },
    children: [],
    ec_brand: 'brand',
    ec_category: [],
    ec_color: 'color',
    ec_description: 'description',
    ec_gender: 'gender',
    ec_images: [],
    ec_name: 'name',
    ec_price: 0,
    ec_product_id: 'productId',
    ec_in_stock: true,
    ec_item_group_id: 'itemGroupId',
    ec_listing: 'listing',
    ec_promo_price: 0,
    ec_rating: 4.37,
    ec_shortdesc: 'shortdesc',
    ec_thumbnails: [],
    permanentid: 'permanentId',
    position: 1,
    totalNumberOfChildren: 0,
    excerpt: 'excerpt',
    excerptHighlights: [],
    nameHighlights: [],
    ...product,
  }) satisfies Product;
