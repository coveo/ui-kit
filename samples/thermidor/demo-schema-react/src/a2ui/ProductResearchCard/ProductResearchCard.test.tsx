import {describe, expect, it, afterEach, vi} from 'vitest';
import {screen, cleanup, waitFor} from '@testing-library/react';
import {mountSurface} from '../mount-surface.harness.js';
import type {ThermidorCatalogOptions} from '../components.js';
import {formatDocumentSize} from '../RelatedDocuments/RelatedDocumentList.js';

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
  relatedDocuments: {path: '/state/root/relatedDocuments'},
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

function relatedDocument(index: number, overrides: Record<string, unknown> = {}) {
  return {
    title: `Owner manual ${index}`,
    clickUri: `https://example.com/manual-${index}.pdf`,
    filetype: 'pdf',
    size: 2048,
    ...overrides,
  };
}

function mountResearchCard(
  product: Record<string, unknown>,
  {
    relatedDocuments,
    catalogOptions,
  }: {relatedDocuments?: unknown[]; catalogOptions?: ThermidorCatalogOptions} = {}
) {
  mountSurface({
    component: {component: 'ProductResearchCard', ...BINDINGS},
    dataModel: [
      {path: '/state/root/product', value: product},
      {path: '/state/root/summary', value: SUMMARY},
      {path: '/state/root/bullets', value: BULLETS},
      ...(relatedDocuments === undefined
        ? []
        : [{path: '/state/root/relatedDocuments', value: relatedDocuments}]),
    ],
    catalogOptions,
  });
}

async function documentLinks() {
  await waitFor(() => expect(screen.queryByText(SUMMARY)).not.toBeNull());
  const section = screen.queryByRole('region', {name: 'Documentation & manuals'});
  return section === null
    ? []
    : Array.from(section.querySelectorAll('a')).map((link) => ({
        text: link.textContent,
        href: link.getAttribute('href'),
      }));
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

  it('lists the related documents with their file type and size', async () => {
    mountResearchCard(PRODUCT, {relatedDocuments: [relatedDocument(1, {size: 1536000})]});

    expect(await documentLinks()).toEqual([
      {text: 'Owner manual 1', href: 'https://example.com/manual-1.pdf'},
    ]);
    expect(screen.queryByText('PDF - 1.5 MB')).not.toBeNull();
  });

  it('lists the related documents under the card, outside its panel', async () => {
    mountResearchCard(PRODUCT, {relatedDocuments: [relatedDocument(1)]});

    await waitFor(() => expect(screen.queryByText(SUMMARY)).not.toBeNull());
    const card = screen.getByRole('article', {name: /^Product research: /});
    const documents = screen.getByRole('region', {name: 'Documentation & manuals'});
    expect(card.contains(documents)).toBe(false);
    expect(card.compareDocumentPosition(documents) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('lists at most 10 related documents by default, in the order they were sent', async () => {
    mountResearchCard(PRODUCT, {
      relatedDocuments: Array.from({length: 12}, (_, index) => relatedDocument(index)),
    });

    const links = await documentLinks();
    expect(links.map((link) => link.text)).toEqual(
      Array.from({length: 10}, (_, index) => `Owner manual ${index}`)
    );
  });

  it('lists at most maxLinks related documents', async () => {
    mountResearchCard(PRODUCT, {
      relatedDocuments: Array.from({length: 5}, (_, index) => relatedDocument(index)),
      catalogOptions: {productResearchCard: {maxLinks: 2}},
    });

    expect((await documentLinks()).map((link) => link.text)).toEqual([
      'Owner manual 0',
      'Owner manual 1',
    ]);
  });

  it('hides the related documents when maxLinks is 0', async () => {
    mountResearchCard(PRODUCT, {
      relatedDocuments: [relatedDocument(1)],
      catalogOptions: {productResearchCard: {maxLinks: 0}},
    });

    await waitFor(() => expect(screen.queryByText(SUMMARY)).not.toBeNull());
    expect(screen.queryByRole('region', {name: 'Documentation & manuals'})).toBeNull();
  });

  it.each([
    {maxLinks: -1, expected: 0},
    {maxLinks: 2.9, expected: 2},
    {maxLinks: Infinity, expected: 12},
  ])(
    'lists $expected related documents when maxLinks is $maxLinks',
    async ({maxLinks, expected}) => {
      mountResearchCard(PRODUCT, {
        relatedDocuments: Array.from({length: 12}, (_, index) => relatedDocument(index)),
        catalogOptions: {productResearchCard: {maxLinks}},
      });

      expect(await documentLinks()).toHaveLength(expected);
    }
  );

  it('skips a related document with neither a title nor a link', async () => {
    mountResearchCard(PRODUCT, {
      relatedDocuments: [relatedDocument(1, {title: '', clickUri: ''}), relatedDocument(2)],
      catalogOptions: {productResearchCard: {maxLinks: 1}},
    });

    expect((await documentLinks()).map((link) => link.text)).toEqual(['Owner manual 2']);
  });

  it('falls back to the link when a related document has no title', async () => {
    mountResearchCard(PRODUCT, {relatedDocuments: [relatedDocument(1, {title: ''})]});

    expect(await documentLinks()).toEqual([
      {text: 'https://example.com/manual-1.pdf', href: 'https://example.com/manual-1.pdf'},
    ]);
  });

  it('renders a document without a link as plain text', async () => {
    mountResearchCard(PRODUCT, {relatedDocuments: [relatedDocument(1, {clickUri: ''})]});

    expect(await documentLinks()).toEqual([]);
    expect(screen.queryByText('Owner manual 1')).not.toBeNull();
  });

  it('renders a document with a non-http(s) link as plain text', async () => {
    mountResearchCard(PRODUCT, {
      relatedDocuments: [relatedDocument(1, {clickUri: 'javascript:alert(1)'})],
    });

    expect(await documentLinks()).toEqual([]);
    expect(screen.queryByText('Owner manual 1')).not.toBeNull();
  });

  it('omits the file type and size a related document lacks', async () => {
    mountResearchCard(PRODUCT, {
      relatedDocuments: [{title: 'Owner manual 1', clickUri: 'https://example.com/manual-1.pdf'}],
    });

    expect(await documentLinks()).toEqual([
      {text: 'Owner manual 1', href: 'https://example.com/manual-1.pdf'},
    ]);
    expect(screen.queryByText(/PDF|kB/)).toBeNull();
  });

  it('renders no related documents section when the agent sends none', async () => {
    mountResearchCard(PRODUCT);

    await waitFor(() => expect(screen.queryByText(SUMMARY)).not.toBeNull());
    expect(screen.queryByRole('region', {name: 'Documentation & manuals'})).toBeNull();
    cleanup();

    mountResearchCard(PRODUCT, {relatedDocuments: []});
    await waitFor(() => expect(screen.queryByText(SUMMARY)).not.toBeNull());
    expect(screen.queryByRole('region', {name: 'Documentation & manuals'})).toBeNull();
  });
});

describe('formatDocumentSize', () => {
  it.each([
    [0, '0 B'],
    [512, '512 B'],
    [2048, '2 kB'],
    [333200, '333.2 kB'],
    [1536000, '1.5 MB'],
    [999950, '1 MB'],
    [3 * 1000 ** 3, '3 GB'],
    [Number.NaN, ''],
    [-1, ''],
  ])('formats %d bytes as %s', (bytes, expected) => {
    expect(formatDocumentSize(bytes)).toBe(expected);
  });
});
