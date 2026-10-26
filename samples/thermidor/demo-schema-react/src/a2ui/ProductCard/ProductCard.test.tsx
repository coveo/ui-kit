import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {A2UIProductCard} from './ProductCard.js';
import {ProductCardActionsContext, type ProductCardProduct} from './product-card-actions.js';

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

  it('renders no actions by default', () => {
    render(<A2UIProductCard ec_name="Gadget Pro" ec_product_id="gadget-1" ec_price={10} />);

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders the actions provided for the product it shows', () => {
    const renderActions = vi.fn((product: ProductCardProduct) => (
      <button type="button">Add {product.name}</button>
    ));
    render(
      <ProductCardActionsContext.Provider value={renderActions}>
        <A2UIProductCard ec_name="Gadget Pro" ec_product_id="gadget-1" ec_price={10} />
      </ProductCardActionsContext.Provider>
    );

    expect(screen.getByRole('button', {name: 'Add Gadget Pro'})).toBeTruthy();
    expect(renderActions).toHaveBeenCalledWith({
      productId: 'gadget-1',
      name: 'Gadget Pro',
      price: 10,
    });
  });
});
