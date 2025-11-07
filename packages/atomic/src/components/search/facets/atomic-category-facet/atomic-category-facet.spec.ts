import {
  buildCategoryFacet,
  buildFacetConditionsManager,
  buildSearchStatus,
  buildTabManager,
} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {buildFakeCategoryFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/category-facet';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search-status';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/tab-manager';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/render-in-search-interface';
import type {AtomicCategoryFacet} from './atomic-category-facet';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-category-facet', () => {
  const mockEngine = {} as unknown;

  const renderCategoryFacet = async ({
    props = {},
    controllerState = {},
    searchStatusState = {},
    tabManagerState = {},
  }: {
    props?: Partial<AtomicCategoryFacet>;
    controllerState?: Parameters<typeof buildFakeCategoryFacet>[0];
    searchStatusState?: Parameters<typeof buildFakeSearchStatus>[0];
    tabManagerState?: Parameters<typeof buildFakeTabManager>[0];
  } = {}) => {
    vi.mocked(buildCategoryFacet).mockReturnValue(
      buildFakeCategoryFacet({
        state: {
          valuesAsTrees: [],
          selectedValueAncestry: [],
          ...controllerState,
        },
      })
    );
    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({state: searchStatusState})
    );
    vi.mocked(buildTabManager).mockReturnValue(
      buildFakeTabManager({state: tabManagerState})
    );
    vi.mocked(buildFacetConditionsManager).mockReturnValue({
      stopWatching: vi.fn(),
    } as unknown as ReturnType<typeof buildFacetConditionsManager>);

    const template = html`
      <atomic-category-facet
        .field=${props.field ?? 'geographicalhierarchy'}
        .label=${props.label ?? 'Location'}
        .facetId=${props.facetId}
        .numberOfValues=${props.numberOfValues ?? 8}
        .withSearch=${props.withSearch ?? false}
        .sortCriteria=${props.sortCriteria ?? 'occurrences'}
        .delimitingCharacter=${props.delimitingCharacter ?? ';'}
        .basePath=${props.basePath ?? []}
        .filterByBasePath=${props.filterByBasePath ?? true}
        .isCollapsed=${props.isCollapsed ?? false}
        .headingLevel=${props.headingLevel ?? 0}
        .filterFacetCount=${props.filterFacetCount ?? true}
        .injectionDepth=${props.injectionDepth ?? 1000}
        .tabsIncluded=${props.tabsIncluded ?? []}
        .tabsExcluded=${props.tabsExcluded ?? []}
        .dependsOn=${props.dependsOn ?? {}}
      ></atomic-category-facet>
    `;

    const {element} = await renderInAtomicSearchInterface<AtomicCategoryFacet>({
      template,
      selector: 'atomic-category-facet',
      bindings: (bindings) => {
        bindings.engine = mockEngine;
        return bindings;
      },
    });

    return {
      element,
      parts: {
        container: () =>
          element.shadowRoot?.querySelector('[part="facet"]') as HTMLElement,
        header: () =>
          element.shadowRoot?.querySelector(
            '[part~="label-button"]'
          ) as HTMLElement,
        values: () =>
          element.shadowRoot?.querySelector('[part="values"]') as HTMLElement,
        searchInput: () =>
          element.shadowRoot?.querySelector(
            '[part="search-input"]'
          ) as HTMLInputElement,
        showMore: () =>
          element.shadowRoot?.querySelector(
            '[part="show-more"]'
          ) as HTMLButtonElement,
        showLess: () =>
          element.shadowRoot?.querySelector(
            '[part="show-less"]'
          ) as HTMLButtonElement,
      },
      getByRole: (role: string, options?: {name?: string}) =>
        page.getByRole(role, options),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create category facet controller with correct options', async () => {
    await renderCategoryFacet({
      props: {
        field: 'geographicalhierarchy',
        numberOfValues: 10,
        sortCriteria: 'alphanumeric',
        basePath: ['North America', 'USA'],
        delimitingCharacter: '|',
        filterByBasePath: false,
        injectionDepth: 2000,
        filterFacetCount: false,
        tabsIncluded: ['tab1', 'tab2'],
      },
    });

    expect(buildCategoryFacet).toHaveBeenCalledWith(mockEngine, {
      options: expect.objectContaining({
        field: 'geographicalhierarchy',
        numberOfValues: 10,
        sortCriteria: 'alphanumeric',
        basePath: ['North America', 'USA'],
        delimitingCharacter: '|',
        filterByBasePath: false,
        injectionDepth: 2000,
        filterFacetCount: false,
        tabs: {
          included: ['tab1', 'tab2'],
          excluded: [],
        },
      }),
    });
  });

  it('should create search status and tab manager controllers', async () => {
    await renderCategoryFacet();

    expect(buildSearchStatus).toHaveBeenCalledWith(mockEngine);
    expect(buildTabManager).toHaveBeenCalledWith(mockEngine);
  });

  it('should warn when both tabsIncluded and tabsExcluded are provided', async () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    await renderCategoryFacet({
      props: {
        tabsIncluded: ['tab1'],
        tabsExcluded: ['tab2'],
      },
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('tabs-included')
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('tabs-excluded')
    );

    consoleWarnSpy.mockRestore();
  });

  describe('when facet has no values', () => {
    it('should not render the facet container', async () => {
      const {parts} = await renderCategoryFacet({
        controllerState: {
          valuesAsTrees: [],
        },
        searchStatusState: {
          firstSearchExecuted: true,
        },
      });

      expect(parts.container()).toBeNull();
    });
  });

  describe('when facet has values', () => {
    it('should render the facet container', async () => {
      const {parts} = await renderCategoryFacet({
        controllerState: {
          valuesAsTrees: [
            {
              value: 'Electronics',
              numberOfResults: 100,
              state: 'idle',
              children: [],
              isLeafValue: false,
              path: ['Electronics'],
              isAutoSelected: false,
            },
          ],
        },
        searchStatusState: {
          firstSearchExecuted: true,
        },
      });

      await expect.element(parts.container()).toBeInTheDocument();
    });

    it('should render facet header', async () => {
      const {parts} = await renderCategoryFacet({
        props: {label: 'Categories'},
        controllerState: {
          valuesAsTrees: [
            {
              value: 'Electronics',
              numberOfResults: 100,
              state: 'idle',
              children: [],
              isLeafValue: false,
              path: ['Electronics'],
              isAutoSelected: false,
            },
          ],
        },
        searchStatusState: {
          firstSearchExecuted: true,
        },
      });

      await expect.element(parts.header()).toBeInTheDocument();
    });
  });

  describe('when first search is not executed', () => {
    it('should render placeholder', async () => {
      const {element} = await renderCategoryFacet({
        searchStatusState: {
          firstSearchExecuted: false,
        },
      });

      const placeholder = element.shadowRoot?.querySelector(
        '[part="placeholder"]'
      );
      expect(placeholder).not.toBeNull();
    });
  });

  describe('when facet is collapsed', () => {
    it('should not render values', async () => {
      const {parts} = await renderCategoryFacet({
        props: {isCollapsed: true},
        controllerState: {
          valuesAsTrees: [
            {
              value: 'Electronics',
              numberOfResults: 100,
              state: 'idle',
              children: [],
              isLeafValue: false,
              path: ['Electronics'],
              isAutoSelected: false,
            },
          ],
        },
        searchStatusState: {
          firstSearchExecuted: true,
        },
      });

      expect(parts.values()).toBeNull();
    });
  });

  describe('when withSearch is true', () => {
    it('should render search input', async () => {
      const {parts} = await renderCategoryFacet({
        props: {withSearch: true},
        controllerState: {
          valuesAsTrees: [
            {
              value: 'Electronics',
              numberOfResults: 100,
              state: 'idle',
              children: [],
              isLeafValue: false,
              path: ['Electronics'],
              isAutoSelected: false,
            },
          ],
        },
        searchStatusState: {
          firstSearchExecuted: true,
        },
      });

      await expect.element(parts.searchInput()).toBeInTheDocument();
    });
  });

  describe('when withSearch is false', () => {
    it('should not render search input', async () => {
      const {parts} = await renderCategoryFacet({
        props: {withSearch: false},
        controllerState: {
          valuesAsTrees: [
            {
              value: 'Electronics',
              numberOfResults: 100,
              state: 'idle',
              children: [],
              isLeafValue: false,
              path: ['Electronics'],
              isAutoSelected: false,
            },
          ],
        },
        searchStatusState: {
          firstSearchExecuted: true,
        },
      });

      expect(parts.searchInput()).toBeNull();
    });
  });

  describe('#disconnectedCallback', () => {
    it('should stop watching dependencies', async () => {
      const stopWatchingSpy = vi.fn();
      vi.mocked(buildFacetConditionsManager).mockReturnValue({
        stopWatching: stopWatchingSpy,
      } as unknown as ReturnType<typeof buildFacetConditionsManager>);

      const {element} = await renderCategoryFacet();

      element.remove();

      expect(stopWatchingSpy).toHaveBeenCalled();
    });
  });

  describe('when canShowMoreValues is true', () => {
    it('should render show more button', async () => {
      const {parts} = await renderCategoryFacet({
        controllerState: {
          valuesAsTrees: [
            {
              value: 'Electronics',
              numberOfResults: 100,
              state: 'idle',
              children: [],
              isLeafValue: false,
              path: ['Electronics'],
              isAutoSelected: false,
            },
          ],
          canShowMoreValues: true,
        },
        searchStatusState: {
          firstSearchExecuted: true,
        },
      });

      await expect.element(parts.showMore()).toBeInTheDocument();
    });
  });

  describe('when canShowLessValues is true', () => {
    it('should render show less button', async () => {
      const {parts} = await renderCategoryFacet({
        controllerState: {
          valuesAsTrees: [
            {
              value: 'Electronics',
              numberOfResults: 100,
              state: 'idle',
              children: [],
              isLeafValue: false,
              path: ['Electronics'],
              isAutoSelected: false,
            },
          ],
          canShowLessValues: true,
        },
        searchStatusState: {
          firstSearchExecuted: true,
        },
      });

      await expect.element(parts.showLess()).toBeInTheDocument();
    });
  });

  describe('when facet has active values and is collapsed', () => {
    it('should show active value count in header', async () => {
      const {parts} = await renderCategoryFacet({
        props: {isCollapsed: true},
        controllerState: {
          hasActiveValues: true,
          valuesAsTrees: [
            {
              value: 'Electronics',
              numberOfResults: 100,
              state: 'selected',
              children: [],
              isLeafValue: false,
              path: ['Electronics'],
              isAutoSelected: false,
            },
          ],
        },
        searchStatusState: {
          firstSearchExecuted: true,
        },
      });

      const header = parts.header();
      expect(header).not.toBeNull();
    });
  });

  describe('when search status has error', () => {
    it('should not render the facet', async () => {
      const {parts} = await renderCategoryFacet({
        controllerState: {
          valuesAsTrees: [
            {
              value: 'Electronics',
              numberOfResults: 100,
              state: 'idle',
              children: [],
              isLeafValue: false,
              path: ['Electronics'],
              isAutoSelected: false,
            },
          ],
        },
        searchStatusState: {
          hasError: true,
          firstSearchExecuted: true,
        },
      });

      expect(parts.container()).toBeNull();
    });
  });

  describe('when facet is not enabled', () => {
    it('should not render the facet', async () => {
      const {parts} = await renderCategoryFacet({
        controllerState: {
          enabled: false,
          valuesAsTrees: [
            {
              value: 'Electronics',
              numberOfResults: 100,
              state: 'idle',
              children: [],
              isLeafValue: false,
              path: ['Electronics'],
              isAutoSelected: false,
            },
          ],
        },
        searchStatusState: {
          firstSearchExecuted: true,
        },
      });

      expect(parts.container()).toBeNull();
    });
  });
});
