import {
  buildSearchStatus,
  buildSort,
  buildTabManager,
  loadSortCriteriaActions,
  type SearchStatusState,
  SortBy,
  SortOrder,
  type SortState,
  type TabManagerState,
} from '@coveo/headless';
import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeSort} from '@/vitest-utils/testing-helpers/fixtures/headless/search/sort-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import type {AtomicSortDropdown} from './atomic-sort-dropdown';
import './atomic-sort-dropdown';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-sort-dropdown', () => {
  const mockedSortBy = vi.fn();

  const renderSortDropdown = async ({
    sortState,
    searchStatusState,
    tabManagerState,
    withChildren = true,
    slotContent = `
      <atomic-sort-expression label="relevance" expression="relevancy"></atomic-sort-expression>
      <atomic-sort-expression label="most-recent" expression="date descending"></atomic-sort-expression>
      <atomic-sort-expression label="price-ascending" expression="sncost ascending"></atomic-sort-expression>
    `,
  }: {
    sortState?: Partial<SortState>;
    searchStatusState?: Partial<SearchStatusState>;
    tabManagerState?: Partial<TabManagerState>;
    withChildren?: boolean;
    slotContent?: string;
  } = {}) => {
    vi.mocked(buildSort).mockReturnValue(
      buildFakeSort({
        state: {sortCriteria: 'relevancy', ...sortState},
        implementation: {sortBy: mockedSortBy},
      })
    );
    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({
        hasError: false,
        hasResults: true,
        firstSearchExecuted: true,
        isLoading: false,
        ...searchStatusState,
      })
    );
    vi.mocked(buildTabManager).mockReturnValue(
      buildFakeTabManager({
        activeTab: tabManagerState?.activeTab || 'All',
        ...tabManagerState,
      })
    );

    const {element} = await renderInAtomicSearchInterface<AtomicSortDropdown>({
      template: html`<atomic-sort-dropdown
        >${withChildren ? unsafeHTML(slotContent) : ''}</atomic-sort-dropdown
      >`,
      selector: 'atomic-sort-dropdown',
      bindings: (bindings) => {
        bindings.store.state.sortOptions = [
          {
            criteria: [{by: SortBy.Relevancy}],
            expression: 'relevancy',
            tabs: {included: [], excluded: []},
            label: 'relevance',
          },
          {
            criteria: [{by: SortBy.Date, order: SortOrder.Descending}],
            expression: 'date descending',
            tabs: {included: [], excluded: []},
            label: 'most-recent',
          },
        ];
        return bindings;
      },
    });

    await element.updateComplete;

    return {
      element,
      get select() {
        return page.getByRole('combobox');
      },
      get options() {
        return Array.from(
          element.shadowRoot?.querySelectorAll('[part="select"] option') || []
        );
      },
      get label() {
        return element.shadowRoot?.querySelector('[part="label"]');
      },
      get selectParent() {
        return element.shadowRoot?.querySelector('[part="select-parent"]');
      },
      get selectSeparator() {
        return element.shadowRoot?.querySelector('[part="select-separator"]');
      },
      get placeholder() {
        return element.shadowRoot?.querySelector('[part="placeholder"]');
      },
    };
  };

  describe('initialization', () => {
    it('should render correctly', async () => {
      const {element} = await renderSortDropdown();
      expect(element).toBeDefined();
    });

    it('should call buildSort with engine', async () => {
      const {element} = await renderSortDropdown();
      const buildSortMock = vi.mocked(buildSort);

      expect(buildSort).toHaveBeenCalledWith(element.bindings.engine, {
        initialState: {
          criterion: element.bindings.store.state.sortOptions[0]?.criteria,
        },
      });
      expect(element.sort).toBe(buildSortMock.mock.results[0].value);
    });

    it('should call buildSearchStatus with engine', async () => {
      const {element} = await renderSortDropdown();
      const buildSearchStatusMock = vi.mocked(buildSearchStatus);

      expect(buildSearchStatus).toHaveBeenCalledExactlyOnceWith(
        element.bindings.engine
      );
      expect(element.searchStatus).toBe(
        buildSearchStatusMock.mock.results[0].value
      );
    });

    it('should call buildTabManager with engine', async () => {
      const {element} = await renderSortDropdown();
      const buildTabManagerMock = vi.mocked(buildTabManager);

      expect(buildTabManager).toHaveBeenCalledExactlyOnceWith(
        element.bindings.engine
      );
      expect(element.tabManager).toBe(
        buildTabManagerMock.mock.results[0].value
      );
    });

    it('should set error when no sort expressions are provided', async () => {
      const {element} = await renderSortDropdown({withChildren: false});

      expect(element.error).toBeDefined();
      expect(element.error.message).toContain(
        'requires at least one "atomic-sort-expression" child'
      );
    });
  });

  describe('rendering', () => {
    it('should render all shadow parts', async () => {
      const {label, selectParent, select, selectSeparator} =
        await renderSortDropdown();

      await expect(label).toBeInTheDocument();
      await expect(selectParent).toBeInTheDocument();
      await expect(select).toBeInTheDocument();
      await expect(selectSeparator).toBeInTheDocument();
    });

    it('should render dropdown with all options', async () => {
      const {select, options} = await renderSortDropdown();

      await expect.element(select).toBeInTheDocument();
      expect(options).toHaveLength(3);
    });

    it('should render the label correctly', async () => {
      const {label} = await renderSortDropdown();

      await expect(label).toHaveTextContent('Sort by:');
    });

    it('should display the localized label for options', async () => {
      const {options} = await renderSortDropdown();

      expect(options[0]).toHaveTextContent('Relevance');
    });

    it('should render placeholder when firstSearchExecuted is false', async () => {
      const {placeholder} = await renderSortDropdown({
        searchStatusState: {firstSearchExecuted: false},
      });

      await expect(placeholder).toBeInTheDocument();
    });

    it('should not render when hasError is true', async () => {
      const {select} = await renderSortDropdown({
        searchStatusState: {hasError: true},
      });

      await expect(select).not.toBeInTheDocument();
    });

    it('should not render when hasResults is false', async () => {
      const {select} = await renderSortDropdown({
        searchStatusState: {hasResults: false},
      });

      await expect(select).not.toBeInTheDocument();
    });
  });

  describe('selecting options', () => {
    it('should call sort.sortBy when an option is selected', async () => {
      const {select} = await renderSortDropdown();

      await select.selectOptions('date descending');

      expect(mockedSortBy).toHaveBeenCalled();
    });
  });

  describe('tab filtering', () => {
    it('should filter options based on active tab', async () => {
      const {options} = await renderSortDropdown({
        slotContent: `
          <atomic-sort-expression label="all-tabs" expression="relevancy"></atomic-sort-expression>
          <atomic-sort-expression label="tab1-only" expression="date descending" tabs-included='["tab1"]'></atomic-sort-expression>
          <atomic-sort-expression label="tab2-only" expression="sncost ascending" tabs-included='["tab2"]'></atomic-sort-expression>
        `,
        tabManagerState: {activeTab: 'tab1'},
      });

      // Should show "all-tabs" and "tab1-only", but not "tab2-only"
      expect(options).toHaveLength(2);
    });
  });

  describe('updated lifecycle', () => {
    it('should update sort criteria when no matching option is found', async () => {
      const updateSortCriterionMock = vi.fn();
      vi.mocked(loadSortCriteriaActions).mockReturnValue({
        updateSortCriterion: updateSortCriterionMock,
      } as never);

      const {element} = await renderSortDropdown({
        sortState: {sortCriteria: 'unknownCriteria'},
      });

      element.requestUpdate();
      await element.updateComplete;

      expect(loadSortCriteriaActions).toHaveBeenCalledWith(
        element.bindings.engine
      );
      expect(updateSortCriterionMock).toHaveBeenCalled();
      expect(element.bindings.engine.dispatch).toHaveBeenCalled();
    });
  });

  describe('controller state binding', () => {
    it('should bind sortState to sort controller', async () => {
      const {element} = await renderSortDropdown({
        sortState: {sortCriteria: 'date descending'},
      });

      expect(element.sortState.sortCriteria).toBe('date descending');
    });

    it('should bind tabManagerState to tabManager controller', async () => {
      const {element} = await renderSortDropdown({
        tabManagerState: {activeTab: 'myTab'},
      });

      expect(element.tabManagerState.activeTab).toBe('myTab');
    });
  });
});
