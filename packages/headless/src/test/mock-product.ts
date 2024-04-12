import {Product} from '../api/commerce/common/product';

export function buildMockProduct(config: Partial<Product> = {}): Product {
  return {
    permanentid: '',
    clickUri: '',
    ec_name: '',
    additionalFields: {},
    children: [],
    totalNumberOfChildren: 0,
    ...config,
  };
}
