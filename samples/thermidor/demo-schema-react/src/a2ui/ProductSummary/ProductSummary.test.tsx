import {describe, expect, it, afterEach} from 'vitest';
import {screen, cleanup, waitFor} from '@testing-library/react';
import {mountSurface} from '../mount-surface.harness.js';

/**
 * ProductSummary is a `createReactComponent` implementation driven by the generic binder, mounted
 * end-to-end through the real thermidor catalog: `categoryLabel` / `product` are `{path}` bindings
 * resolved from the surface data model. Presentational — no actions. An unresolved binding (no
 * data-model write) leaves the field `undefined`, exercising the loading guard.
 */

afterEach(() => cleanup());

const BINDINGS = {
  categoryLabel: {path: '/state/root/categoryLabel'},
  product: {path: '/state/root/product'},
};

describe('ProductSummary', () => {
  it('renders the product name, description and price from its resolved props', async () => {
    mountSurface({
      component: {component: 'ProductSummary', ...BINDINGS},
      dataModel: [
        {path: '/state/root/categoryLabel', value: 'Surfboard'},
        {
          path: '/state/root/product',
          value: {
            permanentid: 'p1',
            ec_name: 'Wave Rider Soft Top',
            ec_shortdesc: 'A great beginner board.',
            ec_price: 199.99,
            ec_promo_price: 149.99,
            ec_images: ['https://example.com/board.webp'],
            additionalFields: {},
          },
        },
      ],
    });

    await waitFor(() => expect(screen.queryByText('Wave Rider Soft Top')).not.toBeNull());
    expect(screen.queryByText('A great beginner board.')).not.toBeNull();
    // Prefers the promo price over the regular price.
    expect(screen.queryByText('$149.99')).not.toBeNull();
    expect(screen.queryByText('$199.99')).toBeNull();
  });

  it('falls back to the categoryLabel and renders no price when the product is null', async () => {
    mountSurface({
      component: {component: 'ProductSummary', ...BINDINGS},
      dataModel: [
        {path: '/state/root/categoryLabel', value: 'Wetsuit'},
        {path: '/state/root/product', value: null},
      ],
    });

    await waitFor(() => expect(screen.queryByText('Wetsuit')).not.toBeNull());
    expect(screen.queryByText(/\$/)).toBeNull();
  });

  it('renders a loading placeholder without throwing when the state is unresolved', async () => {
    // No data-model writes → both bindings resolve undefined → loading placeholder.
    mountSurface({component: {component: 'ProductSummary', ...BINDINGS}});

    await waitFor(() => expect(screen.queryByLabelText('Loading product summary')).not.toBeNull());
  });
});
