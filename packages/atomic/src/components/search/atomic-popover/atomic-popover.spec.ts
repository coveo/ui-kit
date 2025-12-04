import {buildSearchStatus} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import type {PopoverChildFacet} from '@/src/components/common/facets/popover/popover-type';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import type {AtomicPopover} from './atomic-popover';
import './atomic-popover';
import '@/src/components/common/atomic-component-error/atomic-component-error';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-popover', () => {
  const mockEngine = buildFakeSearchEngine();

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({
        hasError: false,
        firstSearchExecuted: true,
        hasResults: true,
        isLoading: false,
      })
    );
  });

  const locators = {
    get button() {
      return page.getByRole('button', {name: /popover/i});
    },
    get backdrop() {
      return page.getByTestId('backdrop');
    },
    parts: (element: AtomicPopover) => {
      const qs = (part: string) =>
        element.shadowRoot?.querySelector(`[part="${part}"]`);
      return {
        button: qs('popover-button') as HTMLButtonElement,
        valueLabel: qs('value-label'),
        valueCount: qs('value-count'),
        backdrop: qs('backdrop'),
        placeholder: qs('placeholder'),
        facet: qs('facet') as HTMLDivElement,
        arrowIcon: qs('arrow-icon'),
      };
    },
  };

  const renderPopover = async ({
    numberOfActiveValues = 2,
    hasError = false,
  }: {
    numberOfActiveValues?: number;
    hasError?: boolean;
  } = {}) => {
    if (hasError) {
      vi.mocked(buildSearchStatus).mockReturnValue(
        buildFakeSearchStatus({
          hasError: true,
          firstSearchExecuted: true,
          hasResults: false,
          isLoading: false,
        })
      );
    }

    const {element} = await renderInAtomicSearchInterface<AtomicPopover>({
      template: html`<atomic-popover>
        <div>Test Facet</div>
      </atomic-popover>`,
      selector: 'atomic-popover',
      bindings: (bindings) => {
        bindings.engine = mockEngine;
        return bindings;
      },
    });

    const mockChildFacet: PopoverChildFacet = {
      facetId: 'test-facet',
      label: () => 'Test Facet',
      element: document.createElement('div'),
      hasValues: () => true,
      numberOfActiveValues: () => numberOfActiveValues,
      isHidden: () => false,
    };

    element.dispatchEvent(
      new CustomEvent('atomic/initializePopover', {
        detail: mockChildFacet,
        bubbles: true,
        composed: true,
      })
    );

    await element.updateComplete;

    return element;
  };

  describe('when initializing', () => {
    it('should build search status controller', async () => {
      await renderPopover();
      expect(buildSearchStatus).toHaveBeenCalledWith(mockEngine);
    });

    it('should set error when no child is provided', async () => {
      const element = (
        await renderInAtomicSearchInterface<AtomicPopover>({
          template: html`<atomic-popover></atomic-popover>`,
          selector: 'atomic-popover',
          bindings: (bindings) => {
            bindings.engine = mockEngine;
            return bindings;
          },
        })
      ).element;

      expect(element.error).toBeTruthy();
      expect(element.error.message).toContain(
        'One child is required inside a set of popover tags.'
      );
    });

    it('should set error when more than one child is provided', async () => {
      const element = (
        await renderInAtomicSearchInterface<AtomicPopover>({
          template: html`<atomic-popover>
              <div>Child 1</div>
              <div>Child 2</div>
            </atomic-popover>`,
          selector: 'atomic-popover',
          bindings: (bindings) => {
            bindings.engine = mockEngine;
            return bindings;
          },
        })
      ).element;

      expect(element.error).toBeTruthy();
      expect(element.error.message).toContain(
        'Cannot have more than one child inside a set of popover tags.'
      );
    });
  });

  describe('when connected to DOM', () => {
    it('should add event listeners', async () => {
      const element = await renderPopover();
      const addEventListenerSpy = vi.spyOn(element, 'addEventListener');

      element.disconnectedCallback();
      element.connectedCallback();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'atomic/initializePopover',
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });
  });

  describe('when disconnected from DOM', () => {
    it('should remove event listeners', async () => {
      const element = await renderPopover();
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.disconnectedCallback();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/initializePopover',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });
  });

  describe('when rendering', () => {
    it('should render popover button with label', async () => {
      const element = await renderPopover();
      const {button, valueLabel} = locators.parts(element);
      expect(button).toBeTruthy();
      expect(valueLabel).toBeTruthy();
      expect(valueLabel?.textContent).toContain('Test Facet');
    });

    it('should display value count when there are active values', async () => {
      const element = await renderPopover({numberOfActiveValues: 2});
      const {valueCount} = locators.parts(element);
      expect(valueCount).toBeTruthy();
      expect(valueCount?.textContent?.trim()).toContain('(2)');
    });

    it('should not display value count when there are no active values', async () => {
      const element = await renderPopover({numberOfActiveValues: 0});
      const {valueCount} = locators.parts(element);
      expect(valueCount?.classList.contains('hidden')).toBe(true);
    });

    describe('when button is clicked', () => {
      it('should open the popover', async () => {
        const element = await renderPopover();
        const {button, facet} = locators.parts(element);
        expect(facet?.classList.contains('hidden')).toBe(true);

        await userEvent.click(button);
        await element.updateComplete;

        expect(facet?.classList.contains('hidden')).toBe(false);
        expect(button.getAttribute('aria-expanded')).toBe('true');
      });

      it('should display backdrop when open', async () => {
        const element = await renderPopover();
        const {button} = locators.parts(element);

        await userEvent.click(button);
        await element.updateComplete;

        const {backdrop} = locators.parts(element);
        expect(backdrop).toBeTruthy();
      });
    });

    it('should close the popover when backdrop is clicked', async () => {
      const element = await renderPopover();
      const {button, facet} = locators.parts(element);

      await userEvent.click(button);
      await element.updateComplete;
      expect(facet?.classList.contains('hidden')).toBe(false);

      const {backdrop} = locators.parts(element);
      await userEvent.click(backdrop as HTMLElement);
      await element.updateComplete;

      expect(facet?.classList.contains('hidden')).toBe(true);
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('should close the popover when Escape key is pressed', async () => {
      const element = await renderPopover();
      const {button, facet} = locators.parts(element);

      await userEvent.click(button);
      await element.updateComplete;
      expect(facet?.classList.contains('hidden')).toBe(false);

      await userEvent.keyboard('{Escape}');
      await element.updateComplete;

      expect(facet?.classList.contains('hidden')).toBe(true);
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('should have correct aria-expanded attribute', async () => {
      const element = await renderPopover();
      const {button} = locators.parts(element);

      expect(button.getAttribute('aria-expanded')).toBe('false');

      await userEvent.click(button);
      await element.updateComplete;

      expect(button.getAttribute('aria-expanded')).toBe('true');
    });

    describe('when search has error', () => {
      it('should render nothing', async () => {
        const element = await renderPopover({hasError: true});
        const button = element.shadowRoot?.querySelector(
          '[part="popover-button"]'
        );
        expect(button).toBeFalsy();
      });
    });

    describe('when first search has not executed', () => {
      it('should show placeholder', async () => {
        vi.mocked(buildSearchStatus).mockReturnValue(
          buildFakeSearchStatus({
            hasError: false,
            firstSearchExecuted: false,
            hasResults: false,
            isLoading: true,
          })
        );

        const element = await renderPopover();
        await element.updateComplete;
        const {placeholder} = locators.parts(element);
        expect(placeholder).toBeTruthy();
      });
    });
  });

  describe('when updated', () => {
    it('should not create Popper when refs are missing', async () => {
      const element = (
        await renderInAtomicSearchInterface<AtomicPopover>({
          template: html`<atomic-popover>
          <div>Test Facet</div>
        </atomic-popover>`,
          selector: 'atomic-popover',
          bindings: (bindings) => {
            bindings.engine = mockEngine;
            return bindings;
          },
        })
      ).element;

      expect(() => {
        element.requestUpdate();
      }).not.toThrow();
    });

    it('should create Popper instance on first render when refs are available', async () => {
      const element = await renderPopover();
      const {button, facet} = locators.parts(element);

      expect(button).toBeTruthy();
      expect(facet).toBeTruthy();

      expect(facet.hasAttribute('data-popper-placement')).toBe(true);
    });

    it('should update Popper position when component updates', async () => {
      const element = await renderPopover();
      const {button, facet} = locators.parts(element);

      await userEvent.click(button);
      await element.updateComplete;

      element.requestUpdate();
      await element.updateComplete;

      expect(facet.getAttribute('style')).toBeTruthy();
      expect(facet.hasAttribute('data-popper-placement')).toBe(true);
    });
  });
});
