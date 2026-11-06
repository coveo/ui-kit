import {afterEach, describe, expect, it} from 'vitest';
import {cleanup, screen, waitFor} from '@testing-library/react';
import {mountSurface} from '../mount-surface.harness.js';

/**
 * CitedDocuments is mounted end to end through the real thermidor catalog: `documents` is a
 * `{path}` binding resolved from the surface data model, as an agent's surface binds it.
 */

afterEach(() => cleanup());

function mountCitedDocuments(documents: unknown[]) {
  mountSurface({
    component: {component: 'CitedDocuments', documents: {path: '/state/root/documents'}},
    dataModel: [{path: '/state/root/documents', value: documents}],
  });
}

describe('CitedDocuments', () => {
  it('lists each document under its label, its title linking to it, with its details', async () => {
    mountCitedDocuments([
      {
        label: 2,
        title: 'Rate limits',
        clickUri: 'https://docs.example.com/rate-limits',
        details: [
          {name: 'source', displayName: 'Source', value: 'Product Docs'},
          {name: 'author', displayName: 'Author', value: 'Jane Doe'},
        ],
      },
    ]);

    await waitFor(() => expect(screen.getByRole('heading', {name: 'Sources'})).not.toBeNull());
    expect(screen.getByText('[2]')).not.toBeNull();
    expect(screen.getByRole('link', {name: 'Rate limits'}).getAttribute('href')).toBe(
      'https://docs.example.com/rate-limits'
    );
    expect(screen.getByText('Source: Product Docs · Author: Jane Doe')).not.toBeNull();
  });

  it('shows a document without a link as plain text, and no details line without details', async () => {
    mountCitedDocuments([{label: 1, title: 'Handbook', details: []}]);

    await waitFor(() => expect(screen.getByText('Handbook')).not.toBeNull());
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('shows nothing until its documents are resolved', () => {
    mountSurface({
      component: {component: 'CitedDocuments', documents: {path: '/state/root/documents'}},
      dataModel: [],
    });

    expect(screen.queryByRole('heading', {name: 'Sources'})).toBeNull();
  });
});
