import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
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

  describe('when rendering', () => {
    it('should render successfully', async () => {
      const {element} = await renderIPXBody();
      await expect.element(element).toBeInTheDocument();
    });

    it('should display all structural parts', async () => {
      const {parts} = await renderIPXBody();
      expect(parts.container).toBeTruthy();
      expect(parts.headerWrapper).toBeTruthy();
      expect(parts.header).toBeTruthy();
      expect(parts.headerRuler).toBeTruthy();
      expect(parts.bodyWrapper).toBeTruthy();
      expect(parts.body).toBeTruthy();
      expect(parts.footerWrapper).toBeTruthy();
      expect(parts.footer).toBeTruthy();
    });
  });

  it('should have displayFooterSlot true by default', async () => {
    const {element} = await renderIPXBody();
    expect(element.displayFooterSlot).toBe(true);
  });

  it('should not apply visibility class to container when isOpen is undefined (embedded mode)', async () => {
    const {parts} = await renderIPXBody();
    const container = parts.container as HTMLElement;
    expect(container.className).not.toContain('visible');
    expect(container.className).not.toContain('invisible');
  });

  it('should apply visible class to container when isOpen is true', async () => {
    const {parts} = await renderIPXBody({isOpen: true});
    const container = parts.container as HTMLElement;
    expect(container.className).toContain('visible');
  });

  it('should apply invisible class to container when isOpen is false', async () => {
    const {parts} = await renderIPXBody({isOpen: false});
    const container = parts.container as HTMLElement;
    expect(container.className).toContain('invisible');
  });

  it('should not render footer parts when displayFooterSlot is false', async () => {
    const {parts} = await renderIPXBody({displayFooterSlot: false});
    expect(parts.footerWrapper).toBeFalsy();
    expect(parts.footer).toBeFalsy();
  });

  describe('when properties change', () => {
    it('should update visibility class when isOpen changes from false to true', async () => {
      const {element, parts} = await renderIPXBody({isOpen: false});
      const container = parts.container as HTMLElement;
      expect(container.className).toBe('invisible');

      element.isOpen = true;
      await element.updateComplete;

      expect(container.className).toBe('visible');
    });

    it('should update visibility class when isOpen changes from true to false', async () => {
      const {element, parts} = await renderIPXBody({isOpen: true});
      const container = parts.container as HTMLElement;
      expect(container.className).toBe('visible');

      element.isOpen = false;
      await element.updateComplete;

      expect(container.className).toBe('invisible');
    });

    it('should update visibility class when isOpen changes to undefined (embedded mode)', async () => {
      const {element, parts} = await renderIPXBody({isOpen: true});
      const container = parts.container as HTMLElement;
      expect(container.className).toContain('visible');

      element.isOpen = undefined;
      await element.updateComplete;

      expect(container.className).not.toContain('visible');
      expect(container.className).not.toContain('invisible');
    });

    it('should hide footer when displayFooterSlot changes to false', async () => {
      const {element, parts} = await renderIPXBody({displayFooterSlot: true});
      expect(parts.footerWrapper).toBeTruthy();
      expect(parts.footer).toBeTruthy();

      element.displayFooterSlot = false;
      await element.updateComplete;

      // Re-query the parts after update
      const updatedFooterWrapper = element.shadowRoot?.querySelector(
        '[part="footer-wrapper"]'
      );
      const updatedFooter =
        element.shadowRoot?.querySelector('[part="footer"]');
      expect(updatedFooterWrapper).toBeFalsy();
      expect(updatedFooter).toBeFalsy();
    });

    it('should show footer when displayFooterSlot changes to true', async () => {
      const {element, parts} = await renderIPXBody({displayFooterSlot: false});
      expect(parts.footerWrapper).toBeFalsy();

      element.displayFooterSlot = true;
      await element.updateComplete;

      // Re-query the parts after update
      const updatedFooterWrapper = element.shadowRoot?.querySelector(
        '[part="footer-wrapper"]'
      );
      const updatedFooter =
        element.shadowRoot?.querySelector('[part="footer"]');
      expect(updatedFooterWrapper).toBeTruthy();
      expect(updatedFooter).toBeTruthy();
    });
  });

  it('should generate a random ID when not provided', async () => {
    const {element} = await renderIPXBody();
    expect(element.id).toMatch(/^atomic-ipx-body-/);
  });

  it('should not overwrite user-provided ID', async () => {
    const customId = 'my-custom-ipx-body';
    const element = await fixture<AtomicIpxBody>(html`
        <atomic-ipx-body id="${customId}"></atomic-ipx-body>
      `);
    expect(element.id).toBe(customId);
  });

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

  it('should emit an animationEnded custom event with bubbles and composed set to true when animationend is dispatched', async () => {
    const eventSpy = vi.fn();
    const {element} = await renderIPXBody();
    element.addEventListener('animationEnded', eventSpy);

    const container = element.shadowRoot?.querySelector('[part="container"]');
    container?.dispatchEvent(new Event('animationend', {bubbles: true}));

    expect(eventSpy).toHaveBeenCalledOnce();

    const emittedEvent = eventSpy.mock.calls[0][0];
    expect(emittedEvent.bubbles).toBe(true);
    expect(emittedEvent.composed).toBe(true);
  });
});
