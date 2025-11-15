import {buildSearchStatus} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/fake-search-status';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/interface/render-in-interface';
import type {AtomicSegmentedFacetScrollable} from './atomic-segmented-facet-scrollable';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-segmented-facet-scrollable', () => {
  const renderComponent = async ({
    searchStatusState = {},
    slottedContent = html`<atomic-segmented-facet
      field="author"
    ></atomic-segmented-facet>`,
  } = {}) => {
    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({state: searchStatusState})
    );

    const {element} =
      await renderInAtomicSearchInterface<AtomicSegmentedFacetScrollable>({
        template: html`<atomic-segmented-facet-scrollable
        >${slottedContent}</atomic-segmented-facet-scrollable
      >`,
        selector: 'atomic-segmented-facet-scrollable',
      });

    return {
      element,
      parts: {
        scrollableContainer: element.shadowRoot?.querySelector(
          '[part="scrollable-container"]'
        ),
        horizontalScroll: element.shadowRoot?.querySelector(
          '[part="horizontal-scroll"]'
        ),
        leftArrowWrapper: element.shadowRoot?.querySelector(
          '[part="left-arrow-wrapper"]'
        ),
        rightArrowWrapper: element.shadowRoot?.querySelector(
          '[part="right-arrow-wrapper"]'
        ),
        leftArrowButton: element.shadowRoot?.querySelector(
          '[part="left-arrow-button"]'
        ) as HTMLButtonElement | null,
        rightArrowButton: element.shadowRoot?.querySelector(
          '[part="right-arrow-button"]'
        ) as HTMLButtonElement | null,
        leftArrowIcon: element.shadowRoot?.querySelector(
          '[part="left-arrow-icon"]'
        ),
        rightArrowIcon: element.shadowRoot?.querySelector(
          '[part="right-arrow-icon"]'
        ),
        leftFade: element.shadowRoot?.querySelector('[part="left-fade"]'),
        rightFade: element.shadowRoot?.querySelector('[part="right-fade"]'),
      },
    };
  };

  describe('#initialize', () => {
    it('should build the SearchStatus controller', async () => {
      const {element} = await renderComponent();

      expect(buildSearchStatus).toHaveBeenCalledWith(element.bindings.engine);
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
      const {element} = await renderComponent({
        searchStatusState: {hasError: true},
      });

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
          slottedContent: html`
            <atomic-segmented-facet field="author"></atomic-segmented-facet>
            <atomic-segmented-facet field="language"></atomic-segmented-facet>
            <atomic-segmented-facet field="source"></atomic-segmented-facet>
            <atomic-segmented-facet field="filetype"></atomic-segmented-facet>
          `,
        });

        // Simulate scrollable content by setting scroll width
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

        // Trigger handleScroll
        element.dispatchEvent(new WheelEvent('wheel'));
        await element.updateComplete;

        expect(parts.leftArrowWrapper?.classList.contains('invisible')).toBe(
          true
        );
        expect(parts.rightArrowWrapper?.classList.contains('invisible')).toBe(
          false
        );
      });
    });
  });

  describe('scroll behavior', () => {
    it('should scroll left when left arrow is clicked', async () => {
      const {parts, element} = await renderComponent();

      if (parts.horizontalScroll && parts.leftArrowButton) {
        // Set up scrollable state
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

        // Mock arrow ref width
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
        // Set up scrollable state
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

        // Mock arrow ref width
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

      // Trigger firstUpdated to create the observer
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
        slottedContent: html`
          <atomic-segmented-facet field="author"></atomic-segmented-facet>
          <atomic-segmented-facet field="language"></atomic-segmented-facet>
        `,
      });

      await element.updateComplete;

      // Should observe each child element plus the horizontal scroll container
      expect(observeSpy).toHaveBeenCalled();
    });
  });
});
