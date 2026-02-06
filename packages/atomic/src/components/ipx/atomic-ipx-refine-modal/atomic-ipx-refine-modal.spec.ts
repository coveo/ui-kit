import {
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  buildBreadcrumbManager,
  buildQuerySummary,
  type QuerySummary,
  type QuerySummaryState,
} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/breadcrumb-manager';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/search/summary-controller';
import type {AtomicIpxRefineModal} from './atomic-ipx-refine-modal';
import './atomic-ipx-refine-modal';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-ipx-refine-modal', () => {
  const mockedEngine = buildFakeSearchEngine();
  let mockedBreadcrumbManager: BreadcrumbManager;
  let mockedQuerySummary: QuerySummary;

  const parts = (element: AtomicIpxRefineModal) => {
    const qs = (part: string) =>
      element.shadowRoot?.querySelector(`[part="${part}"]`);
    const qsStar = (part: string) =>
      element.shadowRoot?.querySelector(`[part*="${part}"]`);
    return {
      title: qs('title'),
      closeButton: qs('close-button'),
      closeIcon: qs('close-icon'),
      footerContent: qs('footer-content'),
      footerButton: qs('footer-button'),
      footerButtonText: qs('footer-button-text'),
      footerButtonCount: qs('footer-button-count'),
      content: qs('content'),
      filterSection: qs('filter-section'),
      sectionFiltersTitle: qsStar('section-filters-title'),
      filterClearAll: qs('filter-clear-all'),
      sectionTitle: qsStar('section-title'),
    };
  };

  const renderIpxRefineModal = async (
    options: {
      isOpen?: boolean;
      collapseFacetsAfter?: number;
      querySummaryState?: Partial<QuerySummaryState>;
      breadcrumbManagerState?: Partial<BreadcrumbManagerState>;
    } = {}
  ) => {
    const {
      isOpen = true,
      collapseFacetsAfter,
      querySummaryState,
      breadcrumbManagerState,
    } = options;

    mockedBreadcrumbManager = buildFakeBreadcrumbManager({
      state: breadcrumbManagerState,
    });
    mockedQuerySummary = buildFakeSummary({state: querySummaryState});

    vi.mocked(buildBreadcrumbManager).mockReturnValue(mockedBreadcrumbManager);
    vi.mocked(buildQuerySummary).mockReturnValue(mockedQuerySummary);

    const {element} = await renderInAtomicSearchInterface<AtomicIpxRefineModal>(
      {
        template: html`<atomic-ipx-refine-modal
          ?is-open=${isOpen}
          collapse-facets-after=${ifDefined(collapseFacetsAfter)}
        ></atomic-ipx-refine-modal>`,
        selector: 'atomic-ipx-refine-modal',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          bindings.store.getFacetElements = () => [
            document.createElement('div'),
            document.createElement('div'),
          ];
          return bindings;
        },
      }
    );

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
      aside: element.shadowRoot?.querySelector('aside[part="content"]'),
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should build breadcrumb manager with engine', async () => {
    const {element} = await renderIpxRefineModal();

    expect(buildBreadcrumbManager).toHaveBeenCalledWith(mockedEngine);
    expect(element.breadcrumbManager).toBe(mockedBreadcrumbManager);
  });

  it('should build query summary with engine', async () => {
    const {element} = await renderIpxRefineModal();

    expect(buildQuerySummary).toHaveBeenCalledWith(mockedEngine);
    expect(element.querySummary).toBe(mockedQuerySummary);
  });

  it('should bind query summary state to controller', async () => {
    const {element} = await renderIpxRefineModal({
      querySummaryState: {total: 42},
    });

    expect(element.querySummaryState.total).toBe(42);
  });

  describe('rendering', () => {
    it('should render modal when isOpen is true', async () => {
      const {atomicModal} = await renderIpxRefineModal({isOpen: true});

      expect(atomicModal).toBeInTheDocument();
    });

    it('should render the title with "Filters"', async () => {
      const {title} = await renderIpxRefineModal();

      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Filters');
    });

    it('should render the close button', async () => {
      const {closeButton} = await renderIpxRefineModal();

      expect(closeButton).toBeInTheDocument();
    });

    it('should render the close icon', async () => {
      const {closeIcon} = await renderIpxRefineModal();

      expect(closeIcon).toBeInTheDocument();
    });

    it('should render the footer content', async () => {
      const {footerContent} = await renderIpxRefineModal();

      expect(footerContent).toBeInTheDocument();
    });

    it('should render the footer button', async () => {
      const {footerButton} = await renderIpxRefineModal();

      expect(footerButton).toBeInTheDocument();
    });

    it('should render the footer button text with "View"', async () => {
      const {footerButtonText} = await renderIpxRefineModal();

      expect(footerButtonText).toBeInTheDocument();
      expect(footerButtonText).toHaveTextContent('View');
    });

    it('should render the footer button count', async () => {
      const {footerButtonCount} = await renderIpxRefineModal({
        querySummaryState: {total: 123},
      });

      expect(footerButtonCount).toBeInTheDocument();
      expect(footerButtonCount).toHaveTextContent('123');
    });
  });

  describe('filters section', () => {
    it('should render the filter section', async () => {
      const {filterSection} = await renderIpxRefineModal();

      expect(filterSection).toBeInTheDocument();
      expect(filterSection).toHaveAttribute('part', 'filter-section');
    });

    it('should render the filters section title', async () => {
      const {sectionFiltersTitle} = await renderIpxRefineModal();

      expect(sectionFiltersTitle).toBeInTheDocument();
      expect(sectionFiltersTitle).toHaveAttribute(
        'part',
        'section-title section-filters-title'
      );
      expect(sectionFiltersTitle).toHaveTextContent('Filters');
    });

    it('should render the facet slot', async () => {
      const {facetSlot} = await renderIpxRefineModal();

      expect(facetSlot).toBeInTheDocument();
    });

    it('should render filter clear all button when hasBreadcrumbs is true', async () => {
      const {filterClearAllButton} = await renderIpxRefineModal({
        breadcrumbManagerState: {hasBreadcrumbs: true},
      });

      expect(filterClearAllButton).toBeInTheDocument();
      expect(filterClearAllButton).toHaveAttribute('part', 'filter-clear-all');
      expect(filterClearAllButton).toHaveTextContent('Clear');
    });

    it('should not render filter clear all button when hasBreadcrumbs is false', async () => {
      const {filterClearAllButton} = await renderIpxRefineModal({
        breadcrumbManagerState: {hasBreadcrumbs: false},
      });

      expect(filterClearAllButton).not.toBeInTheDocument();
    });

    it('should call breadcrumbManager.deselectAll when clear button is clicked', async () => {
      const {filterClearAllButton} = await renderIpxRefineModal({
        breadcrumbManagerState: {hasBreadcrumbs: true},
      });

      await userEvent.click(filterClearAllButton!);

      expect(mockedBreadcrumbManager.deselectAll).toHaveBeenCalled();
    });

    it('should not render filters section when no facets', async () => {
      const {element, filterSection} = await renderIpxRefineModal();
      element.bindings.store.getFacetElements = () => [];
      element.requestUpdate();
      await element.updateComplete;

      expect(filterSection).not.toBeInTheDocument();
    });
  });

  describe('properties', () => {
    it('should accept collapseFacetsAfter property', async () => {
      const {element} = await renderIpxRefineModal({
        collapseFacetsAfter: 3,
      });

      expect(element.collapseFacetsAfter).toBe(3);
    });

    it('should accept isOpen property', async () => {
      const {element} = await renderIpxRefineModal({
        isOpen: false,
      });

      expect(element.isOpen).toBe(false);
    });
  });

  describe('close behavior', () => {
    it('should set isOpen to false when close button is clicked', async () => {
      const {element, closeButton} = await renderIpxRefineModal({isOpen: true});

      expect(element.isOpen).toBe(true);

      await userEvent.click(closeButton!);

      expect(element.isOpen).toBe(false);
    });
  });

  describe('parts', () => {
    it('should render all parts', async () => {
      const {element} = await renderIpxRefineModal({
        breadcrumbManagerState: {hasBreadcrumbs: true},
      });

      Object.entries(parts(element)).forEach(([_key, el]) => {
        expect(el).toBeInTheDocument();
      });
    });
  });
});
