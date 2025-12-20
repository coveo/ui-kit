import {
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  buildBreadcrumbManager,
  buildFacetManager,
  buildQuerySummary,
  buildSearchStatus,
  buildSort,
  buildTabManager,
  type FacetManager,
  type FacetManagerState,
  type QuerySummary,
  type QuerySummaryState,
  type SearchStatus,
  type Sort,
  type SortCriterion,
  type SortState,
  type TabManager,
  type TabManagerState,
} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/breadcrumb-manager';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeFacetManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-manager';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeSort} from '@/vitest-utils/testing-helpers/fixtures/headless/search/sort-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/search/summary-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import type {AtomicRefineModal} from './atomic-refine-modal';
import './atomic-refine-modal';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-refine-modal', () => {
  const mockedEngine = buildFakeSearchEngine();
  let mockedBreadcrumbManager: BreadcrumbManager;
  let mockedSort: Sort;
  let mockedQuerySummary: QuerySummary;
  let mockedSearchStatus: SearchStatus;
  let mockedFacetManager: FacetManager;
  let mockedTabManager: TabManager;

  const parts = (element: AtomicRefineModal) => {
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
      select: qs('select'),
      sortTitle: qsStar('section-sort-title'),
      selectWrapper: qs('select-wrapper'),
      selectIconWrapper: qs('select-icon-wrapper'),
      selectIcon: qs('select-icon'),
      filterSection: qs('filter-section'),
      sectionFiltersTitle: qsStar('section-filters-title'),
      filterClearAll: qs('filter-clear-all'),
      sectionTitle: qsStar('section-title'),
    };
  };

  const renderRefineModal = async (
    options: {
      isOpen?: boolean;
      collapseFacetsAfter?: number;
      sortState?: Partial<SortState>;
      querySummaryState?: Partial<QuerySummaryState>;
      breadcrumbManagerState?: Partial<BreadcrumbManagerState>;
      facetManagerState?: Partial<FacetManagerState>;
      tabManagerState?: Partial<TabManagerState>;
      sortOptions?: Array<{
        expression: string;
        criteria: Array<{by: string; order?: string}>;
        label: string;
        tabs: {included: string[]; excluded: string[]};
      }>;
    } = {}
  ) => {
    const {
      isOpen = true,
      collapseFacetsAfter,
      sortState,
      querySummaryState,
      breadcrumbManagerState,
      facetManagerState,
      tabManagerState,
      sortOptions = [
        {
          expression: 'relevancy',
          criteria: [
            {
              by: 'relevancy' as const,
            },
          ],
          label: 'Relevance',
          tabs: {included: [], excluded: []},
        },
      ],
    } = options;

    mockedBreadcrumbManager = buildFakeBreadcrumbManager({
      state: breadcrumbManagerState,
    });
    mockedSort = buildFakeSort({state: sortState});
    mockedQuerySummary = buildFakeSummary({state: querySummaryState});
    mockedSearchStatus = buildFakeSearchStatus();
    mockedFacetManager = buildFakeFacetManager({state: facetManagerState});
    mockedTabManager = buildFakeTabManager({state: tabManagerState});

    vi.mocked(buildBreadcrumbManager).mockReturnValue(mockedBreadcrumbManager);
    vi.mocked(buildSort).mockReturnValue(mockedSort);
    vi.mocked(buildQuerySummary).mockReturnValue(mockedQuerySummary);
    vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);
    vi.mocked(buildFacetManager).mockReturnValue(mockedFacetManager);
    vi.mocked(buildTabManager).mockReturnValue(mockedTabManager);

    const {element} = await renderInAtomicSearchInterface<AtomicRefineModal>({
      template: html`<atomic-refine-modal
          ?is-open=${isOpen}
          collapse-facets-after=${ifDefined(collapseFacetsAfter)}
        ></atomic-refine-modal>`,
      selector: 'atomic-refine-modal',
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        bindings.store.state.sortOptions = sortOptions;
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

  it('should build breadcrumb manager with engine', async () => {
    const {element} = await renderRefineModal();

    expect(buildBreadcrumbManager).toHaveBeenCalledWith(mockedEngine);
    expect(element.breadcrumbManager).toBe(mockedBreadcrumbManager);
  });

  it('should build sort with engine', async () => {
    const {element} = await renderRefineModal();

    expect(buildSort).toHaveBeenCalledWith(mockedEngine);
    expect(element.sort).toBe(mockedSort);
  });

  it('should build query summary with engine', async () => {
    const {element} = await renderRefineModal();

    expect(buildQuerySummary).toHaveBeenCalledWith(mockedEngine);
    expect(element.querySummary).toBe(mockedQuerySummary);
  });

  it('should build search status with engine', async () => {
    const {element} = await renderRefineModal();

    expect(buildSearchStatus).toHaveBeenCalledWith(mockedEngine);
    expect(element.searchStatus).toBe(mockedSearchStatus);
  });

  it('should build facet manager with engine', async () => {
    const {element} = await renderRefineModal();

    expect(buildFacetManager).toHaveBeenCalledWith(mockedEngine);
    expect(element.facetManager).toBe(mockedFacetManager);
  });

  it('should build tab manager with engine', async () => {
    const {element} = await renderRefineModal();

    expect(buildTabManager).toHaveBeenCalledWith(mockedEngine);
    expect(element.tabManager).toBe(mockedTabManager);
  });

  it('should bind query summary state to controller', async () => {
    const {element} = await renderRefineModal({
      querySummaryState: {total: 42},
    });

    expect(element.querySummaryState.total).toBe(42);
  });

  it('should bind sort state to controller', async () => {
    const {element} = await renderRefineModal({
      sortState: {
        sortCriteria: 'relevancy' as unknown as SortCriterion,
      },
    });

    expect(element.sortState.sortCriteria).toBe('relevancy');
  });

  it('should bind breadcrumb manager state to controller', async () => {
    const {element} = await renderRefineModal({
      breadcrumbManagerState: {hasBreadcrumbs: true},
    });

    expect(element.breadcrumbManagerState?.hasBreadcrumbs).toBe(true);
  });

  it('should bind facet manager state to controller', async () => {
    const {element} = await renderRefineModal({
      facetManagerState: {},
    });

    expect(element.facetManagerState).toBeDefined();
  });

  it('should bind tab manager state to controller', async () => {
    const {element} = await renderRefineModal({
      tabManagerState: {},
    });

    expect(element.tabManagerState).toBeDefined();
  });

  describe('rendering', () => {
    it('should render modal when isOpen is true', async () => {
      const {atomicModal} = await renderRefineModal({isOpen: true});

      expect(atomicModal).toBeInTheDocument();
    });

    it('should render the title', async () => {
      const {title} = await renderRefineModal();

      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Sort & Filter');
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

  describe('sort section', () => {
    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should render the sort title', async () => {
      const {sortTitle} = await renderRefineModal();

      expect(sortTitle).toBeInTheDocument();
      expect(sortTitle).toHaveTextContent('Sort');
    });

    it('should render the select wrapper', async () => {
      const {selectWrapper} = await renderRefineModal();

      expect(selectWrapper).toBeInTheDocument();
      expect(selectWrapper).toHaveAttribute('part', 'select-wrapper');
    });

    it('should render the select element', async () => {
      const {select} = await renderRefineModal();

      expect(select).toBeInTheDocument();
      expect(select).toHaveAttribute('part', 'select');
    });

    it('should render the select element with aria-label', async () => {
      const {select} = await renderRefineModal();

      expect(select).toHaveAttribute('aria-label', 'Sort by');
    });

    it('should render the select icon wrapper', async () => {
      const {selectIconWrapper} = await renderRefineModal();

      expect(selectIconWrapper).toBeInTheDocument();
      expect(selectIconWrapper).toHaveAttribute('part', 'select-icon-wrapper');
    });

    it('should render the select icon', async () => {
      const {selectIcon} = await renderRefineModal();

      expect(selectIcon).toBeInTheDocument();
      expect(selectIcon).toHaveAttribute('part', 'select-icon');
    });

    it('should call sort.sortBy when select changes', async () => {
      const {element, select} = await renderRefineModal();
      element.bindings.store.state.sortOptions = [
        {
          expression: 'relevancy',
          criteria: [{by: 'relevancy' as const}],
          label: 'Relevance',
          tabs: {included: [], excluded: []},
        },
        {
          expression: 'date descending',
          criteria: [{by: 'date' as const, order: 'descending' as const}],
          label: 'Date (Newest)',
          tabs: {included: [], excluded: []},
        },
      ];
      element.requestUpdate();
      await element.updateComplete;

      await userEvent.selectOptions(select!, 'date descending');

      expect(mockedSort.sortBy).toHaveBeenCalledWith([
        {by: 'date', order: 'descending'},
      ]);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should not render sort section when no sort options', async () => {
      const {sortTitle} = await renderRefineModal({sortOptions: []});

      expect(sortTitle).not.toBeInTheDocument();
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

    it('should not render filters section when no facets or automatic facets', async () => {
      const {element, filterSection} = await renderRefineModal();
      element.bindings.store.getFacetElements = () => [];
      element.bindings.engine.state.automaticFacetSet = undefined;
      element.requestUpdate();
      await element.updateComplete;

      expect(filterSection).not.toBeInTheDocument();
    });
  });

  describe('properties', () => {
    it('should accept collapseFacetsAfter property', async () => {
      const {element} = await renderRefineModal({
        collapseFacetsAfter: 3,
      });

      expect(element.collapseFacetsAfter).toBe(3);
    });

    it('should accept isOpen property', async () => {
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
  });

  describe('parts', () => {
    it('should render all parts', async () => {
      const {element} = await renderRefineModal({
        breadcrumbManagerState: {hasBreadcrumbs: true},
      });

      Object.entries(parts(element)).forEach(([_key, el]) => {
        expect(el).toBeInTheDocument();
      });
    });
  });
});
