import {describe, expect, it} from 'vitest';

import {
  extractActionsBySurface,
  extractCatalogComponents,
  extractProductsBySurface,
} from '../lib/commerceExtractor.js';

describe('extractProductsBySurface', () => {
  it('extracts only strict product records and skips placeholder surfaces', () => {
    const productsBySurface = extractProductsBySurface([
      {
        dataModelUpdate: {
          surfaceId: 'catalog-surface-default',
          contents: [
            {
              key: 'items',
              valueMap: [
                {
                  key: 'item-1',
                  valueMap: [
                    {key: 'ec_name', valueString: 'Product A'},
                    {key: 'ec_price', valueNumber: 199},
                    {key: 'ec_product_id', valueString: 'a-1'},
                  ],
                },
                {
                  key: 'item-2',
                  valueMap: [
                    {key: 'ec_name', valueString: 'Incomplete'},
                    {key: 'ec_price', valueNumber: 99},
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        dataModelUpdate: {
          surfaceId: 'skeleton-surface-default',
          contents: [
            {
              key: 'items',
              valueMap: [
                {
                  key: 'item-1',
                  valueMap: [
                    {key: 'ec_name', valueString: 'Hidden product'},
                    {key: 'ec_price', valueNumber: 120},
                    {key: 'ec_product_id', valueString: 'hidden-1'},
                  ],
                },
              ],
            },
          ],
        },
      },
    ]);

    expect(productsBySurface.size).toBe(1);
    expect(productsBySurface.get('catalog-surface-default')).toEqual([
      {
        ec_name: 'Product A',
        ec_price: 199,
        ec_product_id: 'a-1',
      },
    ]);
  });

  it('dedupes products by id using last-wins semantics', () => {
    const productsBySurface = extractProductsBySurface([
      {
        dataModelUpdate: {
          surfaceId: 'catalog-surface-default',
          contents: [
            {
              key: 'items',
              valueMap: [
                {
                  key: 'item-1',
                  valueMap: [
                    {key: 'ec_name', valueString: 'Product A'},
                    {key: 'ec_price', valueNumber: 199},
                    {key: 'ec_product_id', valueString: 'a-1'},
                  ],
                },
                {
                  key: 'item-2',
                  valueMap: [
                    {key: 'ec_name', valueString: 'Product B'},
                    {key: 'ec_price', valueNumber: 299},
                    {key: 'ec_product_id', valueString: 'b-1'},
                  ],
                },
                {
                  key: 'item-3',
                  valueMap: [
                    {key: 'ec_name', valueString: 'Product A (updated)'},
                    {key: 'ec_price', valueNumber: 149},
                    {key: 'ec_product_id', valueString: 'a-1'},
                  ],
                },
              ],
            },
          ],
        },
      },
    ]);

    expect(productsBySurface.get('catalog-surface-default')).toEqual([
      {
        ec_name: 'Product B',
        ec_price: 299,
        ec_product_id: 'b-1',
      },
      {
        ec_name: 'Product A (updated)',
        ec_price: 149,
        ec_product_id: 'a-1',
      },
    ]);
  });
});

describe('extractActionsBySurface', () => {
  it('normalizes action key and defaults missing action type', () => {
    const actionsBySurface = extractActionsBySurface([
      {
        dataModelUpdate: {
          surfaceId: 'catalog-surface-default',
          contents: [
            {
              key: ' Actions ',
              valueMap: [
                {
                  key: 'action-1',
                  valueMap: [
                    {key: 'text', valueString: 'Show me alternatives'},
                  ],
                },
              ],
            },
          ],
        },
      },
    ]);

    expect(actionsBySurface.get('catalog-surface-default')).toEqual([
      {
        text: 'Show me alternatives',
        type: 'followup',
      },
    ]);
  });
});

describe('extractCatalogComponents', () => {
  it('keeps placeholder skeleton surfaces as loading-only components', () => {
    const components = extractCatalogComponents([
      {
        surfaceUpdate: {
          surfaceId: 'skeleton-surface-default',
          components: [
            {
              component: {
                ProductCarousel: {
                  heading: {
                    literalString:
                      'I found options for you. Tell me what matters most and I can refine the results.',
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    expect(components).toHaveLength(1);
    expect(components[0]).toMatchObject({
      type: 'ProductCarousel',
      surfaceId: 'skeleton-surface-default',
      heading: '',
      isLoading: true,
    });
  });

  it('keeps regular commerce surfaces', () => {
    const components = extractCatalogComponents([
      {
        surfaceUpdate: {
          surfaceId: 'catalog-surface-default',
          components: [
            {
              component: {
                ProductCarousel: {
                  heading: {
                    literalString: 'Products for you',
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    expect(components).toHaveLength(1);
    expect(components[0]).toMatchObject({
      type: 'ProductCarousel',
      heading: 'Products for you',
      surfaceId: 'catalog-surface-default',
    });
  });
});
