import {
  ChildProduct,
  Product,
  BaseProduct,
} from '../api/commerce/common/product';

export function buildMockChildProduct(
  config: Partial<ChildProduct> = {}
): ChildProduct {
  return {
    permanentid: '',
    clickUri: '',
    ec_name: '',
    additionalFields: {},
    ec_description: '',
    ec_brand: '',
    ec_category: [],
    ec_item_group_id: '',
    ec_price: 0,
    ec_color: '',
    ec_gender: '',
    ec_images: [],
    ec_in_stock: false,
    ec_listing: '',
    ec_product_id: '',
    ec_promo_price: 0,
    ec_rating: 0,
    ec_shortdesc: '',
    ec_thumbnails: [],
    ...config,
  };
}

export function buildMockBaseProduct(
  config: Partial<BaseProduct> = {}
): BaseProduct {
  const {children, totalNumberOfChildren, ...childProductConfig} = config;
  return {
    ...buildMockChildProduct(childProductConfig),
    children: children ?? [],
    totalNumberOfChildren: totalNumberOfChildren ?? 0,
  };
}

export function buildMockProduct(config: Partial<Product> = {}): Product {
  const {position, ...baseProductConfig} = config;
  return {
    ...buildMockBaseProduct(baseProductConfig),
    position: position ?? 1,
  };
}
