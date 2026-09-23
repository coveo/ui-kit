import {describe, expect, it, afterEach, vi, beforeEach} from 'vitest';
import {render, screen, cleanup} from '@testing-library/react';
import {ProductSummaryRenderer} from './ProductSummary.js';

// The renderer resolves its state through `useRemoteController`, which binds to
// the active turn's `components[componentId]` entry. The mock reproduces that
// correlation: the controller state is looked up by the requested componentId.
let mockComponents: Record<string, unknown> = {};

vi.mock('../controllers.js', () => ({
  useRemoteController: (componentId: string) => ({
    componentId,
    state: mockComponents[componentId],
    dispatch: vi.fn(),
    subscribe: () => () => undefined,
  }),
}));

function renderSummary(componentId: string, components: Record<string, unknown>) {
  mockComponents = components;
  return render(<ProductSummaryRenderer props={{componentId, componentType: 'product-summary'}} />);
}

describe('ProductSummaryRenderer', () => {
  beforeEach(() => {
    mockComponents = {};
  });
  afterEach(() => cleanup());

  it('renders the product name, description and price from its AG-UI state', () => {
    renderSummary('slot-1', {
      'slot-1': {
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
      },
    });

    expect(screen.queryByText('Wave Rider Soft Top')).not.toBeNull();
    expect(screen.queryByText('A great beginner board.')).not.toBeNull();
    // Prefers the promo price over the regular price.
    expect(screen.queryByText('$149.99')).not.toBeNull();
    expect(screen.queryByText('$199.99')).toBeNull();
  });

  it('falls back to the categoryLabel and renders no price when the product is null', () => {
    renderSummary('slot-2', {
      'slot-2': {categoryLabel: 'Wetsuit', product: null},
    });

    expect(screen.queryByText('Wetsuit')).not.toBeNull();
    expect(screen.queryByText(/\$/)).toBeNull();
  });

  it('renders a loading placeholder without throwing when no state entry exists', () => {
    expect(() => renderSummary('absent', {})).not.toThrow();
    expect(screen.queryByLabelText('Loading product summary')).not.toBeNull();
  });
});
