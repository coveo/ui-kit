import {Product} from '../../../api/commerce/common/product';
import {getRequiredProductPropertiesForAnalytics} from './product-templates-helpers';

// TODO KIT-3230: test all other exported product-templates-helpers functions.

describe('#getRequiredProductPropertiesForAnalytics', () => {
  describe('when primary lookup fields are defined as first class citizens on the product', () => {
    it('when primary lookup fields contain values of the expected types, sets productId, name, and price to the looked up values and generates no warning', () => {
      const product = {
        ec_name: 'name',
        ec_product_id: 'product_id',
        ec_promo_price: 10,
        additionalFields: {},
      } as Product;
      expect(getRequiredProductPropertiesForAnalytics(product)).toEqual({
        productId: 'product_id',
        name: 'name',
        price: 10,
        warning: undefined,
      });
    });

    describe('when primary lookup fields contain values of the wrong types', () => {
      it('when no valid fallback lookups are available, sets productId, name, and price to undefined and generates a warning', () => {
        const product = {
          ec_name: 0,
          ec_product_id: 0,
          ec_promo_price: 'price',
          additionalFields: {},
        } as unknown as Product;
        expect(getRequiredProductPropertiesForAnalytics(product)).toEqual({
          productId: undefined,
          name: undefined,
          price: undefined,
          warning: expect.any(String),
        });
      });

      it('when valid fallback lookups are available, sets properties productId, name, and price to fallback looked up values and generates no warning', () => {
        const product = {
          ec_name: 0,
          permanentid: 'product_id',
          ec_promo_price: 'price',
          ec_price: 10,
          additionalFields: {},
        } as unknown as Product;
        expect(getRequiredProductPropertiesForAnalytics(product)).toEqual({
          productId: 'product_id',
          name: 'product_id',
          price: 10,
          warning: undefined,
        });
      });
    });
  });

  describe('when lookup properties are defined as additional fields on the product', () => {
    it('when primary lookup fields contain values of the expected types, sets productId, name, and price to the looked up values and generates no warning', () => {
      const product = {
        additionalFields: {
          ec_name: 'name',
          ec_product_id: 'product_id',
          ec_promo_price: 10,
        },
      } as unknown as Product;
      expect(getRequiredProductPropertiesForAnalytics(product)).toEqual({
        productId: 'product_id',
        name: 'name',
        price: 10,
        warning: undefined,
      });
    });

    describe('when primary lookup fields contain values of the wrong types', () => {
      it('when no valid fallback lookups are available, sets productId, name, and price to undefined and generates a warning', () => {
        const product = {
          additionalFields: {
            ec_name: 0,
            ec_product_id: 0,
            ec_promo_price: 'price',
          },
        } as unknown as Product;
        expect(getRequiredProductPropertiesForAnalytics(product)).toEqual({
          productId: undefined,
          name: undefined,
          price: undefined,
          warning: expect.any(String),
        });
      });

      it('when valid fallback lookups are available, sets productId, name, and price to the fallback looked up values and generates no warning', () => {
        const product = {
          additionalFields: {
            ec_name: 0,
            permanentid: 'product_id',
            ec_promo_price: 'price',
            ec_price: 10,
          },
        } as unknown as Product;
        expect(getRequiredProductPropertiesForAnalytics(product)).toEqual({
          productId: 'product_id',
          name: 'product_id',
          price: 10,
          warning: undefined,
        });
      });
    });
  });

  it('when none of the lookup fields are defined on the product, sets all properties to undefined and generates a warning', () => {
    const product = {
      additionalFields: {},
    } as Product;
    expect(getRequiredProductPropertiesForAnalytics(product)).toEqual({
      productId: undefined,
      name: undefined,
      price: undefined,
      warning: expect.any(String),
    });
  });
});
