import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {ProductCard} from './ProductCard.js';
import type {Product} from '../utils.js';

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    ec_thumbnails: ['https://example.com/thumb.jpg'],
    ec_name: 'Wireless Headphones',
    ec_brand: 'Acme Audio',
    ec_price: 99.99,
    ...overrides,
  };
}

describe('ProductCard', () => {
  it('renders name, brand, and formatted price', () => {
    render(<ProductCard product={buildProduct()} />);

    expect(screen.getByText('Wireless Headphones')).toBeDefined();
    expect(screen.getByText('Acme Audio')).toBeDefined();
    expect(screen.getByText('$99.99')).toBeDefined();
  });

  it('shows placeholder when no image available', () => {
    const product = buildProduct({
      ec_thumbnails: undefined,
      ec_images: undefined,
    });
    render(<ProductCard product={product} />);

    expect(screen.getByLabelText('No image available')).toBeDefined();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('shows promo price with strikethrough on original', () => {
    const product = buildProduct({
      ec_price: 99.99,
      ec_promo_price: 79.99,
    });
    render(<ProductCard product={product} />);

    expect(screen.getByText('$79.99')).toBeDefined();
    expect(screen.getByText('$99.99')).toBeDefined();

    const originalPriceEl = screen.getByText('$99.99');
    expect(originalPriceEl.className).toContain('originalPrice');
  });

  it('displays title attribute with full product name', () => {
    render(<ProductCard product={buildProduct()} />);

    const heading = screen.getByRole('heading', {level: 3});
    expect(heading.getAttribute('title')).toBe('Wireless Headphones');
  });

  it('shows "\u2014" when price is undefined', () => {
    const product = buildProduct({ec_price: undefined});
    render(<ProductCard product={product} />);

    expect(screen.getByText('\u2014')).toBeDefined();
  });
});
