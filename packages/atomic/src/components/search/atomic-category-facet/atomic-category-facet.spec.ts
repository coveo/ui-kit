import {
  buildCategoryFacet,
  buildFacetConditionsManager,
  buildSearchStatus,
  buildTabManager,
  type CategoryFacetState,
  type SearchStatusState,
  type TabManagerState,
} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeCategoryFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/search/category-facet-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import type {AtomicCategoryFacet} from './atomic-category-facet';
import './atomic-category-facet';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-category-facet', () => {
  let mockedConsole: ReturnType<typeof mockConsole>;
  let mockedRegisterFacet: MockInstance;

  beforeEach(() => {
    mockedConsole = mockConsole();
    mockedRegisterFacet = vi.fn();
    vi.mocked(buildCategoryFacet).mockReturnValue(buildFakeCategoryFacet({}));
    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({firstSearchExecuted: true})
    );
    vi.mocked(buildTabManager).mockReturnValue(buildFakeTabManager({}));
    vi.mocked(buildFacetConditionsManager).mockReturnValue({
      stopWatching: vi.fn(),
    });
  });

  const renderCategoryFacet = async (
    props?: Partial<{
      facetId: string;
      label: string;
      field: string;
      numberOfValues: number;
      withSearch: boolean;
      sortCriteria: string;
      delimitingCharacter: string;
      basePath: string[];
      filterByBasePath: boolean;
      isCollapsed: boolean;
      headingLevel: number;
      filterFacetCount: boolean;
      injectionDepth: number;
      tabsIncluded: string[];
      tabsExcluded: string[];
    }>,
    options?: {
      facetState?: Partial<CategoryFacetState>;
      searchStatusState?: Partial<SearchStatusState>;
      tabManagerState?: Partial<TabManagerState>;
    }
  ) => {
    if (options?.facetState) {
      vi.mocked(buildCategoryFacet).mockReturnValue(
        buildFakeCategoryFacet({
          state: options.facetState,
        })
      );
    }
    if (options?.searchStatusState) {
      vi.mocked(buildSearchStatus).mockReturnValue(
        buildFakeSearchStatus({
          firstSearchExecuted: true,
          hasResults: true,
          hasError: false,
          ...options.searchStatusState,
        })
      );
    }
    if (options?.tabManagerState) {
      vi.mocked(buildTabManager).mockReturnValue(
        buildFakeTabManager(options.tabManagerState)
      );
    }

    const {element} = await renderInAtomicSearchInterface<AtomicCategoryFacet>({
      template: html`<atomic-category-facet
        facet-id=${ifDefined(props?.facetId)}
        label=${ifDefined(props?.label)}
        field=${ifDefined(props?.field ?? 'category')}
        number-of-values=${ifDefined(props?.numberOfValues)}
        ?with-search=${props?.withSearch}
        sort-criteria=${ifDefined(props?.sortCriteria)}
        delimiting-character=${ifDefined(props?.delimitingCharacter)}
        base-path=${ifDefined(
          props?.basePath ? JSON.stringify(props?.basePath) : undefined
        )}
        ?filter-by-base-path=${props?.filterByBasePath}
        ?is-collapsed=${props?.isCollapsed}
        heading-level=${ifDefined(props?.headingLevel)}
        ?filter-facet-count=${props?.filterFacetCount}
        injection-depth=${ifDefined(props?.injectionDepth)}
        tabs-included=${ifDefined(
          props?.tabsIncluded ? JSON.stringify(props?.tabsIncluded) : undefined
        )}
        tabs-excluded=${ifDefined(
          props?.tabsExcluded ? JSON.stringify(props?.tabsExcluded) : undefined
        )}
      ></atomic-category-facet>`,
      selector: 'atomic-category-facet',
      bindings: (bindings) => ({
        ...bindings,
        store: {
          ...bindings.store,
          getUniqueIDFromEngine: vi.fn().mockReturnValue('123'),
          registerFacet: mockedRegisterFacet,
        },
      }),
    });

    return {
      element,
      get facet() {
        return element.shadowRoot?.querySelector('[part=facet]');
      },
      get placeholder() {
        return element.shadowRoot?.querySelector('atomic-facet-placeholder');
      },
      get labelButton() {
        return element.shadowRoot?.querySelector('[part=label-button]');
      },
      get values() {
        return element.shadowRoot?.querySelector('[part=values]');
      },
      get valueLinks() {
        return element.shadowRoot?.querySelectorAll('[part~=value-link]');
      },
      get showMore() {
        return element.shadowRoot?.querySelector('[part=show-more]');
      },
      get showLess() {
        return element.shadowRoot?.querySelector('[part=show-less]');
      },
      get searchWrapper() {
        return element.shadowRoot?.querySelector('[part=search-wrapper]');
      },
      get allCategoriesButton() {
        return element.shadowRoot?.querySelector(
          '[part=all-categories-button]'
        );
      },
      get parents() {
        return element.shadowRoot?.querySelector('[part=parents]');
      },
      get subParents() {
        return element.shadowRoot?.querySelector('[part=sub-parents]');
      },
      get activeParent() {
        return element.shadowRoot?.querySelector('[part~=active-parent]');
      },
    };
  };

  it('should render placeholder when first search has not been executed', async () => {
    const {placeholder} = await renderCategoryFacet(undefined, {
      searchStatusState: {firstSearchExecuted: false},
    });
    expect(placeholder).toBeInTheDocument();
  });

  it('should render the facet container when first search is executed', async () => {
    const {facet} = await renderCategoryFacet();
    expect(facet).toBeInTheDocument();
  });

  it('should render facet values when first search is executed', async () => {
    const {valueLinks} = await renderCategoryFacet();
    expect(valueLinks?.length).toBeGreaterThan(0);
  });

  it('should render show more button when canShowMoreValues is true', async () => {
    const {showMore} = await renderCategoryFacet(undefined, {
      facetState: {canShowMoreValues: true},
    });
    expect(showMore).toBeInTheDocument();
  });

  it('should render show less button when canShowLessValues is true', async () => {
    const {showLess} = await renderCategoryFacet(undefined, {
      facetState: {canShowLessValues: true},
    });
    expect(showLess).toBeInTheDocument();
  });

  it('should not render show more button when canShowMoreValues is false', async () => {
    const {showMore} = await renderCategoryFacet(undefined, {
      facetState: {canShowMoreValues: false},
    });
    expect(showMore).not.toBeInTheDocument();
  });

  it('should render search wrapper when search is enabled', async () => {
    const {searchWrapper} = await renderCategoryFacet({withSearch: true});
    expect(searchWrapper).toBeInTheDocument();
  });

  it('should not render search wrapper when search is disabled', async () => {
    const {searchWrapper} = await renderCategoryFacet({withSearch: false});
    expect(searchWrapper).not.toBeInTheDocument();
  });

  it('should not render values when facet is collapsed', async () => {
    const {values} = await renderCategoryFacet({isCollapsed: true});
    expect(values).not.toBeInTheDocument();
  });

  it('should not render facet when there is an error', async () => {
    const {facet} = await renderCategoryFacet(undefined, {
      searchStatusState: {hasError: true},
    });
    expect(facet).not.toBeInTheDocument();
  });

  it('should not render facet when it is disabled', async () => {
    const {facet} = await renderCategoryFacet(undefined, {
      facetState: {enabled: false},
    });
    expect(facet).not.toBeInTheDocument();
  });

  it('should not render facet when there are no values', async () => {
    const {facet} = await renderCategoryFacet(undefined, {
      facetState: {valuesAsTrees: [], values: []},
    });
    expect(facet).not.toBeInTheDocument();
  });

  describe('when has selected value ancestry', () => {
    const selectedAncestry = [
      {
        value: 'Electronics',
        numberOfResults: 25,
        moreValuesAvailable: true,
        state: 'selected' as const,
        path: ['Electronics'],
        children: [
          {
            value: 'Laptops',
            numberOfResults: 12,
            moreValuesAvailable: false,
            state: 'idle' as const,
            path: ['Electronics', 'Laptops'],
            children: [],
            isLeafValue: true,
          },
        ],
        isLeafValue: false,
      },
    ];

    it('should render all categories button', async () => {
      const {allCategoriesButton} = await renderCategoryFacet(undefined, {
        facetState: {
          selectedValueAncestry: selectedAncestry,
          hasActiveValues: true,
        },
      });
      expect(allCategoriesButton).toBeInTheDocument();
    });

    it('should render parents container', async () => {
      const {parents} = await renderCategoryFacet(undefined, {
        facetState: {
          selectedValueAncestry: selectedAncestry,
          hasActiveValues: true,
        },
      });
      expect(parents).toBeInTheDocument();
    });
  });

  describe('controller initialization', () => {
    it('should call buildCategoryFacet with correct options', async () => {
      await renderCategoryFacet({
        field: 'test-field',
        numberOfValues: 10,
        sortCriteria: 'alphanumeric',
      });

      expect(buildCategoryFacet).toHaveBeenCalled();
      const callArgs = vi.mocked(buildCategoryFacet).mock.calls[0][1];
      expect(callArgs?.options?.field).toBe('test-field');
      expect(callArgs?.options?.numberOfValues).toBe(10);
      expect(callArgs?.options?.sortCriteria).toBe('alphanumeric');
    });

    it('should call buildSearchStatus', async () => {
      await renderCategoryFacet();
      expect(buildSearchStatus).toHaveBeenCalled();
    });

    it('should call buildTabManager', async () => {
      await renderCategoryFacet();
      expect(buildTabManager).toHaveBeenCalled();
    });
  });

  describe('prop validation', () => {
    // TODO V4: KIT-5197 - Remove skip and enable validation errors
    it.skip('should set error when field is not provided', async () => {
      const {element} = await renderCategoryFacet({field: ''});
      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(/field/i);
    });

    // TODO V4: KIT-5197 - Remove this test
    it('should log validation warning when field is empty', async () => {
      await renderCategoryFacet({field: ''});
      expect(mockedConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Prop validation failed'),
        expect.anything()
      );
    });

    // TODO V4: KIT-5197 - Remove skip and enable validation errors
    it.skip('should set error when numberOfValues is less than 1', async () => {
      const {element} = await renderCategoryFacet({numberOfValues: 0});
      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(/numberOfValues/i);
    });

    // TODO V4: KIT-5197 - Remove this test
    it('should log validation warning when numberOfValues is less than 1', async () => {
      await renderCategoryFacet({numberOfValues: 0});
      expect(mockedConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Prop validation failed'),
        expect.anything()
      );
    });

    // TODO V4: KIT-5197 - Remove skip and enable validation errors
    it.skip('should set error when sortCriteria is invalid', async () => {
      const {element} = await renderCategoryFacet({
        sortCriteria: 'invalid' as 'alphanumeric',
      });
      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(/sortCriteria/i);
    });

    // TODO V4: KIT-5197 - Remove this test
    it('should log validation warning when sortCriteria is invalid', async () => {
      await renderCategoryFacet({sortCriteria: 'invalid' as 'alphanumeric'});
      expect(mockedConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Prop validation failed'),
        expect.anything()
      );
    });
  });

  it('should log warning when both tabsIncluded and tabsExcluded are provided', async () => {
    await renderCategoryFacet({
      tabsIncluded: ['tab1'],
      tabsExcluded: ['tab2'],
    });

    expect(mockedConsole.warn).toHaveBeenCalledWith(
      expect.stringContaining('tabs-included')
    );
  });
});
