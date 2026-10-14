import {html, nothing, render} from 'lit';
import {AsyncDirective, directive} from 'lit/async-directive.js';
import {ref} from 'lit/directives/ref.js';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {keyed} from './keyed';

const disconnectedSpy = vi.fn();

class TrackingDirective extends AsyncDirective {
  render() {
    return nothing;
  }

  disconnected() {
    disconnectedSpy();
  }
}

const tracking = directive(TrackingDirective);

describe('keyed', () => {
  let container: HTMLElement;

  beforeEach(() => {
    disconnectedSpy.mockClear();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderKeyed = (key: string, text: string) =>
    render(html`${keyed(key, html`<div>${text}</div>`)}`, container);

  it('should keep the same element when the key does not change', () => {
    renderKeyed('a', 'first');
    const element = container.querySelector('div');
    renderKeyed('a', 'second');
    expect(container.querySelector('div')).toBe(element);
    expect(container.textContent).toContain('second');
  });

  it('should re-create the element when the key changes', () => {
    renderKeyed('a', 'first');
    const element = container.querySelector('div');
    renderKeyed('b', 'second');
    expect(container.querySelector('div')).not.toBe(element);
    expect(container.querySelectorAll('div')).toHaveLength(1);
    expect(container.textContent).toContain('second');
  });

  it('should disconnect the async directives of the previous value when the key changes', () => {
    render(html`${keyed('a', html`<div>${tracking()}</div>`)}`, container);
    render(html`${keyed('b', html`<div>${tracking()}</div>`)}`, container);
    expect(disconnectedSpy).toHaveBeenCalledTimes(1);
  });

  it('should release the previous element from a ref() when the key changes', () => {
    const refCallback = vi.fn();
    render(html`${keyed('a', html`<div ${ref(refCallback)}></div>`)}`, container);
    const element = container.querySelector('div');
    expect(refCallback).toHaveBeenLastCalledWith(element);
    render(html`${keyed('b', html`<div ${ref(refCallback)}></div>`)}`, container);
    expect(refCallback).toHaveBeenCalledWith(undefined);
    expect(refCallback).toHaveBeenLastCalledWith(container.querySelector('div'));
  });
});
