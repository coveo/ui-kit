import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {A2UIProductCard} from './ProductCard.js';
import {TargetingProvider, type TargetingContext} from '../../context/targeting.js';

vi.mock('../../utils.js', () => ({
  formatPrice: (v: number) => `$${v.toFixed(2)}`,
}));

function renderWithTargeting(ui: React.ReactElement, targeting: TargetingContext) {
  return render(<TargetingProvider value={targeting}>{ui}</TargetingProvider>);
}

describe('A2UIProductCard', () => {
  it('suppresses link when targeting (renders span instead of anchor)', () => {
    const targeting: TargetingContext = {
      isTargeting: true,
      onProductTargeted: vi.fn(),
      selectedProductIds: new Set(),
    };

    renderWithTargeting(
      <A2UIProductCard
        ec_name="Gadget Pro"
        ec_product_id="gadget-1"
        clickUri="https://example.com/gadget"
      />,
      targeting
    );

    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Gadget Pro').tagName).toBe('SPAN');
  });

  it('renders link when not targeting', () => {
    const targeting: TargetingContext = {
      isTargeting: false,
      onProductTargeted: vi.fn(),
      selectedProductIds: new Set(),
    };

    renderWithTargeting(
      <A2UIProductCard
        ec_name="Gadget Pro"
        ec_product_id="gadget-1"
        clickUri="https://example.com/gadget"
      />,
      targeting
    );

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('https://example.com/gadget');
  });
});
