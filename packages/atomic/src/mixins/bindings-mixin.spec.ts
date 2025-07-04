import i18next from 'i18next';
import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {
  Mock,
  vi,
  describe,
  beforeEach,
  afterEach,
  it,
  test,
  expect,
} from 'vitest';
import type {Bindings} from '../components/search/atomic-search-interface/interfaces';
import {InitializableComponent} from '../decorators/types';
import {fetchBindings} from '../utils/initialization-lit-stencil-common-utils';
import {InitializeBindingsMixin} from './bindings-mixin';

vi.mock('../utils/initialization-lit-stencil-common-utils', () => ({
  fetchBindings: vi.fn(),
}));

const mockBindings = () =>
  ({
    i18n: i18next.createInstance(),
  }) as Bindings;

@customElement('test-element')
export class TestElement
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

describe('InitializeBindingsMixin mixin', () => {
  let element: InitializableComponent<Bindings> & LitElement;
  let bindings: Bindings;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  const mockedFetchBindings = fetchBindings as Mock;

  const setupElement = async <T extends LitElement>(tag = 'test-element') => {
    element = document.createElement(tag) as InitializableComponent<Bindings> &
      T;
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

  afterEach(() => {
    void teardownElement();
    consoleErrorSpy.mockRestore();
    mockedFetchBindings.mockRestore();
  });

  it('should subscribe to language changes', async () => {
    vi.spyOn(bindings.i18n, 'on');
    await setupElement();

    expect(element.bindings?.i18n.on).toHaveBeenCalled();
  });

  it('should unsubscribe to language changes when the host is disconnected from the component tree', async () => {
    vi.spyOn(bindings.i18n, 'off');
    await setupElement();
    await teardownElement();
    expect(element.bindings?.i18n.off).toHaveBeenCalled();
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

  test('should handle fetchBindings rejection gracefully', async () => {
    // Mock fetchBindings to return a rejected promise
    mockedFetchBindings.mockRejectedValue(
      new Error('Failed to fetch bindings')
    );

    // Call the function and expect it to reject
    await expect(fetchBindings(element)).rejects.toThrow(
      'Failed to fetch bindings'
    );
  });
});
