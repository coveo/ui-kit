import {
  ChildProduct,
  Product,
  RawProduct,
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

export function buildMockRawProduct(
  config: Partial<RawProduct> = {}
): RawProduct {
  const {children, totalNumberOfChildren, ...childProductConfig} = config;
  return {
    ...buildMockChildProduct(childProductConfig),
    children: children ?? [],
    totalNumberOfChildren: totalNumberOfChildren ?? 0,
  };
}

export function buildMockProduct(config: Partial<Product> = {}): Product {
  const {position, ...rawProductConfig} = config;
  return {
    ...buildMockRawProduct(rawProductConfig),
    position: position ?? 1,
  };
}
