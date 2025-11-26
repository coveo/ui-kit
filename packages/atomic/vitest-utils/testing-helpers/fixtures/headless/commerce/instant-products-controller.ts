import type {
  InstantProducts,
  InstantProductsState,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';

export const defaultState = {
  query: 'the query',
  products: [
    {
      ec_name: 'Product 1',
      permanentid: '12345',
      ec_price: 100,
      ec_images: ['https://example.com/product1.jpg'],
      children: [],
      position: 0,
      clickUri: '',
      ec_description: null,
      ec_brand: null,
      ec_category: [],
      ec_item_group_id: null,
      ec_promo_price: null,
      ec_shortdesc: null,
      ec_thumbnails: [],
      ec_in_stock: null,
      ec_rating: null,
      ec_gender: null,
      ec_product_id: null,
      ec_color: null,
      ec_listing: null,
      additionalFields: {},
      totalNumberOfChildren: null,
    },
    {
      ec_name: 'Product 2',
      permanentid: '12346',
      ec_price: 200,
      ec_images: ['https://example.com/product2.jpg'],
      children: [],
      position: 0,
      clickUri: '',
      ec_description: null,
      ec_brand: null,
      ec_category: [],
      ec_item_group_id: null,
      ec_promo_price: null,
      ec_shortdesc: null,
      ec_thumbnails: [],
      ec_in_stock: null,
      ec_rating: null,
      ec_gender: null,
      ec_product_id: null,
      ec_color: null,
      ec_listing: null,
      additionalFields: {},
      totalNumberOfChildren: null,
    },
    {
      ec_name: 'Product 3',
      permanentid: '12347',
      ec_price: 300,
      ec_images: ['https://example.com/product3.jpg'],
      children: [],
      position: 0,
      clickUri: '',
      ec_description: null,
      ec_brand: null,
      ec_category: [],
      ec_item_group_id: null,
      ec_promo_price: null,
      ec_shortdesc: null,
      ec_thumbnails: [],
      ec_in_stock: null,
      ec_rating: null,
      ec_gender: null,
      ec_product_id: null,
      ec_color: null,
      ec_listing: null,
      additionalFields: {},
      totalNumberOfChildren: null,
    },
  ],
  isLoading: false,
  error: null,
  totalCount: 3,
} satisfies InstantProductsState;

export const defaultImplementation = {
  updateQuery: vi.fn(),
  clearExpired: vi.fn(),
  promoteChildToParent: vi.fn(),
  interactiveProduct: vi.fn(),
  subscribe: vi.fn((subscribedFunction: () => void) => {
    setTimeout(subscribedFunction, 0);
    return vi.fn();
  }) as unknown as InstantProducts['subscribe'],
  state: defaultState,
} satisfies InstantProducts;

export const buildFakeInstantProducts = (
  state?: Partial<InstantProductsState>
): InstantProducts =>
  ({
    ...defaultImplementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as InstantProducts;
