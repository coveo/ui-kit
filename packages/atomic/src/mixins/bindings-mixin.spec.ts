import i18next from 'i18next';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {afterEach, beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import type {InitializableComponent} from '@/src/decorators/types';
import {fetchBindings, MissingInterfaceParentError} from '@/src/utils/initialization-common-utils';
import {InitializeBindingsMixin} from './bindings-mixin';

vi.mock('@/src/utils/initialization-common-utils', {spy: true});

const mockBindings = () =>
  ({
    i18n: i18next.createInstance(),
  }) as Bindings;

@customElement('test-element')
// oxlint-disable-next-line @typescript-eslint/no-unused-vars -- <used as an element>
class TestElement
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  @state()
  public bindings!: Bindings;

  public initialized = false;
  @state() public error!: Error;

  public render() {
    return html``;
  }

  initialize = vi.fn();
}

describe('InitializeBindingsMixin', () => {
  let element: InitializableComponent<Bindings> & LitElement;
  let bindings: Bindings;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  const mockedFetchBindings = fetchBindings as Mock;

  const setupElement = async <T extends LitElement>(tag = 'test-element') => {
    element = document.createElement(tag) as InitializableComponent<Bindings> & T;
    document.body.appendChild(element);
    element.bindings = bindings;
    await element.updateComplete;
  };

  const teardownElement = async () => {
    if (document.body.contains(element)) {
      document.body.removeChild(element);
    }
  };

  beforeEach(async () => {
    bindings = mockBindings();
    bindings.i18n.init();
    mockedFetchBindings.mockImplementation(() => Promise.resolve(bindings));
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    await teardownElement();
    consoleErrorSpy.mockRestore();
    mockedFetchBindings.mockRestore();
  });

  it('should subscribe to language changes', async () => {
    vi.spyOn(bindings.i18n, 'on');
    await setupElement();

    expect(element.bindings?.i18n.on).toHaveBeenCalled();
  });

  it('should unsubscribe from the subscribed language when the host is disconnected, even after its bindings change', async () => {
    await setupElement();
    await new Promise((resolve) => setTimeout(resolve));
    element.bindings = mockBindings();
    await teardownElement();
    const requestUpdateSpy = vi.spyOn(element, 'requestUpdate');

    await bindings.i18n.changeLanguage('fr');

    expect(requestUpdateSpy).not.toHaveBeenCalled();
  });

  it('should request a component update when the language changes', async () => {
    await setupElement();
    vi.spyOn(element, 'requestUpdate');
    element.bindings?.i18n.changeLanguage('fr');
    expect(element.requestUpdate).toHaveBeenCalled();
  });

  it('should call the initialize method when bindings are present', async () => {
    await setupElement();
    expect(element.initialize).toHaveBeenCalled();
  });

  it('should set and log the error once when the bindings fetch fails', async () => {
    const error = new MissingInterfaceParentError('test-element');
    mockedFetchBindings.mockRejectedValueOnce(error);

    await setupElement();
    await new Promise((resolve) => setTimeout(resolve));

    expect(element.error).toBe(error);
    expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(error, element);
  });

  it('should fetch the bindings for the host again and clear its fetch error after a failed fetch and a reconnection', async () => {
    mockedFetchBindings.mockRejectedValueOnce(new Error('Failed to fetch bindings'));
    await setupElement();
    await new Promise((resolve) => setTimeout(resolve));

    document.body.removeChild(element);
    document.body.appendChild(element);
    await new Promise((resolve) => setTimeout(resolve));

    expect(mockedFetchBindings).toHaveBeenLastCalledWith(element);
    expect(element.bindings).toBe(bindings);
    expect(element.error).toBeUndefined();
  });

  it('should keep an error set by another writer after a successful retry', async () => {
    mockedFetchBindings.mockRejectedValueOnce(new Error('Failed to fetch bindings'));
    await setupElement();
    await new Promise((resolve) => setTimeout(resolve));
    const otherError = new Error('Invalid prop');
    element.error = otherError;

    document.body.removeChild(element);
    document.body.appendChild(element);
    await new Promise((resolve) => setTimeout(resolve));

    expect(element.error).toBe(otherError);
  });

  it('should handle fetchBindings rejection gracefully', async () => {
    // Mock fetchBindings to return a rejected promise
    mockedFetchBindings.mockRejectedValue(new Error('Failed to fetch bindings'));

    // Call the function and expect it to reject
    await expect(fetchBindings(element)).rejects.toThrow('Failed to fetch bindings');
  });
});
