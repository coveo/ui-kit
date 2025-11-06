import {provide} from '@lit/context';
import i18next from 'i18next';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {bindingsContext} from '../components/common/context/bindings-context';
import type {Bindings} from '../components/search/atomic-search-interface/interfaces';
import {bindings} from './bindings';
import type {InitializableComponent} from './types';

const mockBindings = () =>
  ({
    i18n: i18next.createInstance(),
  }) as Bindings;

@customElement('test-element')
@bindings()
class TestElement
  extends LitElement
  implements InitializableComponent<Bindings>
{
  @state()
  public bindings: Bindings = {} as Bindings;
  @state() public error!: Error;

  public initialized = false;

  public render() {
    return html``;
  }

  initialize = vi.fn();
}
@customElement('test-interface-element')
class TestInterfaceElement extends LitElement {
  @state()
  @provide({context: bindingsContext})
  public bindings: Bindings = {} as Bindings;
  @state() public error!: Error;

  public initialized = false;

  public render() {
    return html`interface`;
  }

  public initialize() {
    this.bindings = mockBindings();
    this.bindings.i18n.init();
  }
}

describe('bindings decorator', () => {
  let element: InitializableComponent<Bindings> & LitElement;
  let interfaceElement: TestInterfaceElement;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  const setupElement = async <
    T extends InitializableComponent<Bindings> & LitElement,
  >(
    tag: string = 'test-element',
    preSetupCallback?: (element: T) => void
  ) => {
    element = document.createElement(tag) as T;

    if (preSetupCallback) {
      preSetupCallback(element as T);
    }

    interfaceElement.appendChild(element);

    await element.updateComplete;
  };

  const teardownElement = async () => {
    if (interfaceElement.contains(element)) {
      interfaceElement.removeChild(element);
    }
    if (document.body.contains(interfaceElement)) {
      document.body.removeChild(interfaceElement);
    }
  };

  beforeEach(async () => {
    interfaceElement = document.createElement(
      'test-interface-element'
    ) as TestInterfaceElement;
    document.body.appendChild(interfaceElement);
    interfaceElement.initialize();

    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    await teardownElement();
    consoleErrorSpy.mockRestore();
  });

  it('should subscribe to language changes', async () => {
    vi.spyOn(interfaceElement.bindings.i18n, 'on');
    await setupElement();

    expect(element.bindings?.i18n.on).toHaveBeenCalled();
  });

  it('should unsubscribe from language changes when the host is disconnected from the component tree', async () => {
    vi.spyOn(interfaceElement.bindings.i18n, 'off');
    await setupElement();
    await teardownElement();
    expect(element.bindings?.i18n.off).toHaveBeenCalled();
    expect(interfaceElement.bindings?.i18n.off).toHaveBeenCalled();
  });

  it('should request a component update when the language changes', async () => {
    await setupElement();
    vi.spyOn(element, 'requestUpdate');
    interfaceElement.bindings?.i18n.changeLanguage('fr');
    expect(element.requestUpdate).toHaveBeenCalled();
  });

  it('should call the initialize method when bindings are present', async () => {
    await setupElement();

    expect(element.initialize).toHaveBeenCalled();
  });

  it('should set the error property when an exception occurs during initialization', async () => {
    const mockError = new Error('Initialization failed');

    await setupElement('test-element', (el) => {
      vi.spyOn(el as TestElement, 'initialize').mockImplementation(() => {
        throw mockError;
      });
    });

    expect(element.error).toEqual(mockError);
  });
});
