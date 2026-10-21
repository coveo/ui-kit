import {html, render} from 'lit';
import {ref} from 'lit/directives/ref.js';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {keyed} from './keyed';

describe('keyed', () => {
  let container: HTMLElement;

  const renderText = (key: string, text: string) =>
    render(html`${keyed(key, html`<div>${text}</div>`)}`, container);

  const renderWithRef = (key: string, callback: (element?: Element) => void) =>
    render(html`${keyed(key, html`<div ${ref(callback)}></div>`)}`, container);

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should keep the same element when the key does not change', () => {
    renderText('a', 'first');
    const element = container.querySelector('div');
    renderText('a', 'second');
    expect(container.querySelector('div')).toBe(element);
    expect(container.textContent).toContain('second');
  });

  describe('when the key changes', () => {
    it('should re-create the element', () => {
      renderText('a', 'first');
      const element = container.querySelector('div');
      renderText('b', 'second');
      expect(container.querySelector('div')).not.toBe(element);
      expect(container.querySelectorAll('div')).toHaveLength(1);
      expect(container.textContent).toContain('second');
    });

    it('should release the previous element from its ref()', () => {
      const previousRef = vi.fn();
      renderWithRef('a', previousRef);
      const element = container.querySelector('div');
      renderWithRef('b', vi.fn());
      expect(previousRef.mock.calls).toEqual([[element], [undefined]]);
    });
  });
});
