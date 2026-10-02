import {describe, expect, it, afterEach, vi} from 'vitest';
import {screen, cleanup, waitFor} from '@testing-library/react';
import {mountSurface} from '../mount-surface.harness.js';

/**
 * ProductResearchCard is a `createReactComponent` implementation driven by the generic binder,
 * mounted end-to-end through the real thermidor catalog: `product` / `summary` / `bullets` are
 * `{path}` bindings resolved from the surface data model. Presentational — no actions. An
 * unresolved binding (no data-model write) leaves the field `undefined`, exercising the loading
 * guard.
 */

afterEach(() => cleanup());

const BINDINGS = {
  product: {path: '/state/root/product'},
  summary: {path: '/state/root/summary'},
  bullets: {path: '/state/root/bullets'},
};

const PRODUCT = {
  permanentid: 'p1',
  ec_name: 'ThermoFlex Winter Wetsuit',
  ec_brand: 'Rip Curl',
  ec_price: 449.99,
  ec_promo_price: 399.99,
  ec_rating: 3.6,
  ec_images: ['https://example.com/wetsuit.webp'],
  clickUri: 'https://example.com/products/thermoflex',
  additionalFields: {},
};

const SUMMARY = 'The warmest suit in the range, built for very cold water.';
const BULLETS = ['7mm neoprene for maximum insulation.', 'Sealed back zip limits flushing.'];

function mountResearchCard(product: Record<string, unknown>) {
  mountSurface({
    component: {component: 'ProductResearchCard', ...BINDINGS},
    dataModel: [
      {path: '/state/root/product', value: product},
      {path: '/state/root/summary', value: SUMMARY},
      {path: '/state/root/bullets', value: BULLETS},
    ],
  });
}

describe('ProductResearchCard', () => {
  it('renders the product, summary and bullets from its resolved props', async () => {
    mountResearchCard(PRODUCT);

    await waitFor(() =>
      expect(
        screen.queryByRole('article', {name: 'Product research: ThermoFlex Winter Wetsuit'})
      ).not.toBeNull()
    );
    const link = screen.getByRole('link', {name: 'ThermoFlex Winter Wetsuit'});
    expect(link.getAttribute('href')).toBe('https://example.com/products/thermoflex');
    expect(screen.getByRole('img', {name: 'ThermoFlex Winter Wetsuit'}).getAttribute('src')).toBe(
      'https://example.com/wetsuit.webp'
    );
    expect(screen.queryByText('Rip Curl')).not.toBeNull();
    // Prefers the promo price over the regular price.
    expect(screen.queryByText('$399.99')).not.toBeNull();
    expect(screen.queryByText('$449.99')).toBeNull();
    expect(screen.queryByRole('img', {name: 'Rated 3.6 out of 5'})).not.toBeNull();
    expect(screen.queryByText(SUMMARY)).not.toBeNull();
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(BULLETS);
  });

  it('rounds the rating to one decimal and drops a trailing zero', async () => {
    mountResearchCard({...PRODUCT, ec_rating: 4.333333});

    await waitFor(() =>
      expect(screen.queryByRole('img', {name: 'Rated 4.3 out of 5'})).not.toBeNull()
    );
    expect(screen.queryByText('★ 4.3 / 5')).not.toBeNull();
    cleanup();

    mountResearchCard({...PRODUCT, ec_rating: 4});
    await waitFor(() =>
      expect(screen.queryByRole('img', {name: 'Rated 4 out of 5'})).not.toBeNull()
    );
  });

  it('renders duplicate bullets without a duplicate-key warning', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mountSurface({
      component: {component: 'ProductResearchCard', ...BINDINGS},
      dataModel: [
        {path: '/state/root/product', value: PRODUCT},
        {path: '/state/root/summary', value: SUMMARY},
        {path: '/state/root/bullets', value: ['Same bullet.', 'Same bullet.']},
      ],
    });

    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(2));
    const messages = consoleError.mock.calls.map((args) => args.join(' '));
    expect(messages.filter((message) => message.includes('same key'))).toEqual([]);
    consoleError.mockRestore();
  });

  it('omits the rating when the product has none', async () => {
    mountResearchCard({...PRODUCT, ec_rating: null});

    await waitFor(() => expect(screen.queryByText(SUMMARY)).not.toBeNull());
    expect(screen.queryByRole('img', {name: /^Rated/})).toBeNull();
  });

  it('keeps the loading placeholder while only some bindings are resolved', async () => {
    mountSurface({
      component: {component: 'ProductResearchCard', ...BINDINGS},
      dataModel: [{path: '/state/root/product', value: PRODUCT}],
    });

    await waitFor(() => expect(screen.queryByLabelText('Loading product research')).not.toBeNull());
    expect(screen.queryByRole('article')).toBeNull();
  });

  it('renders a loading placeholder without throwing when the state is unresolved', async () => {
    mountSurface({component: {component: 'ProductResearchCard', ...BINDINGS}});

    await waitFor(() => expect(screen.queryByLabelText('Loading product research')).not.toBeNull());
  });
});
