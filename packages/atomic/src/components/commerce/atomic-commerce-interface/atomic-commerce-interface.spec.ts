import {Bindings} from '@/src/components';
import {bindings} from '@/src/decorators/bindings';
import {InitializableComponent} from '@/src/decorators/types';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {fixtureCleanup} from '@/vitest-utils/testing-helpers/fixture-wrapper';
import {
  CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {within} from 'shadow-dom-testing-library';
import {describe, test, expect, vi} from 'vitest';
import {InitializeBindingsMixin} from '../../../mixins/bindings-mixin';
import {AtomicCommerceInterface} from './atomic-commerce-interface';

@customElement('test-element')
@bindings()
export class TestElement
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  @state()
  public bindings: Bindings = {} as Bindings;
  @state() public error!: Error;

  public initialized = false;

  public render() {
    return html`Child Element Content`;
  }

  initialize = vi.fn();
}

const commerceEngineConfig: CommerceEngineConfiguration =
  getSampleCommerceEngineConfiguration();
describe('AtomicCommerceInterface', () => {
  let element: AtomicCommerceInterface;
  let childElement: InitializableComponent<Bindings> & LitElement;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  const addChildElement = async <T extends LitElement>(
    tag = 'test-element'
  ) => {
    childElement = document.createElement(
      tag
    ) as InitializableComponent<Bindings> & T;
    element.appendChild(childElement);

    await childElement.updateComplete;
    expect(childElement).toBeInstanceOf(TestElement);
  };

  const setupElement = async () => {
    element = await fixture<AtomicCommerceInterface>(
      html` <atomic-commerce-interface>test</atomic-commerce-interface>`
    );

    await element.updateComplete;
    expect(element).toBeInstanceOf(AtomicCommerceInterface);
  };

  beforeEach(async () => {
    await setupElement();
    consoleErrorSpy = vi.spyOn(console, 'error');
  });

  afterEach(async () => {
    fixtureCleanup();
    consoleErrorSpy.mockRestore();
  });

  test('should initialize engine with given options', async () => {
    await element.initialize(commerceEngineConfig);
    expect(element.engine).toBeTruthy();
    expect(element.engine?.configuration.organizationId).toBe(
      commerceEngineConfig.organizationId
    );
    expect(element.engine?.configuration.analytics.trackingId).toBe(
      commerceEngineConfig.analytics.trackingId
    );
  });

  describe('when initialized', () => {
    beforeEach(async () => {
      await element.initialize(commerceEngineConfig);
      await addChildElement();

      await element.executeFirstRequest();
    });

    test('should render the component and its children', async () => {
      expect(element.shadowRoot).toBeTruthy();
      expect(
        within(element).queryByShadowText('Child Element Content')
      ).toBeTruthy();
    });

    test('should trigger the initialize method of the child component', async () => {
      expect(childElement.initialize).toHaveBeenCalledOnce();
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
