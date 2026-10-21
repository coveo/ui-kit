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

  const renderTracked = (key: string) =>
    render(html`${keyed(key, html`<div>${tracking()}</div>`)}`, container);

  const renderWithRef = (key: string, callback: (element?: Element) => void) =>
    render(html`${keyed(key, html`<div ${ref(callback)}></div>`)}`, container);

  it('should disconnect the async directives of the previous value when the key changes', () => {
    renderTracked('a');
    renderTracked('b');
    expect(disconnectedSpy).toHaveBeenCalledOnce();
  });

  it('should not disconnect the async directives when the key does not change', () => {
    renderTracked('a');
    renderTracked('a');
    expect(disconnectedSpy).not.toHaveBeenCalled();
  });

  it('should release the previous element from its ref() when the key changes', () => {
    const previousRef = vi.fn();
    const nextRef = vi.fn();
    renderWithRef('a', previousRef);
    const element = container.querySelector('div');
    renderWithRef('b', nextRef);
    expect(previousRef.mock.calls).toEqual([[element], [undefined]]);
    expect(nextRef).toHaveBeenCalledExactlyOnceWith(container.querySelector('div'));
  });
});
