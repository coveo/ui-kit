export const baseResponse = {
  responseId: '123e4567-e89b-12d3-a456-426614174000',
  products: [
    {
      permanentid: 'product-1',
      ec_name: 'Sample Product 1',
      ec_price: 99.99,
      clickUri: 'https://example.com/product/1',
      ec_brand: 'Sample Brand',
      ec_category: 'Electronics',
      children: [],
    },
    {
      permanentid: 'product-2',
      ec_name: 'Sample Product 2',
      ec_price: 149.99,
      clickUri: 'https://example.com/product/2',
      ec_brand: 'Sample Brand',
      ec_category: 'Electronics',
      children: [],
    },
  ],
  facets: [],
  pagination: {
    page: 0,
    perPage: 10,
    totalEntries: 2,
    totalPages: 1,
  },
  sort: {
    appliedSort: {
      sortCriteria: 'relevance',
    },
    availableSorts: [
      {
        sortCriteria: 'relevance',
      },
    ],
  },
  triggers: [],
};
