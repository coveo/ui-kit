import {buildSearchStatus} from '@coveo/headless';
import {html, type TemplateResult} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import type {AtomicSegmentedFacetScrollable} from './atomic-segmented-facet-scrollable';
import './atomic-segmented-facet-scrollable';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-segmented-facet-scrollable', () => {
  const mockedEngine = buildFakeSearchEngine();

  const renderComponent = async (
    options: {children?: TemplateResult} = {
      children: html`
        <atomic-segmented-facet field="author"></atomic-segmented-facet>
        <atomic-segmented-facet field="language"></atomic-segmented-facet>
      `,
    }
  ) => {
    const {element, atomicInterface} =
      await renderInAtomicSearchInterface<AtomicSegmentedFacetScrollable>({
        template: html`<atomic-segmented-facet-scrollable>
          ${options.children}
          </atomic-segmented-facet-scrollable>`,
        selector: 'atomic-segmented-facet-scrollable',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    await atomicInterface.updateComplete;
    await element.updateComplete;

    const parts = {
      get scrollableContainer() {
        return element.shadowRoot?.querySelector(
          '[part="scrollable-container"]'
        );
      },
      get horizontalScroll() {
        return element.shadowRoot?.querySelector('[part="horizontal-scroll"]');
      },
      get leftArrowWrapper() {
        return element.shadowRoot?.querySelector('[part="left-arrow-wrapper"]');
      },
      get rightArrowWrapper() {
        return element.shadowRoot?.querySelector(
          '[part="right-arrow-wrapper"]'
        );
      },
      get leftArrowButton() {
        return element.shadowRoot?.querySelector(
          '[part="left-arrow-button"]'
        ) as HTMLButtonElement | null;
      },
      get rightArrowButton() {
        return element.shadowRoot?.querySelector(
          '[part="right-arrow-button"]'
        ) as HTMLButtonElement | null;
      },
      get leftArrowIcon() {
        return element.shadowRoot?.querySelector('[part="left-arrow-icon"]');
      },
      get rightArrowIcon() {
        return element.shadowRoot?.querySelector('[part="right-arrow-icon"]');
      },
      get leftFade() {
        return element.shadowRoot?.querySelector('[part="left-fade"]');
      },
      get rightFade() {
        return element.shadowRoot?.querySelector('[part="right-fade"]');
      },
    };

    return {element, parts, atomicInterface};
  };

  beforeEach(() => {
    vi.mocked(buildSearchStatus).mockImplementation(() =>
      buildFakeSearchStatus({
        hasError: false,
      })
    );
  });

  describe('#initialize', () => {
    it('should build the SearchStatus controller', async () => {
      await renderComponent();

      expect(vi.mocked(buildSearchStatus)).toHaveBeenCalledWith(mockedEngine);
    });
  });

  describe('#connectedCallback', () => {
    it('should add event listeners when connected', async () => {
      const {element} = await renderComponent();
      const addEventListenerSpy = vi.spyOn(element, 'addEventListener');

      element.connectedCallback();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'wheel',
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'touchmove',
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });
  });

  describe('#disconnectedCallback', () => {
    it('should remove event listeners when disconnected', async () => {
      const {element} = await renderComponent();
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.disconnectedCallback();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'wheel',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'touchmove',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });

    it('should disconnect ResizeObserver when disconnected', async () => {
      const {element} = await renderComponent();

      await element.updateComplete;

      const disconnectSpy = vi.spyOn(ResizeObserver.prototype, 'disconnect');

      element.disconnectedCallback();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('#firstUpdated', () => {
    it('should create a ResizeObserver', async () => {
      const observeSpy = vi.spyOn(ResizeObserver.prototype, 'observe');
      await renderComponent();

      expect(observeSpy).toHaveBeenCalled();
    });

    it('should observe all child elements', async () => {
      const observeSpy = vi.spyOn(ResizeObserver.prototype, 'observe');
      const {element} = await renderComponent({
        children: html`
          <atomic-segmented-facet field="author"></atomic-segmented-facet>
          <atomic-segmented-facet field="language"></atomic-segmented-facet>
        `,
      });

      await element.updateComplete;

      expect(observeSpy).toHaveBeenCalled();
    });

    it('should update arrow visibility when ResizeObserver detects changes', async () => {
      const {parts, element} = await renderComponent();

      await element.updateComplete;

      if (parts.horizontalScroll) {
        Object.defineProperty(parts.horizontalScroll, 'scrollWidth', {
          value: 1000,
          configurable: true,
        });
        Object.defineProperty(parts.horizontalScroll, 'clientWidth', {
          value: 500,
          configurable: true,
        });
        Object.defineProperty(parts.horizontalScroll, 'scrollLeft', {
          value: 0,
          writable: true,
        });
      }

      element.dispatchEvent(new WheelEvent('wheel'));
      await element.updateComplete;

      expect(parts.rightArrowWrapper?.classList.contains('invisible')).toBe(
        false
      );
    });
  });

  describe('#render', () => {
    it('should render all shadow parts when no error', async () => {
      const {parts} = await renderComponent();

      expect(parts.scrollableContainer).not.toBeNull();
      expect(parts.horizontalScroll).not.toBeNull();
      expect(parts.leftArrowWrapper).not.toBeNull();
      expect(parts.rightArrowWrapper).not.toBeNull();
      expect(parts.leftArrowButton).not.toBeNull();
      expect(parts.rightArrowButton).not.toBeNull();
      expect(parts.leftArrowIcon).not.toBeNull();
      expect(parts.rightArrowIcon).not.toBeNull();
      expect(parts.leftFade).not.toBeNull();
      expect(parts.rightFade).not.toBeNull();
    });

    it('should render nothing when search has error', async () => {
      vi.mocked(buildSearchStatus).mockImplementation(() =>
        buildFakeSearchStatus({
          hasError: true,
        })
      );
      const {element} = await renderComponent();

      expect(element.shadowRoot?.children.length).toBe(0);
    });

    it('should render slot for segmented facets', async () => {
      const {parts} = await renderComponent();
      const slot = parts.horizontalScroll?.querySelector('slot');

      expect(slot).not.toBeNull();
    });
  });

  describe('scroll behavior and arrow visibility', () => {
    const CONTAINER_WIDTH = 500;
    const SCROLL_CONTENT_WIDTH = 1000;
    const ARROW_WIDTH = 40;

    const setupScrollableContainer = (
      parts: Awaited<ReturnType<typeof renderComponent>>['parts'],
      initialScrollLeft = 0
    ) => {
      Object.defineProperty(parts.horizontalScroll, 'scrollWidth', {
        value: SCROLL_CONTENT_WIDTH,
        configurable: true,
      });
      Object.defineProperty(parts.horizontalScroll, 'clientWidth', {
        value: CONTAINER_WIDTH,
        configurable: true,
      });

      let scrollLeft = initialScrollLeft;
      Object.defineProperty(parts.horizontalScroll, 'scrollLeft', {
        get: () => scrollLeft,
        set: (val: number) => {
          scrollLeft = val;
        },
        configurable: true,
      });

      if (parts.leftArrowButton) {
        Object.defineProperty(parts.leftArrowButton, 'clientWidth', {
          value: ARROW_WIDTH,
          configurable: true,
        });
      }
      if (parts.rightArrowButton) {
        Object.defineProperty(parts.rightArrowButton, 'clientWidth', {
          value: ARROW_WIDTH,
          configurable: true,
        });
      }

      return {
        getScrollLeft: () => scrollLeft,
      };
    };

    it('should hide both arrows when content is not scrollable', async () => {
      const {parts} = await renderComponent();

      expect(parts.leftArrowWrapper?.classList.contains('invisible')).toBe(
        true
      );
      expect(parts.rightArrowWrapper?.classList.contains('invisible')).toBe(
        true
      );
    });

    it('should show right arrow when content overflows and at left edge', async () => {
      const {parts, element} = await renderComponent({
        children: html`
          <atomic-segmented-facet field="author"></atomic-segmented-facet>
          <atomic-segmented-facet field="language"></atomic-segmented-facet>
          <atomic-segmented-facet field="source"></atomic-segmented-facet>
          <atomic-segmented-facet field="filetype"></atomic-segmented-facet>
        `,
      });

      if (parts.horizontalScroll) {
        Object.defineProperty(parts.horizontalScroll, 'scrollWidth', {
          value: 1000,
          configurable: true,
        });
        Object.defineProperty(parts.horizontalScroll, 'clientWidth', {
          value: 500,
          configurable: true,
        });
        Object.defineProperty(parts.horizontalScroll, 'scrollLeft', {
          value: 0,
          writable: true,
        });
      }

      element.dispatchEvent(new WheelEvent('wheel'));
      await element.updateComplete;

      expect(parts.leftArrowWrapper?.classList.contains('invisible')).toBe(
        true
      );
      expect(parts.rightArrowWrapper?.classList.contains('invisible')).toBe(
        false
      );
    });

    it('should show both arrows when scrolled to middle position', async () => {
      const {parts, element} = await renderComponent();

      if (parts.horizontalScroll) {
        Object.defineProperty(parts.horizontalScroll, 'scrollWidth', {
          value: 1000,
          configurable: true,
        });
        Object.defineProperty(parts.horizontalScroll, 'clientWidth', {
          value: 500,
          configurable: true,
        });
        Object.defineProperty(parts.horizontalScroll, 'scrollLeft', {
          value: 250,
          writable: true,
        });
      }

      element.dispatchEvent(new WheelEvent('wheel'));
      await element.updateComplete;

      expect(parts.leftArrowWrapper?.classList.contains('invisible')).toBe(
        false
      );
      expect(parts.rightArrowWrapper?.classList.contains('invisible')).toBe(
        false
      );
    });

    it('should show only left arrow when scrolled to right edge', async () => {
      const {parts, element} = await renderComponent();

      if (parts.horizontalScroll) {
        Object.defineProperty(parts.horizontalScroll, 'scrollWidth', {
          value: 1000,
          configurable: true,
        });
        Object.defineProperty(parts.horizontalScroll, 'clientWidth', {
          value: 500,
          configurable: true,
        });
        Object.defineProperty(parts.horizontalScroll, 'scrollLeft', {
          value: 500,
          writable: true,
        });
      }

      element.dispatchEvent(new WheelEvent('wheel'));
      await element.updateComplete;

      expect(parts.leftArrowWrapper?.classList.contains('invisible')).toBe(
        false
      );
      expect(parts.rightArrowWrapper?.classList.contains('invisible')).toBe(
        true
      );
    });

    it('should handle wheel events without throwing', async () => {
      const {element} = await renderComponent();
      const wheelEvent = new WheelEvent('wheel');

      expect(() => element.dispatchEvent(wheelEvent)).not.toThrow();
    });

    it('should handle touchmove events without throwing', async () => {
      const {element} = await renderComponent();
      const touchEvent = new TouchEvent('touchmove');

      expect(() => element.dispatchEvent(touchEvent)).not.toThrow();
    });

    it('should handle keydown events without throwing', async () => {
      const {element} = await renderComponent();
      const keyEvent = new KeyboardEvent('keydown');

      expect(() => element.dispatchEvent(keyEvent)).not.toThrow();
    });

    it('should scroll right when right arrow button is clicked', async () => {
      const {parts, element} = await renderComponent();

      if (parts.horizontalScroll && parts.rightArrowButton) {
        const {getScrollLeft} = setupScrollableContainer(parts, 0);
        const initialScrollLeft = getScrollLeft();

        parts.rightArrowButton.click();
        await element.updateComplete;

        expect(getScrollLeft()).toBeGreaterThan(initialScrollLeft);
      }
    });

    it('should scroll left when left arrow button is clicked', async () => {
      const {parts, element} = await renderComponent();

      if (parts.horizontalScroll && parts.leftArrowButton) {
        const {getScrollLeft} = setupScrollableContainer(parts, 300);
        const initialScrollLeft = getScrollLeft();

        parts.leftArrowButton.click();
        await element.updateComplete;

        expect(getScrollLeft()).toBeLessThan(initialScrollLeft);
      }
    });

    it('should update arrow visibility after clicking arrow buttons', async () => {
      const {parts, element} = await renderComponent();

      if (parts.horizontalScroll && parts.rightArrowButton) {
        setupScrollableContainer(parts, 0);

        element.dispatchEvent(new WheelEvent('wheel'));
        await element.updateComplete;

        expect(parts.leftArrowWrapper?.classList.contains('invisible')).toBe(
          true
        );
        expect(parts.rightArrowWrapper?.classList.contains('invisible')).toBe(
          false
        );

        parts.rightArrowButton.click();
        await element.updateComplete;

        expect(parts.leftArrowWrapper?.classList.contains('invisible')).toBe(
          false
        );
        expect(parts.rightArrowWrapper?.classList.contains('invisible')).toBe(
          false
        );
      }
    });
  });
});
