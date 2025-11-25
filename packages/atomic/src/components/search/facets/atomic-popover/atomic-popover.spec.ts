import {buildSearchStatus} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import type {PopoverChildFacet} from '@/src/components/common/facets/popover/popover-type';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {
  buildFakeSearchEngine,
  buildFakeSearchStatus,
} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import type {AtomicPopover} from './atomic-popover';
import './atomic-popover';
import '@/src/components/common/atomic-component-error/atomic-component-error';
import '@/src/components/common/atomic-focus-trap/atomic-focus-trap';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-popover', () => {
  const mockEngine = buildFakeSearchEngine();

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({
        state: {
          hasError: false,
          firstSearchExecuted: true,
          hasResults: true,
          isLoading: false,
        },
      })
    );
  });

  const renderPopover = async ({
    slottedContent = `<atomic-facet field="objecttype" label="Object type"></atomic-facet>`,
    controllerState = {},
  } = {}) => {
    const {element} = await renderInAtomicSearchInterface<AtomicPopover>({
      template: html`<atomic-popover>${slottedContent}</atomic-popover>`,
      selector: 'atomic-popover',
      bindings: (bindings) => {
        bindings.engine = mockEngine;
        return bindings;
      },
    });

    // Simulate the child facet initialization
    const mockChildFacet: PopoverChildFacet = {
      facetId: 'test-facet',
      label: () => 'Test Facet',
      element: document.createElement('div'),
      hasValues: () => true,
      numberOfActiveValues: () => 2,
      ...controllerState,
    };

    // Dispatch the initialization event
    element.dispatchEvent(
      new CustomEvent('atomic/initializePopover', {
        detail: mockChildFacet,
        bubbles: true,
      })
    );

    await element.updateComplete;

    return {
      element,
      popoverButton: page.getByRole('button', {name: /test facet/i}),
      parts: (el: AtomicPopover) => ({
        backdrop: el.shadowRoot?.querySelector('[part="backdrop"]'),
        popoverButton: el.shadowRoot?.querySelector('[part="popover-button"]'),
        valueLabel: el.shadowRoot?.querySelector('[part="value-label"]'),
        valueCount: el.shadowRoot?.querySelector('[part="value-count"]'),
        facet: el.shadowRoot?.querySelector('[part="facet"]'),
        placeholder: el.shadowRoot?.querySelector('[part="placeholder"]'),
      }),
    };
  };

  describe('#initialize', () => {
    it('should build search status controller', async () => {
      await renderPopover();

      expect(buildSearchStatus).toHaveBeenCalledWith(mockEngine);
    });

    describe('when no child is provided', () => {
      it('should set error', async () => {
        const {element} = await renderPopover({slottedContent: ''});

        expect(element.error).toBeTruthy();
        expect(element.error.message).toContain(
          'One child is required inside a set of popover tags.'
        );
      });
    });

    describe('when multiple children are provided', () => {
      it('should set error', async () => {
        const {element} = await renderPopover({
          slottedContent: `
            <atomic-facet field="objecttype" label="Object type"></atomic-facet>
            <atomic-facet field="filetype" label="File type"></atomic-facet>
          `,
        });

        expect(element.error).toBeTruthy();
        expect(element.error.message).toContain(
          'Cannot have more than one child inside a set of popover tags.'
        );
      });
    });
  });

  describe('#render', () => {
    it('should render popover button with label', async () => {
      const {parts, element} = await renderPopover();

      await expect.element(parts(element).popoverButton).toBeInTheDocument();
      await expect.element(parts(element).valueLabel).toBeInTheDocument();
    });

    it('should display value count when there are active values', async () => {
      const {parts, element} = await renderPopover();

      await expect.element(parts(element).valueCount).toBeInTheDocument();
      await expect.element(parts(element).valueCount).toHaveTextContent('(2)');
    });

    it('should not display value count when there are no active values', async () => {
      const {parts, element} = await renderPopover({
        controllerState: {
          numberOfActiveValues: () => 0,
        },
      });

      const valueCount = parts(element).valueCount;
      expect(valueCount).toBeTruthy();
      expect(valueCount?.classList.contains('hidden')).toBe(true);
    });

    describe('when search has error', () => {
      it('should render nothing', async () => {
        vi.mocked(buildSearchStatus).mockReturnValue(
          buildFakeSearchStatus({
            state: {
              hasError: true,
              firstSearchExecuted: true,
              hasResults: false,
              isLoading: false,
            },
          })
        );

        const {parts, element} = await renderPopover();

        expect(parts(element).popoverButton).toBeNull();
      });
    });

    describe('when first search is not executed', () => {
      it('should render placeholder', async () => {
        vi.mocked(buildSearchStatus).mockReturnValue(
          buildFakeSearchStatus({
            state: {
              hasError: false,
              firstSearchExecuted: false,
              hasResults: false,
              isLoading: true,
            },
          })
        );

        const {parts, element} = await renderPopover();

        await expect.element(parts(element).placeholder).toBeInTheDocument();
      });
    });

    describe('when search has no results', () => {
      it('should render nothing', async () => {
        vi.mocked(buildSearchStatus).mockReturnValue(
          buildFakeSearchStatus({
            state: {
              hasError: false,
              firstSearchExecuted: true,
              hasResults: false,
              isLoading: false,
            },
          })
        );

        const {parts, element} = await renderPopover();

        expect(parts(element).popoverButton).toBeNull();
      });
    });

    describe('when child facet has no values', () => {
      it('should render nothing', async () => {
        const {parts, element} = await renderPopover({
          controllerState: {
            hasValues: () => false,
          },
        });

        expect(parts(element).popoverButton).toBeNull();
      });
    });
  });

  describe('#disconnectedCallback', () => {
    it('should clean up event listeners on disconnect', async () => {
      const {element} = await renderPopover();
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

  describe('#togglePopover (when button is clicked)', () => {
    it('should open the popover', async () => {
      const {popoverButton, parts, element} = await renderPopover();

      await userEvent.click(popoverButton);
      await element.updateComplete;

      const facet = parts(element).facet;
      expect(facet).toBeTruthy();
      expect(facet?.classList.contains('hidden')).toBe(false);
    });

    it('should display backdrop when open', async () => {
      const {popoverButton, parts, element} = await renderPopover();

      await userEvent.click(popoverButton);
      await element.updateComplete;

      await expect.element(parts(element).backdrop).toBeInTheDocument();
    });

    it('should set aria-expanded to true', async () => {
      const {popoverButton, element} = await renderPopover();

      await userEvent.click(popoverButton);
      await element.updateComplete;

      await expect
        .element(popoverButton)
        .toHaveAttribute('aria-expanded', 'true');
    });

    describe('when popover is open and backdrop is clicked', () => {
      it('should close the popover', async () => {
        const {popoverButton, parts, element} = await renderPopover();

        // Open popover
        await userEvent.click(popoverButton);
        await element.updateComplete;

        // Click backdrop
        const backdrop = parts(element).backdrop;
        expect(backdrop).toBeTruthy();
        await userEvent.click(backdrop!);
        await element.updateComplete;

        // Verify closed
        const facet = parts(element).facet;
        expect(facet).toBeTruthy();
        expect(facet?.classList.contains('hidden')).toBe(true);
      });
    });

    describe('when popover is open and Escape key is pressed', () => {
      it('should close the popover', async () => {
        const {popoverButton, parts, element} = await renderPopover();

        // Open popover
        await userEvent.click(popoverButton);
        await element.updateComplete;

        // Press Escape
        await page.keyboard.press('Escape');
        await element.updateComplete;

        // Verify closed
        const facet = parts(element).facet;
        expect(facet).toBeTruthy();
        expect(facet?.classList.contains('hidden')).toBe(true);
      });
    });
  });
});
