import {describe, expect, it, afterEach} from 'vitest';
import {render, screen, cleanup} from '@testing-library/react';
import type {ProductSummaryProps} from '@coveo/thermidor-schema';
import {ProductSummaryRenderer} from './ProductSummary.js';

function renderSummary(props: ProductSummaryProps) {
  return render(<ProductSummaryRenderer props={props} />);
}

describe('ProductSummaryRenderer', () => {
  afterEach(() => cleanup());

  it('renders the product name, description and price from its resolved props', () => {
    renderSummary({
      categoryLabel: 'Surfboard',
      product: {
        permanentid: 'p1',
        ec_name: 'Wave Rider Soft Top',
        ec_shortdesc: 'A great beginner board.',
        ec_price: 199.99,
        ec_promo_price: 149.99,
        ec_images: ['https://example.com/board.webp'],
        additionalFields: {},
      },
    });

    expect(screen.queryByText('Wave Rider Soft Top')).not.toBeNull();
    expect(screen.queryByText('A great beginner board.')).not.toBeNull();
    // Prefers the promo price over the regular price.
    expect(screen.queryByText('$149.99')).not.toBeNull();
    expect(screen.queryByText('$199.99')).toBeNull();
  });

  it('falls back to the categoryLabel and renders no price when the product is null', () => {
    renderSummary({categoryLabel: 'Wetsuit', product: null});

    expect(screen.queryByText('Wetsuit')).not.toBeNull();
    expect(screen.queryByText(/\$/)).toBeNull();
  });

  it('renders a loading placeholder without throwing when the state is unresolved', () => {
    // An unresolved binding yields props with no resolved state fields.
    expect(() => renderSummary({} as ProductSummaryProps)).not.toThrow();
    expect(screen.queryByLabelText('Loading product summary')).not.toBeNull();
  });
});
