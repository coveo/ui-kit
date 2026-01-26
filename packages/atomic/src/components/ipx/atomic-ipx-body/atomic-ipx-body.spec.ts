import {html} from 'lit';
import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicIpxBody} from './atomic-ipx-body';
import './atomic-ipx-body';

describe('atomic-ipx-body', () => {
  const parts = (element: AtomicIpxBody) => {
    const qs = (part: string) =>
      element.shadowRoot?.querySelector(`[part="${part}"]`);
    return {
      container: qs('container'),
      headerWrapper: qs('header-wrapper'),
      header: qs('header'),
      headerRuler: qs('header-ruler'),
      bodyWrapper: qs('body-wrapper'),
      body: qs('body'),
      footerWrapper: qs('footer-wrapper'),
      footer: qs('footer'),
    };
  };

  const renderIPXBody = async ({
    isOpen,
    displayFooterSlot = true,
    headerContent,
    bodyContent,
    footerContent,
  }: {
    isOpen?: boolean;
    displayFooterSlot?: boolean;
    headerContent?: string;
    bodyContent?: string;
    footerContent?: string;
  } = {}) => {
    const element = await fixture<AtomicIpxBody>(html`
      <atomic-ipx-body
        .isOpen=${isOpen}
        .displayFooterSlot=${displayFooterSlot}
      >
        ${
          headerContent
            ? html`<div slot="header">${headerContent}</div>`
            : html``
        }
        ${bodyContent ? html`<div slot="body">${bodyContent}</div>` : html``}
        ${
          footerContent
            ? html`<div slot="footer">${footerContent}</div>`
            : html``
        }
      </atomic-ipx-body>
    `);

    return {
      element,
      parts: parts(element),
    };
  };

  describe('when rendering with default props', () => {
    it('should render successfully', async () => {
      const {element} = await renderIPXBody();
      await expect.element(element).toBeInTheDocument();
    });

    it('should render the container part', async () => {
      const {parts} = await renderIPXBody();
      expect(parts.container).toBeTruthy();
    });

    it('should render the header wrapper part', async () => {
      const {parts} = await renderIPXBody();
      expect(parts.headerWrapper).toBeTruthy();
    });

    it('should render the header part', async () => {
      const {parts} = await renderIPXBody();
      expect(parts.header).toBeTruthy();
    });

    it('should render the header ruler part', async () => {
      const {parts} = await renderIPXBody();
      expect(parts.headerRuler).toBeTruthy();
    });

    it('should render the body wrapper part', async () => {
      const {parts} = await renderIPXBody();
      expect(parts.bodyWrapper).toBeTruthy();
    });

    it('should render the body part', async () => {
      const {parts} = await renderIPXBody();
      expect(parts.body).toBeTruthy();
    });

    it('should render the footer wrapper part by default', async () => {
      const {parts} = await renderIPXBody();
      expect(parts.footerWrapper).toBeTruthy();
    });

    it('should render the footer part by default', async () => {
      const {parts} = await renderIPXBody();
      expect(parts.footer).toBeTruthy();
    });

    it('should have displayFooterSlot true by default', async () => {
      const {element} = await renderIPXBody();
      expect(element.displayFooterSlot).toBe(true);
    });

    it('should remove displayFooterSlot attribute when false', async () => {
      const {element} = await renderIPXBody({displayFooterSlot: false});
      expect(element.hasAttribute('display-footer-slot')).toBe(false);
    });

    it('should generate a random ID when not provided', async () => {
      const {element} = await renderIPXBody();
      expect(element.id).toMatch(/^atomic-ipx-body-/);
    });
  });

  describe('when isOpen is undefined (embedded mode)', () => {
    it('should not apply visibility class to container', async () => {
      const {parts} = await renderIPXBody();
      const container = parts.container as HTMLElement;
      expect(container.className).not.toContain('visible');
      expect(container.className).not.toContain('invisible');
    });
  });

  describe('when isOpen is true', () => {
    it('should apply visible class to container', async () => {
      const {parts} = await renderIPXBody({isOpen: true});
      const container = parts.container as HTMLElement;
      expect(container.className).toContain('visible');
    });
  });

  describe('when isOpen is false', () => {
    it('should apply invisible class to container', async () => {
      const {parts} = await renderIPXBody({isOpen: false});
      const container = parts.container as HTMLElement;
      expect(container.className).toContain('invisible');
    });
  });

  describe('when displayFooterSlot is false', () => {
    it('should not render the footer wrapper', async () => {
      const {parts} = await renderIPXBody({displayFooterSlot: false});
      expect(parts.footerWrapper).toBeFalsy();
    });

    it('should not render the footer', async () => {
      const {parts} = await renderIPXBody({displayFooterSlot: false});
      expect(parts.footer).toBeFalsy();
    });
  });

  describe('slot content', () => {
    it('should render slotted header content', async () => {
      const headerText = 'Header Title';
      const {element} = await renderIPXBody({headerContent: headerText});
      const headerSlot = element.querySelector('[slot="header"]');
      expect(headerSlot?.textContent).toBe(headerText);
    });

    it('should render slotted body content', async () => {
      const bodyText = 'Body Content';
      const {element} = await renderIPXBody({bodyContent: bodyText});
      const bodySlot = element.querySelector('[slot="body"]');
      expect(bodySlot?.textContent).toBe(bodyText);
    });

    it('should render slotted footer content', async () => {
      const footerText = 'Footer Content';
      const {element} = await renderIPXBody({footerContent: footerText});
      const footerSlot = element.querySelector('[slot="footer"]');
      expect(footerSlot?.textContent).toBe(footerText);
    });
  });

  describe('animationEnded event', () => {
    let eventSpy: Mock<EventListener>;

    beforeEach(() => {
      eventSpy = vi.fn();
    });

    it('should emit animationEnded event when animation ends', async () => {
      const {element} = await renderIPXBody();
      element.addEventListener('animationEnded', eventSpy);

      const container = element.shadowRoot?.querySelector('[part="container"]');
      container?.dispatchEvent(new Event('animationend', {bubbles: true}));

      expect(eventSpy).toHaveBeenCalledOnce();
    });

    it('should emit an event that bubbles', async () => {
      const {element} = await renderIPXBody();
      element.addEventListener('animationEnded', eventSpy);

      const container = element.shadowRoot?.querySelector('[part="container"]');
      container?.dispatchEvent(new Event('animationend', {bubbles: true}));

      const emittedEvent = eventSpy.mock.calls[0][0];
      expect(emittedEvent.bubbles).toBe(true);
    });

    it('should emit an event that is composed', async () => {
      const {element} = await renderIPXBody();
      element.addEventListener('animationEnded', eventSpy as EventListener);

      const container = element.shadowRoot?.querySelector('[part="container"]');
      container?.dispatchEvent(new Event('animationend', {bubbles: true}));

      const emittedEvent = eventSpy.mock.calls[0][0];
      expect(emittedEvent.composed).toBe(true);
    });
  });
});
