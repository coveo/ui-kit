import {describe, it, expect, afterEach} from 'vitest';
import {screen, cleanup, render} from '@testing-library/react';
import type {Reference, RichText as RichTextValue} from '@coveo/thermidor-schema';
import {RichText} from './RichText.js';

afterEach(() => cleanup());

const reference = (permanentId: string, overrides: Partial<Reference> = {}): Reference => ({
  kind: 'knowledge',
  permanentId,
  title: `Doc ${permanentId}`,
  clickUri: `https://example.com/${permanentId}.pdf`,
  ...overrides,
});

describe('RichText', () => {
  it('renders a plain string as text', () => {
    render(
      <p data-testid="out">
        <RichText value="Just text." />
      </p>
    );
    expect(screen.getByTestId('out').textContent).toBe('Just text.');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders unreferenced segments as plain text', () => {
    const value: RichTextValue = {content: [{value: 'One '}, {value: 'two.'}]};
    render(
      <p data-testid="out">
        <RichText value={value} />
      </p>
    );
    expect(screen.getByTestId('out').textContent).toBe('One two.');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('links the text itself when a segment has a single reference', () => {
    const value: RichTextValue = {
      content: [
        {value: 'Install '},
        {value: 'under cover', references: [reference('guide')]},
        {value: '.'},
      ],
    };
    render(
      <p data-testid="out">
        <RichText value={value} />
      </p>
    );
    const link = screen.getByRole('link', {name: 'under cover'});
    expect(link.getAttribute('href')).toBe('https://example.com/guide.pdf');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByTestId('out').textContent).toBe('Install under cover.');
  });

  it('keeps the text plain and adds numbered badges when a segment has several references', () => {
    const value: RichTextValue = {
      content: [{value: 'Outdoor rated', references: [reference('guide'), reference('spec')]}],
    };
    render(
      <p data-testid="out">
        <RichText value={value} />
      </p>
    );
    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual(['1', '2']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'https://example.com/guide.pdf',
      'https://example.com/spec.pdf',
    ]);
    expect(screen.getByRole('link', {name: 'Doc spec'})).toBeDefined();
    expect(screen.queryByRole('link', {name: 'Outdoor rated'})).toBeNull();
  });

  it('numbers badges per citation, restarting at 1', () => {
    const value: RichTextValue = {
      content: [
        {value: 'A', references: [reference('a'), reference('b')]},
        {value: ' and B', references: [reference('c'), reference('d')]},
      ],
    };
    render(<RichText value={value} />);
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      '1',
      '2',
      '1',
      '2',
    ]);
  });

  it('falls back to plain text for a reference with an unsafe destination', () => {
    const value: RichTextValue = {
      content: [
        {value: 'claim', references: [reference('bad', {clickUri: 'javascript:alert(1)'})]},
      ],
    };
    render(
      <p data-testid="out">
        <RichText value={value} />
      </p>
    );
    expect(screen.getByTestId('out').textContent).toBe('claim');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('drops unsafe references but keeps the valid ones', () => {
    const value: RichTextValue = {
      content: [
        {
          value: 'claim',
          references: [reference('bad', {clickUri: 'not a url'}), reference('good')],
        },
      ],
    };
    render(<RichText value={value} />);
    // One valid reference left: the text itself becomes the link.
    expect(screen.getByRole('link', {name: 'claim'}).getAttribute('href')).toBe(
      'https://example.com/good.pdf'
    );
  });
});
