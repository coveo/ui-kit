import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderQuerySuggestionText} from './query-suggestion-text';

describe('#renderQuerySuggestionText', () => {
  const mockSuggestion = {
    highlightedValue: '<b>high</b>lighted',
    rawValue: 'highlighted',
  };

  it('should render a span with the correct part attribute', async () => {
    const container = await fixture(
      html`<div>
        ${renderQuerySuggestionText({props: {suggestion: mockSuggestion, hasQuery: true}})}
      </div>`
    );

    const span = container.querySelector('span');

    expect(span).toBeInTheDocument();
    expect(span).toHaveAttribute('part', 'query-suggestion-text');
  });

  it('should have the correct CSS classes', async () => {
    const container = await fixture(
      html`<div>
        ${renderQuerySuggestionText({props: {suggestion: mockSuggestion, hasQuery: true}})}
      </div>`
    );

    const span = container.querySelector('span');

    expect(span).toHaveClass('line-clamp-2');
    expect(span).toHaveClass('break-all');
  });

  it('should render the highlighted value as innerHTML when hasQuery is true', async () => {
    const container = await fixture(
      html`<div>
        ${renderQuerySuggestionText({props: {suggestion: mockSuggestion, hasQuery: true}})}
      </div>`
    );

    const span = container.querySelector('span');
    const boldElement = span?.querySelector('b');

    expect(boldElement).toBeInTheDocument();
    expect(boldElement).toHaveTextContent('high');
  });

  it('should render the raw value as text content when hasQuery is false', async () => {
    const container = await fixture(
      html`<div>
        ${renderQuerySuggestionText({props: {suggestion: mockSuggestion, hasQuery: false}})}
      </div>`
    );

    const span = container.querySelector('span');

    expect(span).toHaveTextContent('highlighted');
    expect(span?.querySelector('b')).not.toBeInTheDocument();
  });
});
