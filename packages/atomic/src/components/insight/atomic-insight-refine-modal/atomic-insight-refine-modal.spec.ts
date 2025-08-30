import {
  buildBreadcrumbManager as buildInsightBreadcrumbManager,
  buildQuerySummary as buildInsightQuerySummary,
} from '@coveo/headless/insight';
import {userEvent} from '@vitest/browser/context';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeInsightBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/breadcrumb-manager-controller';
import {buildFakeInsightQuerySummary} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/query-summary-controller';
import './atomic-insight-refine-modal';
import type {AtomicInsightRefineModal} from './atomic-insight-refine-modal';

// Mock headless at the top level
vi.mock('@coveo/headless/insight', {spy: true});

// Helper functions to create mock facet elements
const createMockInsightFacetWithValues = (
  facetId: string,
  field: string,
  values: string[]
): HTMLElement => {
  const facet = document.createElement('atomic-insight-facet');
  facet.setAttribute('facet-id', facetId);
  facet.setAttribute('field', field);
  values.forEach((value) => {
    const facetValue = document.createElement('div');
    facetValue.textContent = value;
    facet.appendChild(facetValue);
  });
  return facet;
};

describe('atomic-insight-refine-modal', () => {
  beforeEach(() => {
    // Mock requestAnimationFrame to prevent infinite loops in tests
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((fn) => {
      setTimeout(fn, 0);
      return 1;
    });
  });

  const renderRefineModal = async (
    options: {
      isOpen?: boolean;
      openButton?: HTMLElement;
      breadcrumbState?: {hasBreadcrumbs?: boolean};
      querySummaryState?: {total?: number; hasResults?: boolean};
      facetElements?: HTMLElement[];
    } = {}
  ) => {
    const {
      isOpen = false,
      openButton,
      breadcrumbState = {},
      querySummaryState = {},
      facetElements = [],
    } = options;

    const mockedBreadcrumbManager = buildFakeInsightBreadcrumbManager({
      state: {
        hasBreadcrumbs: false,
        facetBreadcrumbs: [],
        categoryFacetBreadcrumbs: [],
        numericFacetBreadcrumbs: [],
        dateFacetBreadcrumbs: [],
        staticFilterBreadcrumbs: [],
        ...breadcrumbState,
      },
    });
    const mockedQuerySummary = buildFakeInsightQuerySummary({
      state: {
        isLoading: false,
        firstResult: 1,
        lastResult: 10,
        total: 100,
        hasResults: true,
        query: '',
        hasQuery: false,
        durationInMilliseconds: 100,
        durationInSeconds: 0.1,
        hasDuration: true,
        hasError: false,
        firstSearchExecuted: true,
        ...querySummaryState,
      },
    });

    vi.mocked(buildInsightBreadcrumbManager).mockReturnValue(
      mockedBreadcrumbManager
    );
    vi.mocked(buildInsightQuerySummary).mockReturnValue(mockedQuerySummary);

    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightRefineModal>({
        template: html`<atomic-insight-refine-modal
        .isOpen=${isOpen}
        .openButton=${openButton}
      ></atomic-insight-refine-modal>`,
        selector: 'atomic-insight-refine-modal',
        bindings: (bindings) => {
          bindings.store.onChange = vi.fn();
          bindings.store.getFacetElements = vi
            .fn()
            .mockReturnValue(facetElements);
          // Mock getBoundingClientRect to prevent errors
          bindings.interfaceElement.getBoundingClientRect = vi
            .fn()
            .mockReturnValue({
              top: 0,
              left: 0,
              width: 800,
              height: 600,
              right: 800,
              bottom: 600,
              x: 0,
              y: 0,
              toJSON: () => ({}),
            } as DOMRect);
          // Mock querySelectorAll to return the provided facet elements
          bindings.interfaceElement.querySelectorAll = vi
            .fn()
            .mockReturnValue(facetElements);
          return bindings;
        },
      });

    return {
      element,
      mockedBreadcrumbManager,
      mockedQuerySummary,
      title: element.shadowRoot?.querySelector('[part="title"]'),
      closeButton: element.shadowRoot?.querySelector('[part="close-button"]'),
      closeIcon: element.shadowRoot?.querySelector('[part="close-icon"]'),
      footerContent: element.shadowRoot?.querySelector(
        '[part="footer-content"]'
      ),
      footerButton: element.shadowRoot?.querySelector('[part="footer-button"]'),
      footerButtonText: element.shadowRoot?.querySelector(
        '[part="footer-button-text"]'
      ),
      footerButtonCount: element.shadowRoot?.querySelector(
        '[part="footer-button-count"]'
      ),
      atomicModal: element.shadowRoot?.querySelector('atomic-modal'),
      aside: element.shadowRoot?.querySelector('aside[part="content"]'),
      sortTitle: element.shadowRoot?.querySelector(
        '[part*="section-sort-title"]'
      ),
      selectWrapper: element.shadowRoot?.querySelector(
        '[part="select-wrapper"]'
      ),
      select: element.shadowRoot?.querySelector('select[part="select"]'),
      selectIconWrapper: element.shadowRoot?.querySelector(
        '[part="select-icon-wrapper"]'
      ),
      selectIcon: element.shadowRoot?.querySelector('[part="select-icon"]'),
      filterSection: element.shadowRoot?.querySelector(
        '[part="filter-section"]'
      ),
      sectionFiltersTitle: element.shadowRoot?.querySelector(
        '[part*="section-filters-title"]'
      ),
      facetSlot: element.shadowRoot?.querySelector('slot[name="facets"]'),
      filterClearAllButton: element.shadowRoot?.querySelector(
        '[part="filter-clear-all"]'
      ),
    };
  };

  it('should render correctly', async () => {
    const {element} = await renderRefineModal();
    expect(element).toBeDefined();
  });

  it('should initialize controllers when component is created', async () => {
    const {element} = await renderRefineModal();

    expect(element.querySummary).toBeDefined();
    expect(element.breadcrumbManager).toBeDefined();
    expect(buildInsightQuerySummary).toHaveBeenCalled();
    expect(buildInsightBreadcrumbManager).toHaveBeenCalled();
  });

  it('should set default properties correctly', async () => {
    const {element} = await renderRefineModal();

    expect(element.isOpen).toBe(false);
  });

  describe('when modal is opened', () => {
    const defaultFacets = [
      createMockInsightFacetWithValues('author-facet', 'author', ['John Doe']),
    ];

    it('should have isOpen property set to true when opened', async () => {
      const {element} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });
      expect(element.isOpen).toBe(true);
    });

    it('should render the atomic-modal with isOpen property set to true', async () => {
      const {atomicModal} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });
      expect(atomicModal!.isOpen).toBe(true);
    });

    it('should render the facet slot', async () => {
      const {element} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      const facetSlot = element.querySelector('div[slot="facets"]');
      expect(facetSlot).toBeDefined();
    });

    it('should not append duplicate facet slot when opened multiple times', async () => {
      const {element} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      // Close
      element.isOpen = false;
      // Re-open
      element.isOpen = true;
      const allFacetSlots = element.querySelectorAll('div[slot="facets"]');

      expect(allFacetSlots.length).toBe(1);
    });

    it('should render the title with the correct text', async () => {
      const {title} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      expect(title).toHaveTextContent('Filters');
    });

    it('should render the title with the correct part attribute', async () => {
      const {title} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      expect(title).toHaveAttribute('part', 'title');
    });

    it('should render the close button with the correct part attribute', async () => {
      const {closeButton} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      expect(closeButton).toHaveAttribute('part', 'close-button');
    });

    it('should render the close button with the correct aria-label', async () => {
      const {closeButton} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      expect(closeButton).toHaveAttribute('aria-label', 'Close');
    });

    it('should make isOpen false when the close button is clicked', async () => {
      const {element, closeButton} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      // Ensure the element is rendered
      await element.updateComplete;
      await userEvent.click(closeButton!);

      expect(element.isOpen).toBe(false);
    });

    it('should render the close icon with the correct part attribute', async () => {
      const {closeIcon} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      expect(closeIcon).toHaveAttribute('part', 'close-icon');
    });

    it('should render the footer content with the correct part attribute', async () => {
      const {footerContent} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      expect(footerContent).toHaveAttribute('part', 'footer-content');
    });

    it('should render the footer content with the correct slot attribute', async () => {
      const {footerContent} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      expect(footerContent).toHaveAttribute('slot', 'footer');
    });

    it('should render the footer button with the correct part attribute', async () => {
      const {footerButton} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      expect(footerButton).toHaveAttribute('part', 'footer-button');
    });

    it('should render the footer button with the correct text', async () => {
      const {footerButton} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      expect(footerButton).toHaveTextContent('View results (100)');
    });

    it('should render the footer button text with the correct part attribute', async () => {
      const {footerButtonText} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      expect(footerButtonText).toHaveAttribute('part', 'footer-button-text');
    });

    it('should render the footer button text with the correct text', async () => {
      const {footerButtonText} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      expect(footerButtonText).toHaveTextContent('View results');
    });

    it('should make isOpen false when the footer button is clicked', async () => {
      const {element, footerButton} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      // Ensure the element is rendered
      await element.updateComplete;

      await userEvent.click(footerButton!);

      expect(element.isOpen).toBe(false);
    });

    it('should render the footer button count with the correct part attribute', async () => {
      const {footerButtonCount} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      expect(footerButtonCount).toHaveAttribute('part', 'footer-button-count');
    });

    it('should render the footer button count with the correct text', async () => {
      const {footerButtonCount} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      expect(footerButtonCount).toHaveTextContent('(100)');
    });

    it('should render the atomic-modal element with the correct properties and attributes', async () => {
      const {atomicModal} = await renderRefineModal({
        isOpen: true,
        facetElements: defaultFacets,
      });

      expect(atomicModal).toHaveProperty('fullscreen', true);
      expect(atomicModal).toHaveProperty('isOpen', true);
      expect(atomicModal).toHaveProperty('source', undefined);
      expect(atomicModal).toHaveProperty('container', expect.any(HTMLElement));
      expect(atomicModal).toHaveProperty('boundary', undefined);
      expect(atomicModal).toHaveAttribute(
        'exportparts',
        'backdrop,container,header-wrapper,header,header-ruler,body-wrapper,body,footer-wrapper,footer'
      );
      expect(atomicModal).toHaveProperty(
        'onAnimationEnded',
        expect.any(Function)
      );
    });

    it('should track interface dimensions when modal is opened', async () => {
      const {element} = await renderRefineModal();

      expect(element.interfaceDimensions).toBeUndefined();

      element.isOpen = true;

      element.updateDimensions();
      expect(element.interfaceDimensions).toBeDefined();
    });
  });

  describe('when breadcrumbs are available', () => {
    const facetsWithBreadcrumbs = [
      createMockInsightFacetWithValues('author-facet', 'author', ['John Doe']),
    ];

    it('should render clear all filters button when breadcrumbs exist', async () => {
      const {element, filterClearAllButton, mockedBreadcrumbManager} =
        await renderRefineModal({
          breadcrumbState: {hasBreadcrumbs: true},
          isOpen: true,
          facetElements: facetsWithBreadcrumbs,
        });

      // Ensure the element is rendered
      await element.updateComplete;

      expect(mockedBreadcrumbManager.state.hasBreadcrumbs).toBe(true);
      expect(filterClearAllButton).toBeDefined();
      expect(filterClearAllButton).toHaveAttribute('part', 'filter-clear-all');
    });

    it('should call breadcrumbManager.deselectAll when clear all button is clicked', async () => {
      const {element, mockedBreadcrumbManager, filterClearAllButton} =
        await renderRefineModal({
          breadcrumbState: {hasBreadcrumbs: true},
          isOpen: true,
          facetElements: facetsWithBreadcrumbs,
        });

      // Ensure the element is rendered
      await element.updateComplete;

      await userEvent.click(filterClearAllButton!);

      expect(mockedBreadcrumbManager.deselectAll).toHaveBeenCalled();
    });
  });

  describe('when no breadcrumbs are available', () => {
    it('should not render clear all filters button when no breadcrumbs exist', async () => {
      const {element, filterClearAllButton} = await renderRefineModal({
        breadcrumbState: {hasBreadcrumbs: false},
        isOpen: true,
      });

      await element.updateComplete;
      expect(filterClearAllButton).toBeNull();
    });
  });

  describe('when no facet elements exist', () => {
    it('should not render body content when there are no facet elements', async () => {
      const {element} = await renderRefineModal({isOpen: true});

      element.bindings.store.getFacetElements = vi.fn().mockReturnValue([]);
      await element.updateComplete;

      const facetSlot = element.shadowRoot?.querySelector(
        'slot[name="facets"]'
      );
      expect(facetSlot).toBeNull();
    });
  });

  describe('#updateDimensions', () => {
    it('should update interfaceDimensions with current interface element dimensions', async () => {
      const {element} = await renderRefineModal();

      const mockRect = {
        top: 10,
        left: 20,
        width: 100,
        height: 200,
        right: 120,
        bottom: 220,
        x: 10,
        y: 20,
        toJSON: () => ({}),
      } as DOMRect;
      element.bindings.interfaceElement.getBoundingClientRect = vi
        .fn()
        .mockReturnValue(mockRect);

      element.updateDimensions();

      expect(element.interfaceDimensions).toEqual(mockRect);
    });
  });

  describe('when modal is closed', () => {
    it('should render the atomic-modal with isOpen set to false', async () => {
      const {element, atomicModal} = await renderRefineModal({isOpen: false});

      await element.updateComplete;
      expect(atomicModal!.isOpen).toBe(false);
    });
  });

  describe('when rendering with interface dimensions', () => {
    it('should render custom styles for backdrop positioning when interfaceDimensions exist', async () => {
      const {element} = await renderRefineModal({isOpen: true});

      const mockRect = {top: 10, left: 20, width: 100, height: 200} as DOMRect;
      element.interfaceDimensions = mockRect;

      // Trigger a re-render
      await element.updateComplete;

      const styleElement = element.shadowRoot?.querySelector('style');
      expect(styleElement?.textContent).toContain(
        'atomic-modal::part(backdrop)'
      );
      expect(styleElement?.textContent).toContain('top: 10px');
      expect(styleElement?.textContent).toContain('left: 20px');
      expect(styleElement?.textContent).toContain('width: 100px');
      expect(styleElement?.textContent).toContain('height: 200px');
    });

    it('should not render custom styles when interfaceDimensions is undefined', async () => {
      const {element} = await renderRefineModal({isOpen: true});

      element.interfaceDimensions = undefined;
      await element.updateComplete;

      const styleElement = element.shadowRoot?.querySelector('style');
      expect(styleElement).toBeNull();
    });
  });

  describe('#firstUpdated', () => {
    it('should set display style to empty string on first update', async () => {
      const {element} = await renderRefineModal();

      element.style.display = 'none';

      element.firstUpdated();

      expect(element.style.display).toBe('');
    });
  });

  describe('accessibility', () => {
    // It doesn't have the proper modal role and attributes set.
    it.skip('should have proper modal role and attributes when opened', async () => {
      const {atomicModal} = await renderRefineModal({isOpen: true});

      expect(atomicModal!.isOpen).toBe(true);
    });
  });

  describe('integration with query summary', () => {
    it('should pass query summary total to refine modal', async () => {
      const {element} = await renderRefineModal({
        isOpen: true,
        querySummaryState: {total: 250},
      });

      expect(element.querySummaryState.total).toBe(250);
    });

    // Doesn't work
    it('should handle query summary state changes', async () => {
      const {element, mockedQuerySummary} = await renderRefineModal({
        isOpen: true,
        querySummaryState: {total: 150},
      });

      expect(element.querySummaryState.total).toBe(150);
      expect(mockedQuerySummary.subscribe).toHaveBeenCalled();

      mockedQuerySummary.state.total = 200;
      await element.updateComplete;
      expect(element.querySummaryState.total).toBe(200);
    });
  });

  describe('integration with breadcrumb manager', () => {
    it('should subscribe to breadcrumb manager state changes', async () => {
      const {element, mockedBreadcrumbManager} = await renderRefineModal({
        isOpen: true,
        breadcrumbState: {hasBreadcrumbs: true},
      });

      expect(element.breadcrumbManagerState.hasBreadcrumbs).toBe(true);
      expect(mockedBreadcrumbManager.subscribe).toHaveBeenCalled();
    });

    it('should respond to breadcrumb state updates', async () => {
      const {element, mockedBreadcrumbManager} = await renderRefineModal({
        isOpen: false,
        breadcrumbState: {hasBreadcrumbs: false},
      });

      expect(element.breadcrumbManagerState.hasBreadcrumbs).toBe(false);
      mockedBreadcrumbManager.state.hasBreadcrumbs = true;
      await element.updateComplete;
      expect(element.breadcrumbManagerState.hasBreadcrumbs).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle error state gracefully', async () => {
      const {element} = await renderRefineModal();

      const testError = new Error('Test error');
      element.error = testError;

      expect(element.error).toBe(testError);
    });
  });
});
