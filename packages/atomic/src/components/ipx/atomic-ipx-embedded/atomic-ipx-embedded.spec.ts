import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import type {AtomicIpxEmbedded} from './atomic-ipx-embedded';
import './atomic-ipx-embedded';

vi.mock('@/src/utils/replace-breakpoint-utils.js', () => ({
  updateBreakpoints: vi.fn(),
}));

describe('atomic-ipx-embedded', () => {
  const renderEmbedded = async ({
    id,
    container,
    slots,
  }: {
    id?: string;
    container?: HTMLElement;
    slots?: {
      header?: string;
      body?: string;
      footer?: string;
    };
  } = {}) => {
    const {element} = await renderInAtomicSearchInterface<AtomicIpxEmbedded>({
      template: html`
        <atomic-ipx-embedded id=${id ?? ''} .container=${container}>
          ${slots?.header ? html`<div slot="header">${slots.header}</div>` : ''}
          ${slots?.body ? html`<div slot="body">${slots.body}</div>` : ''}
          ${slots?.footer ? html`<div slot="footer">${slots.footer}</div>` : ''}
        </atomic-ipx-embedded>
      `,
      selector: 'atomic-ipx-embedded',
    });

    return {
      element,
      parts: (el: AtomicIpxEmbedded) => ({
        backdrop: el.shadowRoot?.querySelector('[part="backdrop"]'),
        container: el.shadowRoot?.querySelector('[part="container"]'),
        footerWrapper: el.shadowRoot?.querySelector('[part="footer-wrapper"]'),
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
      const {element} = await renderEmbedded({id: 'custom-id'});
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
      const {element, parts} = await renderEmbedded({
        slots: {footer: 'Footer'},
      });
      expect(parts(element).footerWrapper).toBeTruthy();
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
      const {element, parts} = await renderEmbedded({
        slots: {footer: 'Footer content'},
      });
      expect(parts(element).footerWrapper).toBeTruthy();
    });

    it('should not render footer wrapper when footer slot is empty', async () => {
      const {element, parts} = await renderEmbedded();
      expect(parts(element).footerWrapper).toBeFalsy();
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
      const {element} = await renderEmbedded({slots: {header: 'Header'}});
      const headerSlot = element.querySelector('[slot="header"]');
      expect(headerSlot?.textContent).toBe('Header');
    });

    it('should support body slot', async () => {
      const {element} = await renderEmbedded({slots: {body: 'Body'}});
      const bodySlot = element.querySelector('[slot="body"]');
      expect(bodySlot?.textContent).toBe('Body');
    });

    it('should support footer slot', async () => {
      const {element} = await renderEmbedded({slots: {footer: 'Footer'}});
      const footerSlot = element.querySelector('[slot="footer"]');
      expect(footerSlot?.textContent).toBe('Footer');
    });
  });
});
