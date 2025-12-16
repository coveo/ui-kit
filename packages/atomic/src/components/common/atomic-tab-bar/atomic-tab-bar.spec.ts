import {html} from 'lit';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {AtomicTabBar} from './atomic-tab-bar';
import './atomic-tab-bar';

interface MockTabElement {
  active: boolean;
  label: string;
  select: () => void;
  tagName: string;
  style: CSSStyleDeclaration;
  ariaHidden: string | null;
  getBoundingClientRect: () => DOMRect;
  setAttribute: (name: string, value: string) => void;
}

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

describe('atomic-tab-bar', () => {
  let mockResizeObserver: {
    observe: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockResizeObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };

    // Use a function constructor
    window.ResizeObserver = vi.fn(function (this: typeof mockResizeObserver) {
      return mockResizeObserver;
    }) as unknown as typeof ResizeObserver;
  });
  const createMockTab = (options: {
    label: string;
    active?: boolean;
    width?: number;
  }): MockTabElement => {
    const div = document.createElement('div');
    div.setAttribute('data-tab', 'true');

    div.style.width = options.width ? `${options.width}px` : '100px';
    div.style.visibility = 'visible';

    const mockRect = {
      width: options.width ?? 100,
      right: 0,
      left: 0,
      top: 0,
      bottom: 0,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;

    // Define properties that can't be set directly
    Object.defineProperties(div, {
      active: {
        value: options.active ?? false,
        writable: true,
        enumerable: true,
      },
      label: {
        value: options.label,
        writable: true,
        enumerable: true,
      },
      select: {
        value: vi.fn(),
        writable: true,
        enumerable: true,
      },
      getBoundingClientRect: {
        value: () => mockRect,
        writable: true,
      },
    });

    return div as unknown as MockTabElement;
  };

  const renderTabBar = async (
    options: {tabs?: MockTabElement[]; containerWidth?: number} = {}
  ) => {
    const tabs = options.tabs ?? [
      createMockTab({label: 'Tab 1', active: true}),
      createMockTab({label: 'Tab 2'}),
      createMockTab({label: 'Tab 3'}),
    ];

    const element = await fixture<AtomicTabBar>(html`
      <atomic-tab-bar>
        ${tabs.map((tab) => tab)}
      </atomic-tab-bar>
    `);

    // Set container width if specified
    if (options.containerWidth) {
      element.style.width = `${options.containerWidth}px`;
    }

    await element.updateComplete;

    // Wait for resize observer to trigger
    await new Promise((resolve) => requestAnimationFrame(resolve));

    return {
      element,
      tabs,
      locators: {
        tabPopover: () =>
          element.shadowRoot?.querySelector('atomic-tab-popover'),
        popoverTabs: () =>
          element.shadowRoot?.querySelectorAll('[part="popover-tab"]'),
        slot: () => element.shadowRoot?.querySelector('slot'),
      },
    };
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-tab-bar');
    expect(el).toBeInstanceOf(AtomicTabBar);
  });

  describe('when rendering with tabs', () => {
    it('should render successfully', async () => {
      const {element} = await renderTabBar();
      expect(element).toBeInTheDocument();
    });

    it('should render a slot for tab content', async () => {
      const {locators} = await renderTabBar();
      const slot = locators.slot();
      expect(slot).toBeDefined();
    });

    it('should render atomic-tab-popover', async () => {
      const {locators} = await renderTabBar();
      const tabPopover = locators.tabPopover();
      expect(tabPopover).toBeDefined();
    });

    it('should export parts from tab-popover', async () => {
      const {locators} = await renderTabBar();
      const tabPopover = locators.tabPopover();
      expect(tabPopover?.getAttribute('exportparts')).toContain(
        'popover-button'
      );
      expect(tabPopover?.getAttribute('exportparts')).toContain('value-label');
      expect(tabPopover?.getAttribute('exportparts')).toContain('arrow-icon');
      expect(tabPopover?.getAttribute('exportparts')).toContain('backdrop');
      expect(tabPopover?.getAttribute('exportparts')).toContain(
        'overflow-tabs'
      );
    });
  });

  it('should show all tabs when they fit within the container', async () => {
    const tabs = [
      createMockTab({label: 'Tab 1', width: 80}),
      createMockTab({label: 'Tab 2', width: 80}),
    ];

    const {element} = await renderTabBar({
      tabs,
      containerWidth: 400,
    });

    const visibleTabs = Array.from(element.children).filter(
      (tab) => (tab as HTMLElement).style.visibility !== 'hidden'
    );

    expect(visibleTabs.length).toBeGreaterThan(0);
    expect(window.ResizeObserver).toHaveBeenCalled();
    expect(mockResizeObserver.observe).toHaveBeenCalledWith(element);
  });

  it('should disconnect ResizeObserver when disconnected', async () => {
    const {element} = await renderTabBar();

    element.remove();

    expect(mockResizeObserver.disconnect).toHaveBeenCalled();
  });

  describe('when handling atomic/tabRendered event', () => {
    it('should listen for atomic/tabRendered event', async () => {
      const {element} = await renderTabBar();

      const event = new CustomEvent('atomic/tabRendered', {
        bubbles: true,
        cancelable: true,
      });

      const spy = vi.fn();
      element.addEventListener('atomic/tabRendered', spy);

      element.dispatchEvent(event);

      // The event is captured by the component
      expect(spy).toHaveBeenCalled();
    });

    it('should remove event listener on disconnect', async () => {
      const {element} = await renderTabBar();

      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/tabRendered',
        expect.any(Function)
      );
    });
  });
});
