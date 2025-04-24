import {html, render} from 'lit';
import {afterEach} from 'vitest';
import {wrapper} from './search-box-wrapper';

describe('wrapper', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('should have disabled style when disabled', () => {
    render(wrapper({props: {disabled: true}})(html`children`), container);

    const element = container.querySelector('div');
    expect(element).toHaveClass(
      'focus-within:border-disabled focus-within:ring-neutral'
    );
  });

  test('should have primary style when not disabled', () => {
    render(wrapper({props: {disabled: false}})(html`children`), container);

    const element = container.querySelector('div');
    expect(element).toHaveClass(
      'focus-within:border-primary focus-within:ring-ring-primary'
    );
  });
});
