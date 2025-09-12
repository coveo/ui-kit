import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AtomicModal} from './atomic-modal';
import './atomic-modal';
import '../atomic-component-error/atomic-component-error';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';

// Mock atomic-focus-trap as a simple custom element
class MockAtomicFocusTrap extends HTMLElement {
  active = false;

  constructor() {
    super();
    this.innerHTML = '<slot></slot>';
  }

  connectedCallback() {
    this.setAttribute('role', 'dialog');
    if (!this.hasAttribute('aria-modal')) {
      this.setAttribute('aria-modal', this.active ? 'true' : 'false');
    }
  }

  static get observedAttributes() {
    return ['aria-modal'];
  }
}

if (!customElements.get('atomic-focus-trap')) {
  customElements.define('atomic-focus-trap', MockAtomicFocusTrap);
}

describe('atomic-modal', () => {
  beforeEach(async () => {
    console.error = vi.fn();
  });

  const renderModal = async (
    options: {
      isOpen?: boolean;
      fullscreen?: boolean;
      boundary?: 'page' | 'element';
      source?: HTMLElement;
      container?: HTMLElement;
      headerContent?: string;
      bodyContent?: string;
      footerContent?: string;
    } = {}
  ) => {
    const {element} = await renderInAtomicSearchInterface<AtomicModal>({
      template: html`<atomic-modal
        .isOpen=${options.isOpen ?? false}
        .fullscreen=${options.fullscreen ?? false}
        .boundary=${options.boundary ?? 'page'}
        .source=${options.source}
        .container=${options.container}
      >
        <div slot="header">${options.headerContent ?? 'Modal Header'}</div>
        <div slot="body">${options.bodyContent ?? 'Modal Body Content'}</div>
        <div slot="footer">${options.footerContent ?? 'Modal Footer'}</div>
      </atomic-modal>`,
      selector: 'atomic-modal',
      bindings: (bindings) => {
        return bindings;
      },
    });

    return {
      element,
      backdrop(element: HTMLElement) {
        return element.shadowRoot;
      },
      parts: (element: AtomicModal) => {
        const qs = (part: string) =>
          element?.shadowRoot?.querySelector(`[part="${part}"]`);
        return {
          backdrop: qs('backdrop'),
          container: qs('container'),
          headerWrapper: qs('header-wrapper'),
          header: qs('header'),
          headerRuler: qs('header-ruler'),
          bodyWrapper: qs('body-wrapper'),
          body: qs('body'),
          footerWrapper: qs('footer-wrapper'),
          footer: qs('footer'),
        };
      },
      locators: {
        backdrop: () => page.getByRole('dialog'),
        dialog: () => page.getByRole('dialog'),
      },
    };
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-modal');
    expect(el).toBeInstanceOf(AtomicModal);
  });

  it('should not render when #isOpen is false', async () => {
    const {element, parts} = await renderModal({isOpen: false});

    element.initialize();

    const backdrop = parts(element).backdrop;
    expect(backdrop).toBeNull();
  });

  it('should render when #isOpen is true', async () => {
    const {element, parts} = await renderModal({isOpen: true});

    element.initialize();

    expect(parts(element).backdrop).toBeTruthy();
    expect(parts(element).container).toBeTruthy();
  });

  it('should render slotted content', async () => {
    const {element} = await renderModal({
      isOpen: true,
      headerContent: 'Test Header',
      bodyContent: 'Test Body',
      footerContent: 'Test Footer',
    });

    element.initialize();
    await element.updateComplete;

    const headerSlot = element.querySelector('[slot="header"]');
    const bodySlot = element.querySelector('[slot="body"]');
    const footerSlot = element.querySelector('[slot="footer"]');

    expect(headerSlot?.textContent).toBe('Test Header');
    expect(bodySlot?.textContent).toBe('Test Body');
    expect(footerSlot?.textContent).toBe('Test Footer');
  });

  describe('#initialize', () => {
    it('should handle modal opening during initialization', async () => {
      const {element} = await renderModal({isOpen: true});

      element.initialize();

      expect(element.className).toContain('open');
    });

    it('should update host classes correctly', async () => {
      const {element} = await renderModal({isOpen: true, fullscreen: true});

      element.initialize();

      expect(element.className).toContain('open');
      expect(element.className).toContain('fullscreen');
    });
  });

  describe('when #fullscreen is true', () => {
    it('should apply fullscreen class', async () => {
      const {element} = await renderModal({isOpen: true, fullscreen: true});

      expect(element.className).toContain('fullscreen');
      expect(element.className).not.toContain('dialog');
    });
  });

  describe('when #fullscreen is false', () => {
    it('should apply dialog class', async () => {
      const {element} = await renderModal({isOpen: true, fullscreen: false});

      expect(element.className).toContain('dialog');
      expect(element.className).not.toContain('fullscreen');
    });
  });

  describe('when #boundary is page', () => {
    it('should apply fixed positioning to backdrop', async () => {
      const {element, parts} = await renderModal({
        isOpen: true,
        boundary: 'page',
      });

      element.initialize();
      await element.updateComplete;

      const backdrop = parts(element).backdrop;
      expect(backdrop?.classList.contains('fixed')).toBe(true);
    });
  });

  describe('when #boundary is element', () => {
    it('should apply absolute positioning to backdrop', async () => {
      const {element, parts} = await renderModal({
        isOpen: true,
        boundary: 'element',
      });

      element.initialize();
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));
      await element.updateComplete;

      const backdrop = parts(element).backdrop;
      expect(backdrop?.classList.contains('absolute')).toBe(true);
    });
  });

  it('should close modal when escape key is pressed', async () => {
    const {element} = await renderModal({isOpen: true});

    expect(element.isOpen).toBe(true);

    // Simulate escape key press
    const event = new KeyboardEvent('keyup', {key: 'Escape'});
    document.body.dispatchEvent(event);

    expect(element.isOpen).toBe(false);
  });

  it('should emit close event when escape key is pressed', async () => {
    const {element} = await renderModal({isOpen: true});
    const closeEventSpy = vi.fn();
    element.addEventListener('close', closeEventSpy);

    // Simulate escape key press
    const event = new KeyboardEvent('keyup', {key: 'Escape'});
    document.body.dispatchEvent(event);

    expect(closeEventSpy).toHaveBeenCalled();
  });

  it('should call close function when provided', async () => {
    const closeFn = vi.fn();
    const {element} = await renderModal({isOpen: true});
    element.close = closeFn;

    // Simulate escape key press
    const event = new KeyboardEvent('keyup', {key: 'Escape'});
    document.body.dispatchEvent(event);

    expect(closeFn).toHaveBeenCalled();
  });

  it('should add and remove modal classes from body and interface element', async () => {
    const mockInterfaceElement = document.createElement('div');
    const {element} = await renderModal({isOpen: false});

    // Mock bindings
    element.bindings = {
      interfaceElement: mockInterfaceElement,
    } as unknown as typeof element.bindings;

    element.isOpen = true;

    await element.updateComplete;
    await element.updateComplete;

    expect(document.body.classList.contains('atomic-modal-opened')).toBe(true);
    expect(mockInterfaceElement.classList.contains('atomic-modal-opened')).toBe(
      true
    );

    // Close modal
    element.isOpen = false;
    await element.updateComplete;

    expect(document.body.classList.contains('atomic-modal-opened')).toBe(false);
    expect(mockInterfaceElement.classList.contains('atomic-modal-opened')).toBe(
      false
    );
  });

  it('should handle touchmove events when modal is open', async () => {
    await renderModal({isOpen: true});

    const touchEvent = new Event('touchmove');
    const preventDefaultSpy = vi.spyOn(touchEvent, 'preventDefault');

    document.body.dispatchEvent(touchEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should render with correct ARIA attributes', async () => {
    const {element} = await renderModal({isOpen: true});

    element.initialize();
    await element.updateComplete;

    await new Promise((resolve) => setTimeout(resolve, 0));
    await element.updateComplete;

    const focusTrap = element.shadowRoot?.querySelector('atomic-focus-trap');
    expect(focusTrap?.getAttribute('role')).toBe('dialog');
    expect(focusTrap?.getAttribute('aria-modal')).toBe('true');
  });

  it('should handle modal property changes', async () => {
    const {element} = await renderModal({isOpen: false});

    expect(element.className).not.toContain('open');

    element.isOpen = true;
    await element.updateComplete;

    expect(element.className).toContain('open');
  });

  it('should render error component when error occurs', async () => {
    const {element} = await renderModal({isOpen: true});

    element.initialize();

    element.error = new Error('Test error');
    await element.updateComplete;

    const errorComponent = element.shadowRoot?.querySelector(
      'atomic-component-error'
    );
    expect(errorComponent).toBeTruthy();
  });

  describe('#disconnectedCallback', () => {
    it('should remove event listeners when component is disconnected', async () => {
      const {element} = await renderModal({isOpen: true});

      const removeEventListenerSpy = vi.spyOn(
        document.body,
        'removeEventListener'
      );

      element.disconnectedCallback();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keyup',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'touchmove',
        expect.any(Function)
      );
    });
  });
});
