import {provide} from '@lit/context';
import i18next from 'i18next';
import {html, LitElement, type ReactiveController} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {bindingsContext} from '../components/common/context/bindings-context';
import type {Bindings} from '../components/search/atomic-search-interface/interfaces';
import {MissingInterfaceParentError} from '../utils/initialization-common-utils';
import {bindings} from './bindings';
import type {InitializableComponent} from './types';

const mockBindings = () =>
  ({
    i18n: i18next.createInstance(),
  }) as Bindings;

@customElement('test-element')
@bindings()
class TestElement extends LitElement implements InitializableComponent<Bindings> {
  @state()
  public bindings: Bindings = {} as Bindings;
  @state() public error!: Error;

  public initialized = false;

  public render() {
    return html``;
  }

  initialize = vi.fn();
}
const lifecycle: string[] = [];

@customElement('test-element-with-controller')
@bindings()
// oxlint-disable-next-line @typescript-eslint/no-unused-vars -- <used as an element>
class TestElementWithController extends LitElement implements InitializableComponent<Bindings> {
  @state() public bindings!: Bindings;
  public initialized = false;

  constructor() {
    super();
    this.addController({
      hostConnected: () => lifecycle.push('controller connected'),
    } satisfies ReactiveController);
  }

  public initialize() {
    lifecycle.push('initialize');
  }
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

@customElement('test-late-slot-wrapper')
// oxlint-disable-next-line @typescript-eslint/no-unused-vars -- <used as an element>
class TestLateSlotWrapper extends LitElement {
  private interfaceBindings = mockBindings();

  public render() {
    return html`<atomic-external
      ><test-interface-element .bindings=${this.interfaceBindings}
        ><slot></slot></test-interface-element
    ></atomic-external>`;
  }
}

describe('bindings decorator', () => {
  let element: InitializableComponent<Bindings> & LitElement;
  let interfaceElement: TestInterfaceElement;
  let interfaceWrapper: HTMLElement;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  const setupElement = async <T extends InitializableComponent<Bindings> & LitElement>(
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
    element?.remove();
    interfaceWrapper.remove();
  };

  const nextTask = () => new Promise((resolve) => setTimeout(resolve));

  const reconnect = (node: Element) => {
    const parent = node.parentNode!;
    node.remove();
    parent.appendChild(node);
  };

  beforeEach(async () => {
    interfaceWrapper = document.createElement('atomic-external');
    interfaceElement = document.createElement('test-interface-element') as TestInterfaceElement;
    interfaceWrapper.appendChild(interfaceElement);
    document.body.appendChild(interfaceWrapper);
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

  it('should set, log once and render the error when initialize throws', async () => {
    const mockError = new Error('Initialization failed');
    let requestUpdateSpy!: ReturnType<typeof vi.spyOn>;

    await setupElement('test-element', (el) => {
      vi.spyOn(el as TestElement, 'initialize').mockImplementation(() => {
        throw mockError;
      });
      requestUpdateSpy = vi.spyOn(el, 'requestUpdate');
    });

    expect(element.error).toBe(mockError);
    expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(mockError, element);
    expect(requestUpdateSpy).toHaveBeenCalledWith();
  });

  it('should wrap a thrown value that is not an Error', async () => {
    await setupElement('test-element', (el) => {
      vi.spyOn(el as TestElement, 'initialize').mockImplementation(() => {
        throw 'Initialization failed';
      });
    });

    expect(element.error).toEqual(new Error('Initialization failed'));
    expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(element.error, element);
  });

  it('should request the bindings once per connection', async () => {
    const contextRequestListener = vi.fn();
    interfaceElement.addEventListener('context-request', contextRequestListener);
    await setupElement();

    reconnect(element);

    expect(contextRequestListener).toHaveBeenCalledTimes(2);
  });

  it('should connect the component controllers before calling initialize', async () => {
    lifecycle.length = 0;

    await setupElement('test-element-with-controller');

    expect(lifecycle).toEqual(['controller connected', 'initialize']);
  });

  it('should keep updating on language changes after a reconnection', async () => {
    await setupElement();
    reconnect(element);
    const requestUpdateSpy = vi.spyOn(element, 'requestUpdate');

    await interfaceElement.bindings.i18n.changeLanguage('fr');

    expect(requestUpdateSpy).toHaveBeenCalled();
  });

  it('should log a missing interface error once per connection, without rendering it', async () => {
    element = document.createElement('test-element-with-controller') as TestElementWithController;
    document.body.appendChild(element);
    await nextTask();

    reconnect(element);
    await nextTask();

    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(MissingInterfaceParentError), element);
    expect(element.error).toBeUndefined();
    expect(element.shadowRoot!.children).toHaveLength(0);
  });

  it('should not report a missing interface when a wrapper renders the interface slot after the component connects', async () => {
    const wrapper = document.createElement('test-late-slot-wrapper');
    element = document.createElement('test-element') as TestElement;
    wrapper.appendChild(element);
    document.body.appendChild(wrapper);
    await nextTask();

    const shadowInterface = wrapper.shadowRoot!.querySelector(
      'test-interface-element'
    ) as TestInterfaceElement;
    expect(element.bindings).toBe(shadowInterface.bindings);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    wrapper.remove();
  });

  it('should not report a missing interface when slotted into an interface through another shadow root', async () => {
    const host = document.createElement('div');
    host.attachShadow({mode: 'open'}).innerHTML =
      '<atomic-external><test-interface-element><slot></slot></test-interface-element></atomic-external>';
    const shadowInterface = host.shadowRoot!.querySelector(
      'test-interface-element'
    ) as TestInterfaceElement;
    shadowInterface.initialize();
    element = document.createElement('test-element') as TestElement;
    host.appendChild(element);
    document.body.appendChild(host);
    await element.updateComplete;

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(element.bindings).toBe(shadowInterface.bindings);
    host.remove();
  });
});
