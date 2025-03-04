import i18next from 'i18next';
import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {Mock, vi} from 'vitest';
import type {Bindings} from '../components/search/atomic-search-interface/interfaces';
import {InitializableComponent} from '../decorators/types';
import {fetchBindings} from '../utils/initialization-lit-stencil-common-utils';
import {InitializeBindingsMixin} from './bindings-mixin';

vi.mock('../utils/initialization-lit-stencil-common-utils', () => ({
  fetchBindings: vi.fn(),
}));

vi.unmock('./bindings-mixin');

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
    await element.updateComplete;
  };

  const teardownElement = () => {
    if (document.body.contains(element)) {
      document.body.removeChild(element);
    }
  };

  beforeEach(async () => {
    bindings = mockBindings();
    bindings.i18n.init();
    mockedFetchBindings.mockImplementation(() => Promise.resolve(bindings));
    consoleErrorSpy = vi.spyOn(console, 'error');
  });

  afterEach(() => {
    teardownElement();
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

  it('should return an error to the element if unable to fetch bindings', async () => {
    mockedFetchBindings.mockRejectedValue(new Error('test-element'));
    await setupElement();

    expect(element.error).toBeInstanceOf(Error);
  });
});
