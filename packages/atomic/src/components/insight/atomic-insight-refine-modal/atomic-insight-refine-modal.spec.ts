import {
  buildBreadcrumbManager as buildInsightBreadcrumbManager,
  buildQuerySummary as buildInsightQuerySummary,
  type BreadcrumbManager as InsightBreadcrumbManager,
  type BreadcrumbManagerState as InsightBreadcrumbManagerState,
  type QuerySummary as InsightQuerySummary,
  type QuerySummaryState as InsightQuerySummaryState,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/breadcrumb-manager';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/query-summary-controller';
import type {AtomicInsightRefineModal} from './atomic-insight-refine-modal';
import './atomic-insight-refine-modal';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-refine-modal', () => {
  const mockedEngine = buildFakeInsightEngine();
  let mockedBreadcrumbManager: InsightBreadcrumbManager;
  let mockedQuerySummary: InsightQuerySummary;

  const renderRefineModal = async (
    options: {
      isOpen?: boolean;
      querySummaryState?: Partial<InsightQuerySummaryState>;
      breadcrumbManagerState?: Partial<InsightBreadcrumbManagerState>;
    } = {}
  ) => {
    const {isOpen = true, querySummaryState, breadcrumbManagerState} = options;

    mockedBreadcrumbManager = buildFakeBreadcrumbManager({
      state: breadcrumbManagerState,
    });
    mockedQuerySummary = buildFakeSummary({state: querySummaryState});

    vi.mocked(buildInsightBreadcrumbManager).mockReturnValue(
      mockedBreadcrumbManager
    );
    vi.mocked(buildInsightQuerySummary).mockReturnValue(mockedQuerySummary);

    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightRefineModal>({
        template: html`<atomic-insight-refine-modal
        ?is-open=${isOpen}
      ></atomic-insight-refine-modal>`,
        selector: 'atomic-insight-refine-modal',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          bindings.store.getFacetElements = () => [
            document.createElement('div'),
            document.createElement('div'),
          ];
          bindings.store.getAllFacets = () => ({
            '1': {
              facetId: '1',
              label: () => 'Test Facet',
              element: document.createElement('div'),
              isHidden: () => false,
            },
          });
          return bindings;
        },
      });

    return {
      element,
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

  describe('#initialize', () => {
    it('should build breadcrumb manager with engine', async () => {
      const {element} = await renderRefineModal();

      expect(buildInsightBreadcrumbManager).toHaveBeenCalledWith(mockedEngine);
      expect(element.breadcrumbManager).toBe(mockedBreadcrumbManager);
    });

    it('should build query summary with engine', async () => {
      const {element} = await renderRefineModal();

      expect(buildInsightQuerySummary).toHaveBeenCalledWith(mockedEngine);
      expect(element.querySummary).toBe(mockedQuerySummary);
    });
  });

  describe('state binding', () => {
    it('should bind query summary state to controller', async () => {
      const {element} = await renderRefineModal({
        querySummaryState: {total: 42},
      });

      expect(element.querySummaryState.total).toBe(42);
    });

    it('should bind breadcrumb manager state to controller', async () => {
      const {element} = await renderRefineModal({
        breadcrumbManagerState: {hasBreadcrumbs: true},
      });

      expect(element.breadcrumbManagerState?.hasBreadcrumbs).toBe(true);
    });
  });

  describe('rendering', () => {
    it('should render modal when isOpen is true', async () => {
      const {atomicModal} = await renderRefineModal({isOpen: true});

      expect(atomicModal).toBeInTheDocument();
    });

    it('should render the title', async () => {
      const {title} = await renderRefineModal();

      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Filters');
    });

    it('should render the close button', async () => {
      const {closeButton} = await renderRefineModal();

      expect(closeButton).toBeInTheDocument();
    });

    it('should render the close icon', async () => {
      const {closeIcon} = await renderRefineModal();

      expect(closeIcon).toBeInTheDocument();
    });

    it('should render the footer content', async () => {
      const {footerContent} = await renderRefineModal();

      expect(footerContent).toBeInTheDocument();
    });

    it('should render the footer button', async () => {
      const {footerButton} = await renderRefineModal();

      expect(footerButton).toBeInTheDocument();
    });

    it('should render the footer button text', async () => {
      const {footerButtonText} = await renderRefineModal();

      expect(footerButtonText).toBeInTheDocument();
      expect(footerButtonText).toHaveTextContent('View');
    });

    it('should render the footer button count', async () => {
      const {footerButtonCount} = await renderRefineModal({
        querySummaryState: {total: 123},
      });

      expect(footerButtonCount).toBeInTheDocument();
      expect(footerButtonCount).toHaveTextContent('123');
    });
  });

  describe('filters section', () => {
    it('should render the filter section', async () => {
      const {filterSection} = await renderRefineModal();

      expect(filterSection).toBeInTheDocument();
      expect(filterSection).toHaveAttribute('part', 'filter-section');
    });

    it('should render the filters section title', async () => {
      const {sectionFiltersTitle} = await renderRefineModal();

      expect(sectionFiltersTitle).toBeInTheDocument();
      expect(sectionFiltersTitle).toHaveAttribute(
        'part',
        'section-title section-filters-title'
      );
      expect(sectionFiltersTitle).toHaveTextContent('Filters');
    });

    it('should render the facet slot', async () => {
      const {facetSlot} = await renderRefineModal();

      expect(facetSlot).toBeInTheDocument();
    });

    it('should render filter clear all button when hasBreadcrumbs is true', async () => {
      const {filterClearAllButton} = await renderRefineModal({
        breadcrumbManagerState: {hasBreadcrumbs: true},
      });

      expect(filterClearAllButton).toBeInTheDocument();
      expect(filterClearAllButton).toHaveAttribute('part', 'filter-clear-all');
      expect(filterClearAllButton).toHaveTextContent('Clear');
    });

    it('should not render filter clear all button when hasBreadcrumbs is false', async () => {
      const {filterClearAllButton} = await renderRefineModal({
        breadcrumbManagerState: {hasBreadcrumbs: false},
      });

      expect(filterClearAllButton).not.toBeInTheDocument();
    });

    it('should call breadcrumbManager.deselectAll when clear button is clicked', async () => {
      const {filterClearAllButton} = await renderRefineModal({
        breadcrumbManagerState: {hasBreadcrumbs: true},
      });

      await userEvent.click(filterClearAllButton!);

      expect(mockedBreadcrumbManager.deselectAll).toHaveBeenCalled();
    });

    it('should not render filters section when no facets', async () => {
      const {element, filterSection} = await renderRefineModal();
      element.bindings.store.getFacetElements = () => [];
      element.requestUpdate();
      await element.updateComplete;

      expect(filterSection).not.toBeInTheDocument();
    });
  });

  describe('properties', () => {
    it('should accept isOpen property', async () => {
      const {element} = await renderRefineModal({
        isOpen: false,
      });

      expect(element.isOpen).toBe(false);
    });

    it('should default isOpen to false', async () => {
      const {element} = await renderRefineModal({
        isOpen: false,
      });

      expect(element.isOpen).toBe(false);
    });
  });

  describe('close behavior', () => {
    it('should set isOpen to false when close button is clicked', async () => {
      const {element, closeButton} = await renderRefineModal({isOpen: true});

      expect(element.isOpen).toBe(true);

      await userEvent.click(closeButton!);

      expect(element.isOpen).toBe(false);
    });

    it('should set isOpen to false when footer button is clicked', async () => {
      const {element, footerButton} = await renderRefineModal({isOpen: true});

      expect(element.isOpen).toBe(true);

      await userEvent.click(footerButton!);

      expect(element.isOpen).toBe(false);
    });
  });

  describe('#connectedCallback', () => {
    it('should set display style to empty string', async () => {
      const {element} = await renderRefineModal();

      expect(element.style.display).toBe('');
    });
  });

  describe('#watchEnabled', () => {
    it('should append facet slot when modal is opened', async () => {
      const {element} = await renderRefineModal({isOpen: false});

      expect(
        element.querySelector('div[slot="facets"]')
      ).not.toBeInTheDocument();

      element.isOpen = true;
      await element.updateComplete;

      expect(element.querySelector('div[slot="facets"]')).toBeInTheDocument();
    });

    it('should not append duplicate facet slot when already exists', async () => {
      const {element} = await renderRefineModal({isOpen: true});

      const firstSlot = element.querySelector('div[slot="facets"]');
      expect(firstSlot).toBeInTheDocument();

      element.isOpen = false;
      await element.updateComplete;
      element.isOpen = true;
      await element.updateComplete;

      const slots = element.querySelectorAll('div[slot="facets"]');
      expect(slots.length).toBe(1);
    });
  });
});
