import {html} from 'lit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import './atomic-component-error';
import {AtomicComponentError} from './atomic-component-error';

describe('atomic-component-error', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  const setupElement = () => {
    const element = document.createElement('div');
    const error = new Error('Test error');
    return fixture(
      html`<atomic-component-error
        .element=${element}
        .error=${error}
      ></atomic-component-error>`
    );
  };

  beforeEach(async () => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
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

  it('should log the error to the console', async () => {
    const element = document.createElement('div');
    const error = new Error('Test error');
    await setupElement();
    expect(consoleErrorSpy).toHaveBeenCalledWith(error, element);
  });

  it('should log the error to the console when the element is loaded after being attached to the DOM', async () => {
    const element = document.createElement('div');
    const error = new Error('Test error');
    const el = await fixture(
      html`<atomic-component-error-clone
        .element=${element}
        .error=${error}
      ></atomic-component-error-clone>`
    );
    customElements.define(
      'atomic-component-error-clone',
      class extends AtomicComponentError {}
    );

    await el.updateComplete;

    expect(consoleErrorSpy).toHaveBeenCalledWith(error, element);
  });
});
