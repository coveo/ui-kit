import {
  buildSearchStatus,
  buildSort,
  buildTabManager,
  loadSortCriteriaActions,
  parseCriterionExpression,
  type SearchStatusState,
  type SortState,
  type TabManagerState,
} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeSort} from '@/vitest-utils/testing-helpers/fixtures/headless/search/sort-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import type {AtomicSortDropdown} from './atomic-sort-dropdown';
import './atomic-sort-dropdown';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-sort-dropdown', () => {
  const mockUpdateSortCriterion = vi.fn();

  beforeEach(() => {
    vi.mocked(buildSort).mockReturnValue(buildFakeSort());
    vi.mocked(buildSearchStatus).mockReturnValue(buildFakeSearchStatus());
    vi.mocked(buildTabManager).mockReturnValue(buildFakeTabManager());
    vi.mocked(loadSortCriteriaActions).mockReturnValue({
      updateSortCriterion: mockUpdateSortCriterion,
    } as ReturnType<typeof loadSortCriteriaActions>);
  });

  const locators = {
    get label() {
      return page.getByText('Sort by');
    },
    get select() {
      return page.getByRole('combobox');
    },
    placeholder(element: HTMLElement) {
      return element.shadowRoot!.querySelector('[part="placeholder"]')!;
    },
  };

  const setupElement = async ({
    sortState,
    searchStatusState,
    tabManagerState,
    slottedContent = `
      <atomic-sort-expression label="relevance" expression="relevancy"></atomic-sort-expression>
      <atomic-sort-expression label="most-recent" expression="date descending"></atomic-sort-expression>
      <atomic-sort-expression label="price-ascending" expression="sncost ascending"></atomic-sort-expression>
    `,
  }: {
    sortState?: Partial<SortState>;
    searchStatusState?: Partial<SearchStatusState>;
    tabManagerState?: Partial<TabManagerState>;
    slottedContent?: string;
  } = {}) => {
    vi.mocked(buildSort).mockReturnValue(buildFakeSort({state: sortState}));
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
      buildFakeTabManager(tabManagerState)
    );

    const {element} = await renderInAtomicSearchInterface<AtomicSortDropdown>({
      template: html`<atomic-sort-dropdown>${slottedContent}</atomic-sort-dropdown>`,
      selector: 'atomic-sort-dropdown',
    });

    return element;
  };

  it('is defined', async () => {
    const el = await setupElement();
    expect(el).toBeInstanceOf(AtomicSortDropdown);
  });

  it('should build sort controller with correct initial state', async () => {
    const el = await setupElement();

    expect(buildSort).toHaveBeenCalledWith(el.bindings.engine, {
      initialState: {
        criterion: el.bindings.store.state.sortOptions[0]?.criteria,
      },
    });
  });

  it('should build searchStatus controller', async () => {
    const el = await setupElement();

    expect(buildSearchStatus).toHaveBeenCalledWith(el.bindings.engine);
  });

  it('should build tabManager controller', async () => {
    const el = await setupElement();

    expect(buildTabManager).toHaveBeenCalledWith(el.bindings.engine);
  });

  it('renders label correctly', async () => {
    await setupElement();

    await expect.element(locators.label).toBeInTheDocument();
  });

  it('renders dropdown select correctly', async () => {
    await setupElement();

    await expect.element(locators.select).toBeInTheDocument();
  });

  it('renders all sort options from slotted atomic-sort-expression elements', async () => {
    await setupElement();

    const options = await page.getByRole('option').all();
    expect(options).toHaveLength(3);
  });

  it('should call sort.sortBy when select is changed', async () => {
    const mockedSortBy = vi.fn();
    vi.mocked(buildSort).mockReturnValue(
      buildFakeSort({implementation: {sortBy: mockedSortBy}})
    );
    vi.mocked(parseCriterionExpression).mockReturnValue({
      by: 'date',
      order: 'descending',
    } as ReturnType<typeof parseCriterionExpression>);

    await setupElement();

    await locators.select.selectOptions('date descending');

    expect(mockedSortBy).toHaveBeenCalled();
  });

  describe('when there is an error', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('renders nothing', async () => {
      const element = await setupElement();
      element.error = new Error('Test error');
      await element.updateComplete;

      await expect.element(locators.label).not.toBeInTheDocument();
      await expect.element(locators.select).not.toBeInTheDocument();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  it('renders nothing when there are no results', async () => {
    await setupElement({
      searchStatusState: {hasResults: false},
    });

    await expect.element(locators.label).not.toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  it('renders nothing when search has error', async () => {
    await setupElement({
      searchStatusState: {hasError: true},
    });

    await expect.element(locators.label).not.toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  it('renders placeholder when first search is not executed', async () => {
    const element = await setupElement({
      searchStatusState: {firstSearchExecuted: false},
    });

    await expect.element(locators.placeholder(element)).toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  describe('when no atomic-sort-expression children are provided', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should set error', async () => {
      const element = await setupElement({slottedContent: ''});

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toContain(
        'requires at least one "atomic-sort-expression" child'
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('tab filtering', () => {
    it('should filter sort expressions based on tabs-included', async () => {
      await setupElement({
        slottedContent: `
          <atomic-sort-expression label="relevance" expression="relevancy"></atomic-sort-expression>
          <atomic-sort-expression label="tab-specific" expression="date descending" tabs-included='["Tab1"]'></atomic-sort-expression>
        `,
        tabManagerState: {activeTab: 'Tab1'},
      });

      // Both options should be visible on Tab1
      const options = await page.getByRole('option').all();
      expect(options.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter sort expressions based on tabs-excluded', async () => {
      await setupElement({
        slottedContent: `
          <atomic-sort-expression label="relevance" expression="relevancy"></atomic-sort-expression>
          <atomic-sort-expression label="excluded-option" expression="date descending" tabs-excluded='["Tab2"]'></atomic-sort-expression>
        `,
        tabManagerState: {activeTab: 'Tab2'},
      });

      // Only relevance option should be visible on Tab2
      const options = await page.getByRole('option').all();
      expect(options.length).toBe(1);
    });
  });

  describe('componentShouldUpdate behavior', () => {
    it('should dispatch updateSortCriterion action when current sort is not in options', async () => {
      const dispatchSpy = vi.fn();
      vi.mocked(parseCriterionExpression).mockReturnValue({
        by: 'relevance',
      } as ReturnType<typeof parseCriterionExpression>);

      const {element} = await renderInAtomicSearchInterface<AtomicSortDropdown>(
        {
          template: html`<atomic-sort-dropdown>
          <atomic-sort-expression label="relevance" expression="relevancy"></atomic-sort-expression>
        </atomic-sort-dropdown>`,
          selector: 'atomic-sort-dropdown',
          bindings: (bindings) => {
            bindings.engine.dispatch = dispatchSpy;
            return bindings;
          },
        }
      );

      // Trigger update by changing state
      element.sortState = {sortCriteria: 'nonexistent criteria'};
      await element.updateComplete;

      expect(dispatchSpy).toHaveBeenCalled();
    });
  });
});
