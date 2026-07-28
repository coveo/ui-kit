import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import type {ProductListController} from '@coveo/thermidor';
import {ProductGrid} from './ProductGrid.js';
import type {Product} from '../utils.js';

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    permanentid: 'abc-123',
    ec_thumbnails: ['https://example.com/thumb.jpg'],
    ec_name: 'Test Product',
    ec_brand: 'Test Brand',
    ec_price: 49.99,
    ...overrides,
  };
}

function createMockController(products: Product[]) {
  return {
    state: {products},
    subscribe: () => () => {},
  } as unknown as ProductListController;
}

describe('ProductGrid', () => {
  it('renders correct number of ProductCards', () => {
    const products = [
      buildProduct({permanentid: '1', ec_name: 'Product A'}),
      buildProduct({permanentid: '2', ec_name: 'Product B'}),
      buildProduct({permanentid: '3', ec_name: 'Product C'}),
    ];
    const controller = createMockController(products);

    render(<ProductGrid controller={controller} />);

    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(3);
  });

  it('shows empty state message when no products', () => {
    const controller = createMockController([]);

    render(<ProductGrid controller={controller} />);

    expect(screen.getByText('No results found')).toBeDefined();
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });
});
