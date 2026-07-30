import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {ProductCard} from './ProductCard.js';
import {TargetingProvider, type TargetingContext} from '../../../context/targeting.js';
import type {Product} from '@coveo/thermidor';

vi.mock('../utils.js', () => ({
  resolveProductImage: () => 'https://example.com/img.jpg',
}));

const mockProduct = {
  permanentid: 'prod-123',
  ec_name: 'Test Widget',
  ec_brand: 'Acme',
  ec_price: 29.99,
} as Product;

function renderWithTargeting(ui: React.ReactElement, targeting: TargetingContext) {
  return render(<TargetingProvider value={targeting}>{ui}</TargetingProvider>);
}

describe('ProductCard', () => {
  it('renders normally without context (no role="button", no tabIndex)', () => {
    render(<ProductCard product={mockProduct} />);

    const card = screen.getByRole('article');
    expect(card.tagName).toBe('ARTICLE');
    expect(card.getAttribute('tabindex')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('becomes clickable with context (has role="button", tabIndex=0 when isTargeting is true)', () => {
    const targeting: TargetingContext = {
      isTargeting: true,
      onProductTargeted: vi.fn(),
      selectedProductIds: new Set(),
    };

    renderWithTargeting(<ProductCard product={mockProduct} />, targeting);

    const card = screen.getByRole('button');
    expect(card.getAttribute('tabindex')).toBe('0');
  });

  it('clicking ProductCard in targeting mode calls onProductTargeted with correct args', () => {
    const onProductTargeted = vi.fn();
    const targeting: TargetingContext = {
      isTargeting: true,
      onProductTargeted,
      selectedProductIds: new Set(),
    };

    renderWithTargeting(<ProductCard product={mockProduct} />, targeting);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(onProductTargeted).toHaveBeenCalledWith(
      'prod-123',
      'Test Widget',
      'https://example.com/img.jpg'
    );
  });

  it('clicking a selected ProductCard in targeting mode calls onProductTargeted (for toggle/removal)', () => {
    const onProductTargeted = vi.fn();
    const targeting: TargetingContext = {
      isTargeting: true,
      onProductTargeted,
      selectedProductIds: new Set(['prod-123']),
    };

    renderWithTargeting(<ProductCard product={mockProduct} />, targeting);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(onProductTargeted).toHaveBeenCalledWith(
      'prod-123',
      'Test Widget',
      'https://example.com/img.jpg'
    );
  });
});
