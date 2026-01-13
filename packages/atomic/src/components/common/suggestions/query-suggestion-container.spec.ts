import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderQuerySuggestionContainer} from './query-suggestion-container';

describe('#renderQuerySuggestionContainer', () => {
  it('should render a container with the correct part attribute', async () => {
    const container = await fixture(
      html`${renderQuerySuggestionContainer()(html`<span>child</span>`)}`
    );

    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('part', 'query-suggestion-content');
  });

  it('should render children inside the container', async () => {
    const container = await fixture(
      html`${renderQuerySuggestionContainer()(
        html`<span class="test-child">child content</span>`
      )}`
    );

    const child = container.querySelector('.test-child');

    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('child content');
  });

  it('should have pointer-events-none class', async () => {
    const container = await fixture(
      html`${renderQuerySuggestionContainer()(html`<span>child</span>`)}`
    );

    expect(container).toHaveClass('pointer-events-none');
  });

  it('should have flex layout classes', async () => {
    const container = await fixture(
      html`${renderQuerySuggestionContainer()(html`<span>child</span>`)}`
    );

    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('items-center');
  });
});
