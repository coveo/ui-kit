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

  describe('rendering', () => {
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

  describe('arrow visibility', () => {
    describe('when not scrollable', () => {
      it('should hide both arrows initially', async () => {
        const {parts} = await renderComponent();

        expect(parts.leftArrowWrapper?.classList.contains('invisible')).toBe(
          true
        );
        expect(parts.rightArrowWrapper?.classList.contains('invisible')).toBe(
          true
        );
      });
    });

    describe('when scrollable', () => {
      it('should show right arrow when content overflows', async () => {
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

      it('should show both arrows when scrolled to middle', async () => {
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

      it('should update arrow visibility dynamically when scrolled', async () => {
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
          let scrollLeft = 0;
          Object.defineProperty(parts.horizontalScroll, 'scrollLeft', {
            get: () => scrollLeft,
            set: (val: number) => {
              scrollLeft = val;
            },
            configurable: true,
          });
        }

        element.dispatchEvent(new WheelEvent('wheel'));
        await element.updateComplete;

        expect(parts.rightArrowWrapper?.classList.contains('invisible')).toBe(
          false
        );

        if (parts.horizontalScroll) {
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
    });
  });

  describe('scroll behavior', () => {
    it('should scroll left when left arrow is clicked', async () => {
      const {parts, element} = await renderComponent();

      if (parts.horizontalScroll && parts.leftArrowButton) {
        Object.defineProperty(parts.horizontalScroll, 'scrollWidth', {
          value: 1000,
          configurable: true,
        });
        Object.defineProperty(parts.horizontalScroll, 'clientWidth', {
          value: 500,
          configurable: true,
        });
        let scrollLeft = 500;
        Object.defineProperty(parts.horizontalScroll, 'scrollLeft', {
          get: () => scrollLeft,
          set: (val: number) => {
            scrollLeft = val;
          },
          configurable: true,
        });

        if (parts.leftArrowButton) {
          Object.defineProperty(parts.leftArrowButton, 'clientWidth', {
            value: 40,
            configurable: true,
          });
        }

        const initialScrollLeft = scrollLeft;
        parts.leftArrowButton.click();
        await element.updateComplete;

        expect(scrollLeft).toBeLessThan(initialScrollLeft);
      }
    });

    it('should scroll right when right arrow is clicked', async () => {
      const {parts, element} = await renderComponent();

      if (parts.horizontalScroll && parts.rightArrowButton) {
        Object.defineProperty(parts.horizontalScroll, 'scrollWidth', {
          value: 1000,
          configurable: true,
        });
        Object.defineProperty(parts.horizontalScroll, 'clientWidth', {
          value: 500,
          configurable: true,
        });
        let scrollLeft = 0;
        Object.defineProperty(parts.horizontalScroll, 'scrollLeft', {
          get: () => scrollLeft,
          set: (val: number) => {
            scrollLeft = val;
          },
          configurable: true,
        });

        if (parts.rightArrowButton) {
          Object.defineProperty(parts.rightArrowButton, 'clientWidth', {
            value: 40,
            configurable: true,
          });
        }

        const initialScrollLeft = scrollLeft;
        parts.rightArrowButton.click();
        await element.updateComplete;

        expect(scrollLeft).toBeGreaterThan(initialScrollLeft);
      }
    });

    it('should calculate scroll distance based on container width and arrow width', async () => {
      const {parts, element} = await renderComponent();

      if (parts.horizontalScroll && parts.rightArrowButton) {
        Object.defineProperty(parts.horizontalScroll, 'scrollWidth', {
          value: 1000,
          configurable: true,
        });
        Object.defineProperty(parts.horizontalScroll, 'clientWidth', {
          value: 500,
          configurable: true,
        });
        let scrollLeft = 0;
        Object.defineProperty(parts.horizontalScroll, 'scrollLeft', {
          get: () => scrollLeft,
          set: (val: number) => {
            scrollLeft = val;
          },
          configurable: true,
        });

        if (parts.rightArrowButton) {
          Object.defineProperty(parts.rightArrowButton, 'clientWidth', {
            value: 40,
            configurable: true,
          });
        }

        parts.rightArrowButton.click();
        await element.updateComplete;

        const expectedScrollDistance = (500 - 40 * 2) * 0.7;
        expect(scrollLeft).toBeCloseTo(expectedScrollDistance, 0);
      }
    });

    it('should hide left arrow when scrolling to left edge', async () => {
      const {parts, element} = await renderComponent();

      if (parts.horizontalScroll && parts.leftArrowButton) {
        Object.defineProperty(parts.horizontalScroll, 'scrollWidth', {
          value: 1000,
          configurable: true,
        });
        Object.defineProperty(parts.horizontalScroll, 'clientWidth', {
          value: 500,
          configurable: true,
        });
        let scrollLeft = 100;
        Object.defineProperty(parts.horizontalScroll, 'scrollLeft', {
          get: () => scrollLeft,
          set: (val: number) => {
            scrollLeft = val;
          },
          configurable: true,
        });

        if (parts.leftArrowButton) {
          Object.defineProperty(parts.leftArrowButton, 'clientWidth', {
            value: 40,
            configurable: true,
          });
        }

        parts.leftArrowButton.click();
        await element.updateComplete;

        expect(scrollLeft).toBeLessThanOrEqual(0);
      }
    });

    it('should hide right arrow when scrolling to right edge', async () => {
      const {parts, element} = await renderComponent();

      if (parts.horizontalScroll && parts.rightArrowButton) {
        Object.defineProperty(parts.horizontalScroll, 'scrollWidth', {
          value: 1000,
          configurable: true,
        });
        Object.defineProperty(parts.horizontalScroll, 'clientWidth', {
          value: 500,
          configurable: true,
        });
        let scrollLeft = 400;
        Object.defineProperty(parts.horizontalScroll, 'scrollLeft', {
          get: () => scrollLeft,
          set: (val: number) => {
            scrollLeft = val;
          },
          configurable: true,
        });

        if (parts.rightArrowButton) {
          Object.defineProperty(parts.rightArrowButton, 'clientWidth', {
            value: 40,
            configurable: true,
          });
        }

        parts.rightArrowButton.click();
        await element.updateComplete;

        expect(scrollLeft).toBeGreaterThanOrEqual(500);
      }
    });
  });

  describe('event listeners', () => {
    it('should handle wheel events', async () => {
      const {element} = await renderComponent();
      const wheelEvent = new WheelEvent('wheel');

      expect(() => element.dispatchEvent(wheelEvent)).not.toThrow();
    });

    it('should handle touchmove events', async () => {
      const {element} = await renderComponent();
      const touchEvent = new TouchEvent('touchmove');

      expect(() => element.dispatchEvent(touchEvent)).not.toThrow();
    });

    it('should handle keydown events', async () => {
      const {element} = await renderComponent();
      const keyEvent = new KeyboardEvent('keydown');

      expect(() => element.dispatchEvent(keyEvent)).not.toThrow();
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
      let resizeCallback: ResizeObserverCallback;
      const ResizeObserverSpy = vi
        .spyOn(window, 'ResizeObserver')
        .mockImplementation((callback) => {
          resizeCallback = callback;
          return {
            observe: vi.fn(),
            disconnect: vi.fn(),
            unobserve: vi.fn(),
          } as unknown as ResizeObserver;
        });

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
          value: 0,
          writable: true,
        });
      }

      resizeCallback!([], {} as ResizeObserver);
      await element.updateComplete;

      expect(parts.rightArrowWrapper?.classList.contains('invisible')).toBe(
        false
      );

      ResizeObserverSpy.mockRestore();
    });
  });
});
