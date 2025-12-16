import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import type {AtomicInsightTabs} from './atomic-insight-tabs';
import './atomic-insight-tabs';

vi.mock('@/src/components/common/atomic-tab-bar/atomic-tab-bar', {spy: true});

// Mock atomic-tab-popover to prevent errors
class MockTabPopover extends HTMLElement {
  async toggle() {}
  async setButtonVisibility(_isVisible: boolean) {}
  async closePopoverOnFocusOut(_event: FocusEvent) {}
}

beforeAll(() => {
  if (!customElements.get('atomic-tab-popover')) {
    customElements.define('atomic-tab-popover', MockTabPopover);
  }
});

describe('atomic-insight-tabs', () => {
  const renderInsightTabs = async ({
    slottedContent,
  }: {
    slottedContent?: ReturnType<typeof html>;
  } = {}) => {
    const {element} = await renderInAtomicInsightInterface<AtomicInsightTabs>({
      template: html`
        <atomic-insight-tabs>
          ${
            slottedContent ??
            html`<div class="test-tab">Default Tab Content</div>`
          }
        </atomic-insight-tabs>
      `,
      selector: 'atomic-insight-tabs',
    });

    return {
      element,
      tabBar: element.querySelector('atomic-tab-bar'),
    };
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-insight-tabs');
    expect(el).toBeInstanceOf(HTMLElement);
  });

  describe('when rendering with valid props', () => {
    it('should render successfully', async () => {
      const {element} = await renderInsightTabs();
      expect(element).toBeInTheDocument();
    });

    it('should render atomic-tab-bar', async () => {
      const {tabBar} = await renderInsightTabs();
      expect(tabBar).toBeDefined();
      expect(tabBar?.tagName.toLowerCase()).toBe('atomic-tab-bar');
    });

    it('should pass slotted content to atomic-tab-bar', async () => {
      const {element} = await renderInsightTabs({
        slottedContent: html`<div class="custom-tab">Custom Tab</div>`,
      });

      const customTab = element.querySelector('.custom-tab');
      expect(customTab).toBeTruthy();
      expect(customTab?.textContent).toBe('Custom Tab');
      expect(customTab?.classList.contains('custom-tab')).toBe(true);
    });
  });

  describe('when initializing', () => {
    it('should initialize without errors', async () => {
      const {element} = await renderInsightTabs();
      expect(element.error).toBeUndefined();
    });

    it('should have bindings after initialization', async () => {
      const {element} = await renderInsightTabs();
      expect(element.bindings).toBeDefined();
    });
  });
});
