import type {Product} from '../../../api/commerce/common/product.js';
import {buildMockProduct} from '../../../test/mock-product.js';
import {ProductTemplatesHelpers} from './product-templates-helpers.js';

describe('ProductTemplatesHelpers', () => {
  describe('#getProductProperty', () => {
    it('returns a top-level property', () => {
      const product = buildMockProduct({ec_name: 'Kayak'});

      expect(ProductTemplatesHelpers.getProductProperty(product, 'ec_name')).toBe('Kayak');
    });

    it('returns a property from additionalFields', () => {
      const product = buildMockProduct({additionalFields: {color: 'blue'}});

      expect(ProductTemplatesHelpers.getProductProperty(product, 'color')).toBe('blue');
    });

    it('returns null when the item has no additionalFields', () => {
      const item = {ec_name: 'Kayak'} as unknown as Product;

      expect(ProductTemplatesHelpers.getProductProperty(item, 'color')).toBeNull();
    });
  });
});
