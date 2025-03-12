import {Bindings} from '@/src/components';
import {
  CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {provide} from '@lit/context';
import i18next from 'i18next';
import {html} from 'lit';
import {LitElement, render, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {describe, test, expect} from 'vitest';
import {bindingsContext} from '../../context/bindings-context';
import {AtomicCommerceInterface} from './atomic-commerce-interface';

const cachedWrappers: Set<HTMLElement> = new Set();

/**
 * Wrapper for fixture, creates a new parent node and appends it to the document body
 * You do not need to use this function directly in the tests if you use`fixture`.
 * @param {HTMLElement} parentNode - The parent node to append to the document body.
 */
export function fixtureWrapper(parentNode: HTMLElement) {
  document.body.appendChild(parentNode);
  cachedWrappers.add(parentNode);
  return parentNode;
}

/**
 * Cleans up all the cached wrappers created by the fixtureWrapper function.
 * This function will automatically be called after each tests.
 */
export function fixtureCleanup() {
  if (cachedWrappers.size > 0) {
    for (const wrapper of cachedWrappers) {
      document.body.removeChild(wrapper);
    }
    cachedWrappers.clear();
  }
}

/**
 * Asynchronously renders a Lit template into a parentNode and waits for the element to update.
 * @param {TemplateResult} template - The Lit template to render.
 * @param {HTMLElement} [parentNode=document.createElement('div')] - The parent node to render the template into.
 * @returns {Promise<T>} A promise that resolves to the rendered LitElement.
 */
export async function fixture<T extends LitElement>(
  template: TemplateResult,
  parentNode: HTMLElement = document.createElement('div')
): Promise<T> {
  const wrapper = fixtureWrapper(parentNode);
  render(template, wrapper);

  const element = wrapper.firstElementChild as T;
  await element.updateComplete;

  return element;
}

const mockBindings = () =>
  ({
    i18n: i18next.createInstance(),
  }) as Bindings;

@customElement('test-interface-element')
export class TestInterfaceElement extends LitElement {
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

const commerceEngineConfig: CommerceEngineConfiguration =
  getSampleCommerceEngineConfiguration();
describe('AtomicCommerceInterface', () => {
  let element: AtomicCommerceInterface;
  let interfaceElement: TestInterfaceElement;

  const setupElement = async () => {
    element = await fixture<AtomicCommerceInterface>(
      html` <atomic-commerce-interface></atomic-commerce-interface>`
    );

    interfaceElement = document.createElement(
      'test-interface-element'
    ) as TestInterfaceElement;
    element.appendChild(interfaceElement);

    await element.updateComplete;
  };

  beforeEach(async () => {
    await setupElement();
    console.log(element.initializeWithEngine);
    await element.initialize(commerceEngineConfig);
  });

  const teardownElement = async () => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  afterEach(async () => {
    await teardownElement();
  });

  test('should initialize with default properties', () => {
    expect(element.type).toBe('search');
    expect(element.analytics).toBe(true);
    expect(element.reflectStateInUrl).toBe(true);
    expect(element.scrollContainer).toBe('atomic-commerce-interface');
    expect(element.languageAssetsPath).toBe('/lang');
    expect(element.iconAssetsPath).toBe('/assets');
  });

  test('should initialize engine with given options', async () => {
    await element.initialize(commerceEngineConfig);
    expect(element.engine).toBeTruthy();
  });

  describe('when initialized', () => {
    beforeEach(async () => {
      await element.initialize(commerceEngineConfig);
      await element.executeFirstRequest();
    });

    test('should render the component', async () => {
      expect(element.shadowRoot).toBeTruthy();
      const text = 'Search';
      expect(text).toBeTruthy();
    });

    test('should update language when language property changes', async () => {
      element.language = 'fr';
      await element.updateComplete;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context = (element as any).context;
      expect(context.state.language).toBe('fr');
    });

    test('should update icon assets path when iconAssetsPath property changes', async () => {
      element.iconAssetsPath = '/new-assets';
      await element.updateComplete;
      expect(element.store.state.iconAssetsPath).toBe('/new-assets');
    });
  });
});
