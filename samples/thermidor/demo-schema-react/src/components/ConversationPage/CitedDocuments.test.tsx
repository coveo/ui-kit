import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {CitedDocuments} from './CitedDocuments.js';

describe('CitedDocuments', () => {
  it('lists each document with its label, its title linking to it, and its source', () => {
    render(
      <CitedDocuments
        documents={[
          {
            label: 2,
            title: 'Rate limits',
            link: 'https://docs.example.com/rate-limits',
            details: {source: {name: 'Product Docs'}},
          },
        ]}
      />
    );

    expect(screen.getByRole('heading', {name: 'Sources'})).not.toBeNull();
    expect(screen.getByText('[2]')).not.toBeNull();
    expect(screen.getByRole('link', {name: 'Rate limits'}).getAttribute('href')).toBe(
      'https://docs.example.com/rate-limits'
    );
    expect(screen.getByText('Product Docs')).not.toBeNull();
  });

  it('names a document without a title by its link, or else by its label', () => {
    render(
      <CitedDocuments
        documents={[
          {label: 1, title: null, link: 'https://docs.example.com/a'},
          {label: 3, title: null, link: null},
        ]}
      />
    );

    expect(screen.getByRole('link', {name: 'https://docs.example.com/a'})).not.toBeNull();
    expect(screen.getByText('Document 3')).not.toBeNull();
  });

  it('shows nothing when no document is cited', () => {
    const {container} = render(<CitedDocuments documents={[]} />);

    expect(container.innerHTML).toBe('');
  });
});
