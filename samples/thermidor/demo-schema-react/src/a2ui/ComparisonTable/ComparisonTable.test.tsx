import {describe, expect, it, afterEach} from 'vitest';
import {screen, cleanup, waitFor, within} from '@testing-library/react';
import {mountSurface} from '../mount-surface.harness.js';
import type {ThermidorCatalogOptions} from '../components.js';

/**
 * Mounts ComparisonTable through the real thermidor catalog and checks the Additional information
 * row, which lists each compared product's related documents.
 */

afterEach(() => cleanup());

const HEADING = 'Wetsuit comparison';

function relatedDocument(index: number) {
  return {
    title: `Owner manual ${index}`,
    clickUri: `https://example.com/manual-${index}.pdf`,
    filetype: 'pdf',
    size: 1536000,
  };
}

function mountComparisonTable(
  products: Record<string, unknown>[],
  catalogOptions?: ThermidorCatalogOptions,
  attributes: Record<string, unknown>[] = []
) {
  mountSurface({
    component: {
      component: 'ComparisonTable',
      heading: {path: '/state/root/heading'},
      summary: {path: '/state/root/summary'},
      products: {path: '/state/root/products'},
      attributes: {path: '/state/root/attributes'},
    },
    dataModel: [
      {path: '/state/root/heading', value: HEADING},
      {path: '/state/root/summary', value: 'A short summary.'},
      {path: '/state/root/products', value: products},
      {path: '/state/root/attributes', value: attributes},
    ],
    catalogOptions,
  });
}

async function documentCells() {
  await waitFor(() => expect(screen.queryByRole('table', {name: HEADING})).not.toBeNull());
  const row = screen
    .queryByRole('rowheader', {name: 'Additional information'})
    ?.closest('[role="row"]');
  return row ? within(row as HTMLElement).getAllByRole('cell') : null;
}

function linkTexts(cell: HTMLElement) {
  return Array.from(cell.querySelectorAll('a')).map((link) => link.textContent);
}

describe('ComparisonTable Additional information row', () => {
  it("lists each product's related documents with their file type and size", async () => {
    mountComparisonTable([
      {productId: 'a', name: 'Wetsuit A', relatedDocuments: [relatedDocument(1)]},
      {productId: 'b', name: 'Wetsuit B'},
    ]);

    const cells = (await documentCells())!;
    expect(linkTexts(cells[0])).toEqual(['Owner manual 1']);
    expect(within(cells[0]).getByRole('link').getAttribute('href')).toBe(
      'https://example.com/manual-1.pdf'
    );
    expect(within(cells[0]).queryByText('PDF - 1.5 MB')).not.toBeNull();
    expect(cells[1].textContent).toBe('—');
  });

  it('caps each cell at 10 documents by default and at maxLinks when set', async () => {
    const documents = Array.from({length: 12}, (_, index) => relatedDocument(index));
    mountComparisonTable([{productId: 'a', name: 'Wetsuit A', relatedDocuments: documents}]);
    expect(linkTexts((await documentCells())![0])).toHaveLength(10);
    cleanup();

    mountComparisonTable([{productId: 'a', name: 'Wetsuit A', relatedDocuments: documents}], {
      comparisonTable: {maxLinks: 2},
    });
    expect(linkTexts((await documentCells())![0])).toEqual(['Owner manual 0', 'Owner manual 1']);
  });

  it('omits the row when no product has related documents', async () => {
    mountComparisonTable(
      [
        {productId: 'a', name: 'Wetsuit A', values: {standout: 'Warm'}},
        {productId: 'b', name: 'Wetsuit B', relatedDocuments: []},
      ],
      undefined,
      [{key: 'standout', label: 'Standout'}]
    );

    expect(await documentCells()).toBeNull();
    expect(screen.queryByRole('rowheader', {name: 'Standout'})).not.toBeNull();
  });
});
