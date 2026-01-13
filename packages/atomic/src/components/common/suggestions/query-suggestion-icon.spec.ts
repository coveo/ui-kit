import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderQuerySuggestionIcon} from './query-suggestion-icon';

describe('#renderQuerySuggestionIcon', () => {
  it('should render an atomic-icon when hasSuggestion is true', async () => {
    const container = await fixture(
      html`<div>
        ${renderQuerySuggestionIcon({props: {icon: 'test-icon', hasSuggestion: true}})}
      </div>`
    );

    const icon = container.querySelector('atomic-icon');

    expect(icon).toBeInTheDocument();
  });

  it('should have the correct part attribute', async () => {
    const container = await fixture(
      html`<div>
        ${renderQuerySuggestionIcon({props: {icon: 'test-icon', hasSuggestion: true}})}
      </div>`
    );

    const icon = container.querySelector('atomic-icon');

    expect(icon).toHaveAttribute('part', 'query-suggestion-icon');
  });

  it('should pass the icon prop to atomic-icon', async () => {
    const container = await fixture(
      html`<div>
        ${renderQuerySuggestionIcon({props: {icon: 'my-custom-icon', hasSuggestion: true}})}
      </div>`
    );

    const icon = container.querySelector('atomic-icon');

    expect(icon).toHaveAttribute('icon', 'my-custom-icon');
  });

  it('should have the correct CSS classes', async () => {
    const container = await fixture(
      html`<div>
        ${renderQuerySuggestionIcon({props: {icon: 'test-icon', hasSuggestion: true}})}
      </div>`
    );

    const icon = container.querySelector('atomic-icon');

    expect(icon).toHaveClass('mr-2');
    expect(icon).toHaveClass('h-4');
    expect(icon).toHaveClass('w-4');
    expect(icon).toHaveClass('shrink-0');
  });

  it('should render nothing when hasSuggestion is false', async () => {
    const container = await fixture(
      html`<div>
        ${renderQuerySuggestionIcon({props: {icon: 'test-icon', hasSuggestion: false}})}
      </div>`
    );

    const icon = container.querySelector('atomic-icon');

    expect(icon).not.toBeInTheDocument();
  });
});
