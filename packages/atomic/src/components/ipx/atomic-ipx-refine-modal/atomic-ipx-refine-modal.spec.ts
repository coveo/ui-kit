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
import {describe, expect, it, vi} from 'vitest';
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
      footerButtonText: element.shadowRoot?.querySelector(
        '[part="footer-button-text"]'
      ),
      footerButtonCount: element.shadowRoot?.querySelector(
        '[part="footer-button-count"]'
      ),
      filterSection: element.shadowRoot?.querySelector(
        '[part="filter-section"]'
      ),
      sectionFiltersTitle: element.shadowRoot?.querySelector(
        '[part*="section-filters-title"]'
      ),
      filterClearAllButton: element.shadowRoot?.querySelector(
        '[part="filter-clear-all"]'
      ),
    };
  };

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

  it('should bind breadcrumb manager state to controller', async () => {
    const {element} = await renderIpxRefineModal({
      breadcrumbManagerState: {hasBreadcrumbs: true},
    });

    expect(element.breadcrumbManagerState?.hasBreadcrumbs).toBe(true);
  });

  describe('facet slot', () => {
    it('should populate facet slot when isOpen is true', async () => {
      const {element} = await renderIpxRefineModal({isOpen: true});

      const facetSlotContainer = element.querySelector('[slot="facets"]');
      expect(facetSlotContainer).toBeInTheDocument();
      expect(facetSlotContainer?.children.length).toBe(2);
    });

    it('should not duplicate facet slot when reopened', async () => {
      const {element} = await renderIpxRefineModal({isOpen: true});

      element.isOpen = false;
      await element.updateComplete;
      element.isOpen = true;
      await element.updateComplete;

      const facetSlotContainers = element.querySelectorAll('[slot="facets"]');
      expect(facetSlotContainers.length).toBe(1);
    });
  });

  describe('rendering', () => {
    it('should render the title with "Filters"', async () => {
      const {title} = await renderIpxRefineModal();

      expect(title).toHaveTextContent('Filters');
    });

    it('should render the footer button text with "View"', async () => {
      const {footerButtonText} = await renderIpxRefineModal();

      expect(footerButtonText).toHaveTextContent('View');
    });

    it('should render the footer button count', async () => {
      const {footerButtonCount} = await renderIpxRefineModal({
        querySummaryState: {total: 123},
      });

      expect(footerButtonCount).toHaveTextContent('123');
    });
  });

  describe('filters section', () => {
    it('should render the filters section title', async () => {
      const {sectionFiltersTitle} = await renderIpxRefineModal();

      expect(sectionFiltersTitle).toHaveAttribute(
        'part',
        'section-title section-filters-title'
      );
      expect(sectionFiltersTitle).toHaveTextContent('Filters');
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

      const expectedParts = [
        'title',
        'close-button',
        'close-icon',
        'footer-content',
        'footer-button',
        'footer-button-text',
        'footer-button-count',
        'content',
        'filter-section',
        'filter-clear-all',
      ];

      const expectedWildcardParts = ['section-filters-title', 'section-title'];

      for (const part of expectedParts) {
        expect(
          element.shadowRoot?.querySelector(`[part="${part}"]`),
          `Part "${part}" should be in document`
        ).toBeInTheDocument();
      }

      for (const part of expectedWildcardParts) {
        expect(
          element.shadowRoot?.querySelector(`[part*="${part}"]`),
          `Part "${part}" should be in document`
        ).toBeInTheDocument();
      }
    });
  });
});
