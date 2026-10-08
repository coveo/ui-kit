import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {A2UIProductCard} from './ProductCard.js';

vi.mock('../../utils.js', () => ({
  formatPrice: (v: number) => `$${v.toFixed(2)}`,
}));

describe('A2UIProductCard', () => {
  it('links the product name to its page', () => {
    render(
      <A2UIProductCard
        ec_name="Gadget Pro"
        ec_product_id="gadget-1"
        clickUri="https://example.com/gadget"
      />
    );

    const link = screen.getByRole('link', {name: 'Gadget Pro'});
    expect(link.getAttribute('href')).toBe('https://example.com/gadget');
  });

  it('renders the name as text without a product page', () => {
    render(<A2UIProductCard ec_name="Gadget Pro" ec_product_id="gadget-1" />);

    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Gadget Pro').tagName).toBe('SPAN');
  });
});
