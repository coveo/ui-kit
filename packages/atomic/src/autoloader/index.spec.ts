import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {registerAutoloader} from './index';

const mockCustomElementsRegistry = new Map<string, CustomElementConstructor>();

const mockCustomElements = {
  define: vi.fn((name: string, constructorFn: CustomElementConstructor) => {
    mockCustomElementsRegistry.set(name, constructorFn);
  }),
  get: vi.fn((name: string) => mockCustomElementsRegistry.get(name)),
  whenDefined: vi.fn((name: string) => {
    const constructorFn = mockCustomElementsRegistry.get(name);
    return constructorFn
      ? Promise.resolve(constructorFn)
      : new Promise(() => {});
  }),
  upgrade: vi.fn(),
};

class XTestComponent extends HTMLElement {}
class XTestComponentInside extends HTMLElement {}

vi.mock('@/src/components/lazy-index.js', () => ({
  __esModule: true,
  default: {
    'x-test-component': async () => {
      customElements.define('x-test-component', XTestComponent);
    },
    'x-test-component-inside': async () => {
      customElements.define('x-test-component-inside', XTestComponentInside);
    },
  },
}));

describe('autoloader', () => {
  beforeAll(() => {
    vi.stubGlobal('customElements', mockCustomElements);
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('#registerAutoloader', () => {
    const waitForNextTick = () => vi.runAllTimersAsync();

    const setupComponent = async (elementFactory: () => HTMLElement) => {
      const element = elementFactory();
      document.body.appendChild(element);
      registerAutoloader();
      await waitForNextTick();
      return element;
    };

    beforeEach(() => {
      mockCustomElementsRegistry.clear();
      document.body.innerHTML = '';
    });

    it('should register components when added to DOM', async () => {
      await setupComponent(() => document.createElement('x-test-component'));
      expect(customElements.get('x-test-component')).toBeDefined();
    });

    it('should discover components in template content', async () => {
      const template = document.createElement('template');
      template.innerHTML = '<x-test-component></x-test-component>';
      await setupComponent(() => template);
      expect(customElements.get('x-test-component')).toBeDefined();
    });

    it('should discover nested components', async () => {
      await setupComponent(() => {
        const container = document.createElement('div');
        container.innerHTML = `
          <div>
            <x-test-component></x-test-component>
            <template>
              <x-test-component-inside></x-test-component-inside>
            </template>
          </div>
        `;
        return container;
      });

      expect(customElements.get('x-test-component')).toBeDefined();
      expect(customElements.get('x-test-component-inside')).toBeDefined();
    });

    it('should register components when dynamically added to DOM', async () => {
      registerAutoloader();

      const element = document.createElement('div');
      element.innerHTML = '<x-test-component></x-test-component>';

      document.body.appendChild(element);
      await waitForNextTick();

      expect(customElements.get('x-test-component')).toBeDefined();
    });

    it('should handle components inside templates within shadow DOM', async () => {
      await setupComponent(() => {
        const element = document.createElement('x-test-component');
        element.attachShadow({mode: 'open'});
        const template = document.createElement('template');
        template.innerHTML =
          '<x-test-component-inside>test</x-test-component-inside>';

        element.shadowRoot!.appendChild(template);
        return element;
      });

      expect(customElements.get('x-test-component-inside')).toBeDefined();
    });

    it('should handle components in shadow roots with hydration', async () => {
      const el = await setupComponent(() =>
        document.createElement('test-component')
      );

      el.attachShadow({mode: 'open'});
      await waitForNextTick();

      el.shadowRoot!.innerHTML = '<x-test-component></x-test-component>';
      el.classList.add('hydrated');
      await waitForNextTick();

      const childElement = el?.querySelector('x-test-component') as HTMLElement;
      expect(childElement).toBeDefined();
      expect(customElements.get('x-test-component')).toBeDefined();
    });

    it('should upgrade custom elements on root', async () => {
      const upgradeSpy = vi.spyOn(customElements, 'upgrade');

      await setupComponent(() => document.createElement('div'));
      expect(upgradeSpy).toHaveBeenCalled();
    });
  });
});
