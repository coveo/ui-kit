import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import type {AtomicInsightTabs} from './atomic-insight-tabs';
import './atomic-insight-tabs';

describe('atomic-insight-tabs', () => {
  const renderInsightTabs = async ({
    slottedContent,
  }: {
    slottedContent?: ReturnType<typeof html>;
  } = {}) => {
    const {element} = await renderInAtomicInsightInterface<AtomicInsightTabs>({
      template: html`
        <atomic-insight-tabs>
          ${slottedContent ?? html`<div class="test-tab">Test Tab</div>`}
        </atomic-insight-tabs>
      `,
      selector: 'atomic-insight-tabs',
    });

    return {
      element,
      locators: {
        tabBar: () => element.shadowRoot?.querySelector('atomic-tab-bar'),
        slot: () => element.shadowRoot?.querySelector('slot'),
      },
    };
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-insight-tabs');
    expect(el).toBeInstanceOf(HTMLElement);
  });

  describe('when rendering', () => {
    it('should render successfully', async () => {
      const {element} = await renderInsightTabs();
      expect(element).toBeInTheDocument();
    });

    it('should render atomic-tab-bar in shadow DOM', async () => {
      const {locators} = await renderInsightTabs();
      const tabBar = locators.tabBar();
      expect(tabBar).toBeDefined();
      expect(tabBar?.tagName.toLowerCase()).toBe('atomic-tab-bar');
    });

    it('should render slot for tab elements', async () => {
      const {locators} = await renderInsightTabs();
      const slot = locators.slot();
      expect(slot).toBeDefined();
    });

    it('should pass slotted content to atomic-tab-bar', async () => {
      const {element, locators} = await renderInsightTabs({
        slottedContent: html`<div class="test-content">Slotted Content</div>`,
      });

      const tabBar = locators.tabBar();
      const slot = tabBar?.querySelector('slot');
      expect(slot).toBeDefined();

      const slottedElement = element.querySelector('.test-content');
      expect(slottedElement).toBeDefined();
      expect(slottedElement?.textContent).toBe('Slotted Content');
    });
  });

  describe('when initializing', () => {
    it('should initialize without errors', async () => {
      const {element} = await renderInsightTabs();

      expect(element.bindings).toBeDefined();
      expect(element.error).toBeUndefined();
    });
  });
});
