import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {updateBreakpoints} from '@/src/utils/replace-breakpoint-utils';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {AtomicModal} from './atomic-modal';
import './atomic-modal';
import '@/src/components/common/atomic-component-error/atomic-component-error';

vi.mock('@coveo/headless', {spy: true});
vi.mock('@/src/utils/replace-breakpoint-utils', {spy: true});
vi.mock('@/src/mixins/bindings-mixin', () => ({
  InitializeBindingsMixin: vi.fn().mockImplementation((superClass) => {
    return class extends superClass {
      // biome-ignore lint/complexity/noUselessConstructor: <mocking the mixin for testing>
      constructor(...args: unknown[]) {
        super(...args);
      }
    };
  }),
}));

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
  const mockedEngine = buildFakeSearchEngine();
  beforeEach(async () => {
    console.error = vi.fn();
  });

  const renderModal = async (
    options: {
      isOpen?: boolean;
      fullscreen?: boolean;
      boundary?: 'page' | 'element';
      source?: HTMLElement;
      scope?: HTMLElement;
      container?: HTMLElement;
      headerContent?: string;
      bodyContent?: string;
      footerContent?: string;
      close?: () => void;
    } = {}
  ) => {
    const {element} = await renderInAtomicSearchInterface<AtomicModal>({
      template: html`<atomic-modal
        .isOpen=${options.isOpen ?? false}
        .fullscreen=${options.fullscreen ?? false}
        .boundary=${options.boundary ?? 'page'}
        .source=${options.source}
        .container=${options.container}
        .scope=${options.scope}
        .close=${options.close}
      >
        <div slot="header">${options.headerContent ?? 'Modal Header'}</div>
        <div slot="body">${options.bodyContent ?? 'Modal Body Content'}</div>
        <div slot="footer">${options.footerContent ?? 'Modal Footer'}</div>
      </atomic-modal>`,
      selector: 'atomic-modal',
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        return bindings;
      },
    });

    return {
      element,
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
    };
  };

  describe('#constructor (when created)', () => {
    it('should create an AtomicModal instance', () => {
      const element = document.createElement('atomic-modal');

      expect(element).toBeInstanceOf(AtomicModal);
    });
  });

  describe('#connectedCallback (when added to the DOM)', () => {
    it('should add a "keyup" event listener to the document body', async () => {
      const addEventListenerSpy = vi.spyOn(document.body, 'addEventListener');

      await renderModal();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keyup',
        expect.any(Function)
      );
    });

    describe('when a "keyup" event is dispatched with the "Escape" key', () => {
      it('should dispatch a "close" custom event when isOpen is true', async () => {
        const {element} = await renderModal({isOpen: true});
        const closeEventSpy = vi.fn();
        element.addEventListener('close', closeEventSpy);

        await userEvent.keyboard('{Escape}');

        expect(closeEventSpy).toHaveBeenCalledOnce();
      });

      it('should not dispatch a "close" custom event when isOpen is false', async () => {
        const {element} = await renderModal({isOpen: false});
        const closeEventSpy = vi.fn();
        element.addEventListener('close', closeEventSpy);

        await userEvent.keyboard('{Escape}');

        expect(closeEventSpy).not.toHaveBeenCalled();
      });

      it('should call the close function when provided', async () => {
        const closeSpy = vi.fn();
        await renderModal({close: closeSpy});

        await userEvent.keyboard('{Escape}');

        expect(closeSpy).toHaveBeenCalledOnce();
      });

      it('should set isOpen to false', async () => {
        const {element} = await renderModal({isOpen: true});
        expect(element.isOpen).toBe(true);

        await userEvent.keyboard('{Escape}');

        expect(element.isOpen).toBe(false);
      });
    });

    it('should add a "touchmove" event listener to the document body', async () => {
      const addEventListenerSpy = vi.spyOn(document.body, 'addEventListener');

      await renderModal({isOpen: false});

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'touchmove',
        expect.any(Function),
        {passive: false}
      );
    });

    describe('when a "touchmove" event is dispatched', () => {
      it('should call preventDefault on the event when isOpen is true', async () => {
        await renderModal({isOpen: true});
        const touchEvent = new Event('touchmove');
        const preventDefaultSpy = vi.spyOn(touchEvent, 'preventDefault');

        document.body.dispatchEvent(touchEvent);

        expect(preventDefaultSpy).toHaveBeenCalledOnce();
      });

      it('should not call preventDefault on the event when isOpen is false', async () => {
        await renderModal({isOpen: false});
        const touchEvent = new Event('touchmove');
        const preventDefaultSpy = vi.spyOn(touchEvent, 'preventDefault');

        document.body.dispatchEvent(touchEvent);

        expect(preventDefaultSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('#render (when rendering)', () => {
    it('should call the updateBreakpoints util upon the first render only', async () => {
      const {element} = await renderModal();

      expect(updateBreakpoints).toHaveBeenCalledOnce();

      element.requestUpdate();
      await element.updateComplete;

      expect(updateBreakpoints).toHaveBeenCalledOnce();
    });

    it('should not render when isOpen is false', async () => {
      const {element, parts} = await renderModal({isOpen: false});

      expect(parts(element).backdrop).toBeFalsy();
      expect(parts(element).container).toBeFalsy();
      const focusTrap = element.shadowRoot?.querySelector('atomic-focus-trap');
      expect(focusTrap).toBeFalsy();
    });

    describe('when isOpen is true', async () => {
      it('should render a backdrop with the correct part', async () => {
        const {element, parts} = await renderModal({
          isOpen: true,
        });

        expect(parts(element).backdrop).toBeTruthy();
        expect(parts(element).backdrop?.getAttribute('part')).toBe('backdrop');
      });

      it('should apply the "fixed" class to the backdrop when boundary is "page"', async () => {
        const {element, parts} = await renderModal({
          isOpen: true,
          boundary: 'page',
        });

        const backdrop = parts(element).backdrop;
        expect(backdrop?.classList.contains('fixed')).toBe(true);
      });

      it('should apply the "absolute" class to the backdrop when boundary is "element"', async () => {
        const {element, parts} = await renderModal({
          isOpen: true,
          boundary: 'element',
        });

        const backdrop = parts(element).backdrop;
        expect(backdrop?.classList.contains('absolute')).toBe(true);
      });

      it('should call the close function when the backdrop is clicked', async () => {
        const closeSpy = vi.fn();
        const {element, parts} = await renderModal({
          isOpen: true,
          close: closeSpy,
        });

        const backdrop = parts(element).backdrop;
        expect(backdrop).toBeTruthy();

        await userEvent.click(backdrop!);

        expect(closeSpy).toHaveBeenCalledOnce();
      });

      it('should render an atomic-focus-trap with the correct ARIA attributes', async () => {
        const {element} = await renderModal({isOpen: true});

        const focusTrap =
          element.shadowRoot?.querySelector('atomic-focus-trap');
        expect(focusTrap?.getAttribute('role')).toBe('dialog');
        expect(focusTrap?.getAttribute('aria-modal')).toBe('true');
        expect(focusTrap?.getAttribute('aria-labelledby')).toContain(
          'atomic-modal-header-'
        );
      });

      it('should render atomic-focus-trap with the correct source when specified', async () => {
        const sourceElement = document.createElement('button');
        const {element} = await renderModal({
          isOpen: true,
          source: sourceElement,
        });

        const focusTrap =
          element.shadowRoot?.querySelector('atomic-focus-trap');
        expect(focusTrap?.source).toBe(sourceElement);
      });

      it('should render atomic-focus-trap with the correct container when specified', async () => {
        const containerElement = document.createElement('div');
        const {element} = await renderModal({
          isOpen: true,
          container: containerElement,
        });

        const focusTrap =
          element.shadowRoot?.querySelector('atomic-focus-trap');
        expect(focusTrap?.container).toBe(containerElement);
      });

      it('should render atomic-focus-trap with the element when container is not specified', async () => {
        const {element} = await renderModal({
          isOpen: true,
        });

        const focusTrap =
          element.shadowRoot?.querySelector('atomic-focus-trap');
        expect(focusTrap?.container).toBe(element);
      });

      it('should render atomic-focus-trap with the correct scope when specified', async () => {
        const scopeElement = document.createElement('div');
        const {element} = await renderModal({
          isOpen: true,
          scope: scopeElement,
        });

        const focusTrap =
          element.shadowRoot?.querySelector('atomic-focus-trap');
        expect(focusTrap?.scope).toBe(scopeElement);
      });
    });

    it('should render a container with the correct part', async () => {
      const {element, parts} = await renderModal({
        isOpen: true,
      });

      expect(parts(element).container).toBeTruthy();
      expect(parts(element).container?.getAttribute('part')).toBe('container');
    });

    it('should render the container with the "animate-close" class when isOpen goes from true to false', async () => {
      const {element, parts} = await renderModal({
        isOpen: true,
      });

      element.isOpen = false;
      await element.updateComplete;

      expect(parts(element).container?.classList).not.toContain('animate-open');
      expect(parts(element).container?.classList).toContain('animate-close');
    });

    it('should render the container with the "animate-open" class when isOpen goes from false to true', async () => {
      const {element, parts} = await renderModal({
        isOpen: false,
      });

      element.isOpen = true;
      await element.updateComplete;

      expect(parts(element).container?.classList).not.toContain(
        'animate-close'
      );
      expect(parts(element).container?.classList).toContain('animate-open');
    });

    it('should render a header wrapper with the correct part', async () => {
      const {element, parts} = await renderModal({
        isOpen: true,
      });

      expect(parts(element).headerWrapper).toBeTruthy();
      expect(parts(element).headerWrapper?.getAttribute('part')).toBe(
        'header-wrapper'
      );
    });

    it('should render a header with the correct part', async () => {
      const {element, parts} = await renderModal({
        isOpen: true,
      });

      expect(parts(element).header).toBeTruthy();
      expect(parts(element).header?.getAttribute('part')).toBe('header');
    });

    it('should render a header ruler with the correct part', async () => {
      const {element, parts} = await renderModal({
        isOpen: true,
      });

      expect(parts(element).headerRuler).toBeTruthy();
      expect(parts(element).headerRuler?.getAttribute('part')).toBe(
        'header-ruler'
      );
    });

    it('should render a body wrapper with the correct part', async () => {
      const {element, parts} = await renderModal({
        isOpen: true,
      });

      expect(parts(element).bodyWrapper).toBeTruthy();
      expect(parts(element).bodyWrapper?.getAttribute('part')).toBe(
        'body-wrapper'
      );
    });

    it('should render a body with the correct part', async () => {
      const {element, parts} = await renderModal({
        isOpen: true,
      });

      expect(parts(element).body).toBeTruthy();
      expect(parts(element).body?.getAttribute('part')).toBe('body');
    });

    it('should call preventDefault when a touchmove event is dispatched on the body', async () => {
      await renderModal({isOpen: true});

      const touchEvent = new Event('touchmove');
      const preventDefaultSpy = vi.spyOn(touchEvent, 'preventDefault');

      document.body.dispatchEvent(touchEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should render a footer wrapper with the correct part', async () => {
      const {element, parts} = await renderModal({
        isOpen: true,
      });

      expect(parts(element).footerWrapper).toBeTruthy();
      expect(parts(element).footerWrapper?.getAttribute('part')).toBe(
        'footer-wrapper'
      );
    });

    it('should render slotted content', async () => {
      const {element} = await renderModal({
        isOpen: true,
        headerContent: 'Test Header',
        bodyContent: 'Test Body',
        footerContent: 'Test Footer',
      });

      const headerSlot = element.querySelector('[slot="header"]');
      const bodySlot = element.querySelector('[slot="body"]');
      const footerSlot = element.querySelector('[slot="footer"]');

      expect(headerSlot?.textContent).toBe('Test Header');
      expect(bodySlot?.textContent).toBe('Test Body');
      expect(footerSlot?.textContent).toBe('Test Footer');
    });

    it('should render an atomic-component-error when error occurs', async () => {
      const {element} = await renderModal({isOpen: true});
      element.initialize();
      element.error = new Error('Test error');

      await element.updateComplete;
      const errorComponent = element.shadowRoot?.querySelector(
        'atomic-component-error'
      );

      expect(errorComponent).toBeTruthy();
    });
  });

  describe('#disconnectedCallback (when removed from the DOM)', () => {
    it('should remove the keyup event listener from the document body', async () => {
      const {element} = await renderModal({isOpen: true});
      const removeEventListenerSpy = vi.spyOn(
        document.body,
        'removeEventListener'
      );

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keyup',
        expect.any(Function)
      );
    });

    it('should remove the touchmove event listener from the document body', async () => {
      const {element} = await renderModal({isOpen: true});
      const removeEventListenerSpy = vi.spyOn(
        document.body,
        'removeEventListener'
      );

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'touchmove',
        expect.any(Function)
      );
    });
  });

  describe('#initialize', () => {
    describe('when isOpen is true', () => {
      it('should add the "atomic-modal-opened" class to the body', async () => {
        const {element} = await renderModal({isOpen: true});

        element.initialize();

        expect(document.body.className).toContain('atomic-modal-opened');
      });

      it('should add the "atomic-modal-opened" class to the interface element', async () => {
        const {element} = await renderModal({isOpen: true});

        element.initialize();

        expect(element.bindings.interfaceElement.className).toContain(
          'atomic-modal-opened'
        );
      });
    });
  });

  describe('#watchToggleOpen (when isOpen changes after the first update)', () => {
    let element: AtomicModal;

    beforeEach(async () => {
      ({element} = await renderModal({isOpen: true}));
    });

    describe('when isOpen goes from false to true', () => {
      it('should add the "atomic-modal-opened" class to the body', async () => {
        element.isOpen = false;
        await element.updateComplete;
        expect(document.body.className).not.toContain('atomic-modal-opened');

        element.isOpen = true;
        await element.updateComplete;

        expect(document.body.className).toContain('atomic-modal-opened');
      });

      it('should add the "atomic-modal-opened" class to the interface element', async () => {
        element.isOpen = false;
        await element.updateComplete;
        expect(element.bindings.interfaceElement.className).not.toContain(
          'atomic-modal-opened'
        );

        element.isOpen = true;
        await element.updateComplete;

        expect(element.bindings.interfaceElement.className).toContain(
          'atomic-modal-opened'
        );
      });
    });

    describe('when isOpen goes from true to false', () => {
      it('should remove the "atomic-modal-opened" class from the body', async () => {
        element.isOpen = true;
        await element.updateComplete;
        expect(document.body.className).toContain('atomic-modal-opened');

        element.isOpen = false;
        await element.updateComplete;

        expect(document.body.className).not.toContain('atomic-modal-opened');
      });

      it('should remove the "atomic-modal-opened" class from the interface element', async () => {
        element.isOpen = true;
        await element.updateComplete;
        expect(element.bindings.interfaceElement.className).toContain(
          'atomic-modal-opened'
        );

        element.isOpen = false;
        await element.updateComplete;

        expect(element.bindings.interfaceElement.className).not.toContain(
          'atomic-modal-opened'
        );
      });
    });
  });
});
