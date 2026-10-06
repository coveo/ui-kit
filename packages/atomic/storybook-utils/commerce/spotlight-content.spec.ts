import {describe, expect, it} from 'vitest';
import {sampleSpotlightContents, spotlightContentTransformer} from './spotlight-content';

const buildProducts = (count: number) =>
  Array.from({length: count}, (_, index) => ({permanentid: `product-${index}`}));

const buildResponse = (productCount = 10, totalEntries = productCount) => ({
  results: buildProducts(productCount),
  pagination: {page: 0, perPage: productCount, totalEntries, totalPages: 1},
});

const ids = (results: unknown[]) =>
  results.map((result) => {
    const item = result as {id?: string; permanentid?: string};
    return item.permanentid ?? item.id;
  });

describe('#spotlightContentTransformer', () => {
  it('should leave the response untouched when the request does not enable results', () => {
    const response = buildResponse();

    expect(spotlightContentTransformer()({perPage: 5}, response)).toBe(response);
  });

  it('should fill each page with perPage items, products and spotlight content combined', () => {
    const transform = spotlightContentTransformer([1, 6]);
    const response = buildResponse();

    const firstPage = transform({enableResults: true, page: 0, perPage: 5}, response);
    const secondPage = transform({enableResults: true, page: 1, perPage: 5}, response);

    expect(ids(firstPage.results)).toEqual([
      'product-0',
      sampleSpotlightContents[0].id,
      'product-1',
      'product-2',
      'product-3',
    ]);
    expect(ids(secondPage.results)).toEqual([
      'product-4',
      sampleSpotlightContents[1].id,
      'product-5',
      'product-6',
      'product-7',
    ]);
  });

  it('should count spotlight content in the pagination totals', () => {
    const response = buildResponse(10);

    const {pagination} = spotlightContentTransformer([1, 6])(
      {enableResults: true, page: 0, perPage: 5},
      response
    );

    expect(pagination).toEqual({
      page: 0,
      perPage: 5,
      totalEntries: 12,
      totalPages: 3,
      totalProducts: 10,
      totalSpotlightContent: 2,
    });
  });

  it('should return every product exactly once across consecutive pages', () => {
    const transform = spotlightContentTransformer([1, 6]);
    const response = buildResponse(10);

    const allResults = [0, 1, 2].flatMap(
      (page) => transform({enableResults: true, page, perPage: 5}, response).results
    );

    expect(allResults).toHaveLength(12);
    expect(ids(allResults).filter((id) => id?.startsWith('product-'))).toEqual(
      buildProducts(10).map(({permanentid}) => permanentid)
    );
  });

  it('should cycle through the base products when the catalog is larger than the base response', () => {
    const response = buildResponse(4, 20);

    const {results} = spotlightContentTransformer([1])(
      {enableResults: true, page: 1, perPage: 4},
      response
    );

    expect(ids(results)).toEqual(['product-3', 'product-0', 'product-1', 'product-2']);
  });

  it('should ignore positions past the end of the results', () => {
    const response = buildResponse(3);

    const {pagination} = spotlightContentTransformer([1, 50])(
      {enableResults: true, page: 0, perPage: 5},
      response
    );

    expect(pagination.totalSpotlightContent).toBe(1);
    expect(pagination.totalEntries).toBe(4);
  });
});
