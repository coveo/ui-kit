export const baseResponse = {
  responseId: '123e4567-e89b-12d3-a456-426614174001',
  headline: 'Recommended for you',
  products: [
    {
      permanentid: 'rec-product-1',
      ec_name: 'Recommended Product 1',
      ec_price: 79.99,
      clickUri: 'https://example.com/product/rec-1',
      ec_brand: 'Rec Brand',
      ec_category: 'Accessories',
    },
    {
      permanentid: 'rec-product-2',
      ec_name: 'Recommended Product 2',
      ec_price: 129.99,
      clickUri: 'https://example.com/product/rec-2',
      ec_brand: 'Rec Brand',
      ec_category: 'Accessories',
    },
  ],
  pagination: {
    page: 0,
    perPage: 10,
    totalEntries: 2,
    totalPages: 1,
  },
  triggers: [],
};
