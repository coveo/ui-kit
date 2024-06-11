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
