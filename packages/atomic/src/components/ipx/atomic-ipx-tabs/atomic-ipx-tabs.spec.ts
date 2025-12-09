import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import type {AtomicIPXTabs} from './atomic-ipx-tabs';

describe('atomic-ipx-tabs', () => {
  const renderComponent = async ({slottedContent = ''} = {}) => {
    const {element} = await renderInAtomicSearchInterface<AtomicIPXTabs>({
      template: html`<atomic-ipx-tabs>${slottedContent}</atomic-ipx-tabs>`,
      selector: 'atomic-ipx-tabs',
    });

    return {
      element,
      tabBar: element.shadowRoot?.querySelector('atomic-tab-bar'),
    };
  };

  describe('rendering', () => {
    it('should render atomic-tab-bar', async () => {
      const {tabBar} = await renderComponent();
      expect(tabBar).toBeTruthy();
    });

    it('should render slot for child elements', async () => {
      const {element} = await renderComponent({
        slottedContent: '<div id="test-content">Test Content</div>',
      });

      const slotElement = element.shadowRoot?.querySelector('slot');
      expect(slotElement).toBeTruthy();
    });

    it('should pass slotted content to atomic-tab-bar', async () => {
      const testContent = '<div class="test-tab">Tab 1</div>';
      const {element} = await renderComponent({
        slottedContent: testContent,
      });

      await page.waitForTimeout(100);
      const assignedElements = element.querySelector('.test-tab');
      expect(assignedElements).toBeTruthy();
    });
  });

  describe('initialization', () => {
    it('should initialize without errors', async () => {
      const {element} = await renderComponent();
      expect(element.error).toBeUndefined();
    });

    it('should have bindings after initialization', async () => {
      const {element} = await renderComponent();
      expect(element.bindings).toBeDefined();
      expect(element.bindings.engine).toBeDefined();
    });
  });
});
