import {randomUUID} from 'node:crypto';
import type {Product} from '@coveo/headless/ssr-commerce';
import {ResultType} from '@coveo/headless/ssr-commerce';

const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  additionalFields: {},
  children: [],
  clickUri: '',
  ec_brand: 'Test Brand',
  ec_category: ['Test Category'],
  ec_color: 'Test Color',
  ec_description: 'Test Description',
  ec_gender: 'Test Gender',
  ec_images: [],
  ec_in_stock: true,
  ec_item_group_id: 'test-group',
  ec_listing: 'test-listing',
  ec_name: 'Test Product',
  ec_price: 99.99,
  ec_product_id: randomUUID(),
  ec_promo_price: 79.99,
  ec_rating: 4.5,
  ec_shortdesc: 'Test short description',
  ec_thumbnails: [],
  permanentid: randomUUID(),
  position: 1,
  totalNumberOfChildren: 0,
  resultType: ResultType.PRODUCT,
  ...overrides,
});

export const generateMockProducts = (count: number): Product[] =>
  Array.from({length: count}, (_, index) =>
    createMockProduct({
      ec_name: `Product ${index + 1}`,
      position: index + 1,
    })
  );
