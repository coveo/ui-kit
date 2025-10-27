import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {initializeEventName} from '@/src/utils/initialization-lit-stencil-common-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicExternal} from './atomic-external';
import './atomic-external';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-external', () => {
  let mockInterface: HTMLElement;

  beforeEach(() => {
    mockInterface = document.createElement('atomic-search-interface');
    document.body.appendChild(mockInterface);
  });

  const renderComponent = async ({
    props = {},
    slottedContent,
  }: {
    props?: Partial<{selector: string}>;
    slottedContent?: string;
  } = {}) => {
    const element = await fixture<AtomicExternal>(html`
      <atomic-external selector=${ifDefined(props.selector)}>
        ${slottedContent ? html`<div>${slottedContent}</div>` : ''}
      </atomic-external>
    `);

    await element.updateComplete;

    return {
      element,
      get slot() {
        return element.shadowRoot?.querySelector('slot');
      },
    };
  };

  describe('#connectedCallback', () => {
    it('should use default selector when not specified', async () => {
      const {element} = await renderComponent();
      expect(element.selector).toBe('atomic-search-interface');
    });

    it('should find interface by default selector', async () => {
      const {element} = await renderComponent();
      expect(element.boundInterface).toBeDefined();
      expect(element.boundInterface?.tagName.toLowerCase()).toBe(
        'atomic-search-interface'
      );
    });

    it('should use custom selector when specified', async () => {
      const customSelector = '#custom-interface';

      const customInterface = document.createElement('div');
      customInterface.setAttribute('id', 'custom-interface');
      document.body.appendChild(customInterface);

      const {element} = await renderComponent({
        props: {selector: customSelector},
      });

      expect(element.selector).toBe(customSelector);
      expect(element.boundInterface).toBe(customInterface);
    });

    it('should add event listeners', async () => {
      const addEventListenerSpy = vi.spyOn(
        HTMLElement.prototype,
        'addEventListener'
      );

      await renderComponent();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'atomic/initializeComponent',
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'atomic/scrollToTop',
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'atomic/parentReady',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });
  });

  describe('#disconnectedCallback', () => {
    it('should remove event listeners', async () => {
      const {element} = await renderComponent();

      const removeEventListenerSpy = vi.spyOn(
        HTMLElement.prototype,
        'removeEventListener'
      );

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/initializeComponent',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/scrollToTop',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/parentReady',
        expect.any(Function)
      );
    });
  });

  describe('when atomic/initializeComponent event is dispatched', () => {
    it('should forward initialization event to interface', async () => {
      const {element} = await renderComponent();
      element.boundInterface = mockInterface;

      const dispatchSpy = vi.spyOn(mockInterface, 'dispatchEvent');
      const mockHandler = vi.fn();
      const initEvent = new CustomEvent('atomic/initializeComponent', {
        detail: mockHandler,
        bubbles: true,
      });

      element.dispatchEvent(initEvent);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: initializeEventName,
        })
      );

      dispatchSpy.mockRestore();
    });

    it('should prevent default and stop propagation of initialization event', async () => {
      const {element} = await renderComponent();
      element.boundInterface = mockInterface;

      const initEvent = new CustomEvent('atomic/initializeComponent', {
        detail: vi.fn(),
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(initEvent, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(initEvent, 'stopPropagation');

      element.dispatchEvent(initEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('when atomic/scrollToTop event is dispatched', () => {
    it('should forward scrollToTop event to interface', async () => {
      const {element} = await renderComponent();
      element.boundInterface = mockInterface;

      const dispatchSpy = vi.spyOn(mockInterface, 'dispatchEvent');
      const scrollEvent = new CustomEvent('atomic/scrollToTop', {
        detail: {scrollTop: 0},
        bubbles: true,
      });

      element.dispatchEvent(scrollEvent);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'atomic/scrollToTop',
        })
      );

      dispatchSpy.mockRestore();
    });

    it('should prevent default and stop propagation of scrollToTop event', async () => {
      const {element} = await renderComponent();
      element.boundInterface = mockInterface;

      const scrollEvent = new CustomEvent('atomic/scrollToTop', {
        detail: {scrollTop: 0},
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(scrollEvent, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(scrollEvent, 'stopPropagation');

      element.dispatchEvent(scrollEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should forward event detail to interface', async () => {
      const {element} = await renderComponent();
      element.boundInterface = mockInterface;

      const scrollDetail = {scrollTop: 100};
      let capturedEventDetail: {scrollTop: number} | null = null;

      mockInterface.addEventListener('atomic/scrollToTop', ((
        e: CustomEvent<{scrollTop: number}>
      ) => {
        capturedEventDetail = e.detail;
      }) as EventListener);

      const scrollEvent = new CustomEvent('atomic/scrollToTop', {
        detail: scrollDetail,
        bubbles: true,
      });

      element.dispatchEvent(scrollEvent);

      expect(capturedEventDetail).not.toBeNull();
      expect(capturedEventDetail).toEqual(scrollDetail);
    });
  });

  describe('when atomic/parentReady event is dispatched', () => {
    it('should sync bindings when parent interface is ready', async () => {
      const mockBindings = {
        engine: {},
        i18n: {},
        store: {},
      };

      const {element} = await renderComponent();

      // Set bindings on the bound interface after component is connected
      (
        element.boundInterface as HTMLElement & {bindings: typeof mockBindings}
      ).bindings = mockBindings;

      // Verify boundInterface is set correctly
      expect(element.boundInterface).toStrictEqual(mockInterface);

      const parentReadyEvent = new CustomEvent('atomic/parentReady', {
        bubbles: true,
      });

      Object.defineProperty(parentReadyEvent, 'target', {
        writable: false,
        value: element.boundInterface,
      });

      element.boundInterface?.dispatchEvent(parentReadyEvent);
      await element.updateComplete;

      expect(element.bindings).toEqual(mockBindings);
    });

    it('should not sync bindings when event target is not the bound interface', async () => {
      const {element} = await renderComponent();
      element.boundInterface = mockInterface;

      const otherInterface = document.createElement('div') as HTMLElement & {
        bindings?: typeof mockBindings;
      };
      const mockBindings = {
        engine: {},
        i18n: {},
        store: {},
      };
      otherInterface.bindings = mockBindings;

      const parentReadyEvent = new CustomEvent('atomic/parentReady', {
        bubbles: true,
      });

      Object.defineProperty(parentReadyEvent, 'target', {
        writable: false,
        value: otherInterface,
      });

      mockInterface.dispatchEvent(parentReadyEvent);

      expect(element.bindings).not.toEqual(mockBindings);
    });
  });

  it('should render atomic-component-error when interface is not found', async () => {
    const {element} = await renderComponent({
      props: {selector: '#non-existent-interface'},
    });

    const errorComponent = element.shadowRoot?.querySelector(
      'atomic-component-error'
    );
    expect(errorComponent).toBeDefined();
  });
});
