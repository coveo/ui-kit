import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicIpxEmbedded} from './atomic-ipx-embedded';
import './atomic-ipx-embedded';

vi.mock('@/src/utils/replace-breakpoint-utils.js', () => ({
  updateBreakpoints: vi.fn(),
}));

describe('atomic-ipx-embedded', () => {
  const renderEmbedded = async ({
    container,
    slottedContent,
  }: {
    container?: HTMLElement;
    slottedContent?: string;
  } = {}) => {
    const element = await fixture<AtomicIpxEmbedded>(html`
      <atomic-ipx-embedded .container=${container}>
        ${
          slottedContent
            ? html`<div slot="header">Header</div>
              <div slot="body">Body</div>
              <div slot="footer">Footer</div>`
            : ''
        }
      </atomic-ipx-embedded>
    `);

    return {
      element,
      parts: (el: AtomicIpxEmbedded) => ({
        backdrop: el.shadowRoot?.querySelector('[part="backdrop"]'),
        container: el.shadowRoot?.querySelector('[part="container"]'),
      }),
    };
  };

  describe('when initializing', () => {
    it('should generate an ID if not provided', async () => {
      const {element} = await renderEmbedded();
      expect(element.id).toBeTruthy();
      expect(element.id).toMatch(/^atomic-ipx-embedded-/);
    });

    it('should preserve existing ID if provided', async () => {
      const element = await fixture<AtomicIpxEmbedded>(html`
        <atomic-ipx-embedded id="custom-id"></atomic-ipx-embedded>
      `);
      expect(element.id).toBe('custom-id');
    });
  });

  describe('when rendering', () => {
    it('should render successfully', async () => {
      const {element} = await renderEmbedded();
      expect(element).toBeInTheDocument();
    });

    it('should render backdrop part', async () => {
      const {element, parts} = await renderEmbedded();
      expect(parts(element).backdrop).toBeTruthy();
    });

    it('should render ipx-body container', async () => {
      const {element, parts} = await renderEmbedded();
      expect(parts(element).container).toBeTruthy();
    });

    it('should render footer wrapper when footer slot has content', async () => {
      const {element} = await renderEmbedded({slottedContent: 'yes'});
      const footerWrapper = element.shadowRoot?.querySelector(
        '[part="footer-wrapper"]'
      );
      expect(footerWrapper).toBeTruthy();
    });
  });

  describe('when setting container prop', () => {
    it('should accept a container element', async () => {
      const container = document.createElement('div');
      const {element} = await renderEmbedded({container});
      expect(element.container).toBe(container);
    });

    it('should render successfully without a container', async () => {
      const {element} = await renderEmbedded();
      expect(element).toBeInTheDocument();
    });
  });

  describe('when checking footer slot', () => {
    it('should render footer wrapper when footer slot has content', async () => {
      const element = await fixture<AtomicIpxEmbedded>(html`
        <atomic-ipx-embedded>
          <div slot="footer">Footer content</div>
        </atomic-ipx-embedded>
      `);
      const footerWrapper = element.shadowRoot?.querySelector(
        '[part="footer-wrapper"]'
      );
      expect(footerWrapper).toBeTruthy();
    });

    it('should not render footer wrapper when footer slot is empty', async () => {
      const element = await fixture<AtomicIpxEmbedded>(html`
        <atomic-ipx-embedded></atomic-ipx-embedded>
      `);
      const footerWrapper = element.shadowRoot?.querySelector(
        '[part="footer-wrapper"]'
      );
      expect(footerWrapper).toBeFalsy();
    });
  });

  describe('when calling updateBreakpoints', () => {
    let updateBreakpointsSpy: MockInstance;

    beforeEach(async () => {
      const module = await import('@/src/utils/replace-breakpoint-utils.js');
      updateBreakpointsSpy = vi.mocked(module.updateBreakpoints);
      updateBreakpointsSpy.mockClear();
    });

    it('should call updateBreakpoints on render', async () => {
      await renderEmbedded();
      expect(updateBreakpointsSpy).toHaveBeenCalled();
    });

    it('should call updateBreakpoints only once due to once() wrapper', async () => {
      const {element} = await renderEmbedded();
      updateBreakpointsSpy.mockClear();

      element.requestUpdate();
      await element.updateComplete;

      expect(updateBreakpointsSpy).not.toHaveBeenCalled();
    });
  });

  describe('when using slots', () => {
    it('should support header slot', async () => {
      const element = await fixture<AtomicIpxEmbedded>(html`
        <atomic-ipx-embedded>
          <div slot="header" id="test-header">Header</div>
        </atomic-ipx-embedded>
      `);
      const headerSlot = element.querySelector('[slot="header"]');
      expect(headerSlot?.textContent).toBe('Header');
    });

    it('should support body slot', async () => {
      const element = await fixture<AtomicIpxEmbedded>(html`
        <atomic-ipx-embedded>
          <div slot="body" id="test-body">Body</div>
        </atomic-ipx-embedded>
      `);
      const bodySlot = element.querySelector('[slot="body"]');
      expect(bodySlot?.textContent).toBe('Body');
    });

    it('should support footer slot', async () => {
      const element = await fixture<AtomicIpxEmbedded>(html`
        <atomic-ipx-embedded>
          <div slot="footer" id="test-footer">Footer</div>
        </atomic-ipx-embedded>
      `);
      const footerSlot = element.querySelector('[slot="footer"]');
      expect(footerSlot?.textContent).toBe('Footer');
    });
  });
});
