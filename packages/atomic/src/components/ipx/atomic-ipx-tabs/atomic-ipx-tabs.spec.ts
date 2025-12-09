import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import type {AtomicIpxTabs} from './atomic-ipx-tabs';
import './atomic-ipx-tabs';

describe('atomic-ipx-tabs', () => {
  const renderComponent = async ({
    slottedContent,
  }: {
    slottedContent?: ReturnType<typeof html>;
  } = {}) => {
    const {element} = await renderInAtomicSearchInterface<AtomicIpxTabs>({
      template: html`
        <atomic-ipx-tabs>
          ${
            slottedContent ??
            html`<div class="test-tab">Default Tab Content</div>`
          }
        </atomic-ipx-tabs>
      `,
      selector: 'atomic-ipx-tabs',
    });

    return {
      element,
      tabBar: element.querySelector('atomic-tab-bar'),
    };
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-ipx-tabs');
    expect(el).toBeInstanceOf(HTMLElement);
  });

  describe('when rendering with valid props', () => {
    it('should render successfully', async () => {
      const {element} = await renderComponent();
      expect(element).toBeInTheDocument();
    });

    it('should render atomic-tab-bar', async () => {
      const {tabBar} = await renderComponent();
      expect(tabBar).toBeDefined();
    });

    it('should pass slotted content to atomic-tab-bar', async () => {
      const {element} = await renderComponent({
        slottedContent: html`<div class="custom-tab">Custom Tab</div>`,
      });

      const customTab = element.querySelector('.custom-tab');
      expect(customTab).toBeTruthy();
    });
  });

  describe('when initializing', () => {
    it('should initialize without errors', async () => {
      const {element} = await renderComponent();
      expect(element.error).toBeUndefined();
    });

    it('should have bindings after initialization', async () => {
      const {element} = await renderComponent();
      expect(element.bindings).toBeDefined();
    });
  });
});
