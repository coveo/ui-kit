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

function renderValue(value: string | RichTextValue) {
  render(
    <p data-testid="out">
      <RichText value={value} />
    </p>
  );
  return screen.getByTestId('out');
}

describe('RichText (Markdown citations)', () => {
  it('renders a plain string as text, without interpreting Markdown', () => {
    const out = renderValue('Just [text](ref:guide).');
    expect(out.textContent).toBe('Just [text](ref:guide).');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders Markdown without citations as plain text', () => {
    const out = renderValue({markdown: 'One two.'});
    expect(out.textContent).toBe('One two.');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('links the cited text through its resolved clickUri', () => {
    const out = renderValue({
      markdown: 'Install [under cover](ref:guide).',
      references: [reference('guide')],
    });
    const link = screen.getByRole('link', {name: 'under cover'});
    expect(link.getAttribute('href')).toBe('https://example.com/guide.pdf');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(out.textContent).toBe('Install under cover.');
  });

  it('resolves several citations in one value, each to its own reference', () => {
    renderValue({
      markdown: '[First](ref:a) and [second](ref:b).',
      references: [reference('a'), reference('b')],
    });
    expect(screen.getByRole('link', {name: 'First'}).getAttribute('href')).toBe(
      'https://example.com/a.pdf'
    );
    expect(screen.getByRole('link', {name: 'second'}).getAttribute('href')).toBe(
      'https://example.com/b.pdf'
    );
  });

  it('shows escaped characters and ampersands as the producer wrote them', () => {
    const out = renderValue({
      markdown: 'Cost \\[5\\] & more [claim](ref:a)',
      references: [reference('a')],
    });
    expect(out.textContent).toBe('Cost [5] & more claim');
  });

  it('does not navigate to the Markdown destination, only to the reference clickUri', () => {
    renderValue({
      markdown: '[claim](https://evil.example/)',
      references: [reference('a')],
    });
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('does not turn bare URLs into links', () => {
    renderValue({markdown: 'See https://example.com for details.'});
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('falls back to plain text for a citation without a matching reference', () => {
    const out = renderValue({markdown: 'A [claim](ref:missing).', references: [reference('a')]});
    expect(out.textContent).toBe('A claim.');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('falls back to plain text for a reference with an unsafe destination', () => {
    const out = renderValue({
      markdown: '[claim](ref:bad)',
      references: [reference('bad', {clickUri: 'javascript:alert(1)'})],
    });
    expect(out.textContent).toBe('claim');
    expect(screen.queryByRole('link')).toBeNull();
  });
});
