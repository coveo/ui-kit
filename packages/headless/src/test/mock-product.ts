import {Product} from '../api/commerce/common/product';

export function buildMockProduct(config: Partial<Product> = {}): Product {
  return {
    permanentid: '',
    clickUri: '',
    ec_name: '',
    additionalFields: {},
    childResults: [],
    totalNumberOfChildResults: 0,
    ...config,
  };
}
