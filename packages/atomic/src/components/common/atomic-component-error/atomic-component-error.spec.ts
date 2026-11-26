import {html} from 'lit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import './atomic-component-error';
import {AtomicComponentError} from './atomic-component-error';

describe('atomic-component-error', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let element: HTMLElement;
  let error: Error;

  const setupElement = () =>
    fixture<AtomicComponentError>(
      html`<atomic-component-error .element=${element} .error=${error}></atomic-component-error>`
    );

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    element = document.createElement('div');
    error = new Error('Test error');
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should be defined', async () => {
    const el = await setupElement();
    expect(el).toBeInstanceOf(AtomicComponentError);
  });

  it('should render the error message', async () => {
    const el = await setupElement();
    expect(el.shadowRoot?.innerHTML).toContain(
      'Look at the developer console for more information'
    );
  });

  it('should log the error to the console once', async () => {
    const el = await setupElement();
    el.requestUpdate();
    await el.updateComplete;

    expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(error, element);
  });

  it('should log an error that replaces the displayed one', async () => {
    const el = await setupElement();
    const replacingError = new Error('Replacing error');

    el.error = replacingError;
    await el.updateComplete;

    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenLastCalledWith(replacingError, element);
  });

  it('should log an error once when several boxes render it', async () => {
    await fixture(
      html`<div>
        <atomic-component-error .element=${element} .error=${error}></atomic-component-error>
        <atomic-component-error .element=${element} .error=${error}></atomic-component-error>
      </div>`
    );

    expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(error, element);
  });

  it('should log the error to the console when the element is loaded after being attached to the DOM', async () => {
    const el = await fixture(
      html`<atomic-component-error-clone
        .element=${element}
        .error=${error}
      ></atomic-component-error-clone>`
    );
    customElements.define('atomic-component-error-clone', class extends AtomicComponentError {});

    await el.updateComplete;

    expect(consoleErrorSpy).toHaveBeenCalledWith(error, element);
  });
});
