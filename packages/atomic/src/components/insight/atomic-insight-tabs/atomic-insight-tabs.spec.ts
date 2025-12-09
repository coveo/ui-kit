import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture.js';
import type {AtomicInsightTabs} from './atomic-insight-tabs.js';
import './atomic-insight-tabs.js';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-tabs', () => {
  const renderComponent = async ({slottedContent = ''} = {}) => {
    const element = await fixture<AtomicInsightTabs>(
      html`<atomic-insight-tabs>${unsafeHTML(slottedContent)}</atomic-insight-tabs>`
    );

    // Mock the bindings
    element.bindings = {
      engine: {} as never,
      i18n: {} as never,
      store: {} as never,
      interfaceElement: {} as never,
      createStyleElement: vi.fn(),
      createScriptElement: vi.fn(),
    };

    // Initialize the component
    element.initialize();

    await element.updateComplete;

    return {
      element,
      getTabBar: () => element.shadowRoot?.querySelector('atomic-tab-bar'),
    };
  };

  beforeEach(() => {
    // No setup needed
  });

  describe('#initialize', () => {
    it('should initialize without errors', async () => {
      const {element} = await renderComponent();

      expect(element.bindings).toBeDefined();
      expect(element.error).toBeUndefined();
    });
  });

  describe('rendering', () => {
    it('should render atomic-tab-bar in shadow DOM', async () => {
      const {getTabBar} = await renderComponent();

      const tabBar = getTabBar();
      expect(tabBar).toBeTruthy();
      expect(tabBar?.tagName.toLowerCase()).toBe('atomic-tab-bar');
    });

    it('should render slot for tab elements', async () => {
      const {element} = await renderComponent({
        slottedContent: '<div class="test-tab">Test Tab</div>',
      });

      const slottedElement = element.querySelector('.test-tab');
      expect(slottedElement).toBeTruthy();
      expect(slottedElement?.textContent).toBe('Test Tab');
    });

    it('should pass slotted content to atomic-tab-bar', async () => {
      const {element, getTabBar} = await renderComponent({
        slottedContent: '<div class="test-content">Slotted Content</div>',
      });

      const tabBar = getTabBar();
      const slot = tabBar?.querySelector('slot');
      expect(slot).toBeTruthy();

      const slottedElement = element.querySelector('.test-content');
      expect(slottedElement).toBeTruthy();
    });
  });
});
