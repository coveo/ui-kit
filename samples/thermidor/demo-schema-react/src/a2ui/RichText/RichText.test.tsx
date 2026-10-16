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

  it('links the text itself when a segment has a reference', () => {
    const value: RichTextValue = {
      content: [
        {value: 'Install '},
        {value: 'under cover', reference: reference('guide')},
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

  it('falls back to plain text for a reference with an unsafe destination', () => {
    const value: RichTextValue = {
      content: [{value: 'claim', reference: reference('bad', {clickUri: 'javascript:alert(1)'})}],
    };
    render(
      <p data-testid="out">
        <RichText value={value} />
      </p>
    );
    expect(screen.getByTestId('out').textContent).toBe('claim');
    expect(screen.queryByRole('link')).toBeNull();
  });
});
