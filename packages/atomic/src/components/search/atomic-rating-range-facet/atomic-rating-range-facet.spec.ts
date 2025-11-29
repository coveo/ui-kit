import {
  buildFacetConditionsManager,
  buildNumericFacet,
  buildSearchStatus,
  buildTabManager,
  type NumericFacetState,
  type SearchStatusState,
  type TabManagerState,
} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeNumericFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/search/numeric-facet-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import type {AtomicRatingRangeFacet} from './atomic-rating-range-facet';
import './atomic-rating-range-facet';

vi.mock('@coveo/headless', {spy: true});
vi.mock('@/src/mixins/bindings-mixin', () => ({
  InitializeBindingsMixin: vi.fn().mockImplementation((superClass) => {
    return class extends superClass {
      // biome-ignore lint/complexity/noUselessConstructor: <mocking the mixin for testing>
      constructor(...args: unknown[]) {
        super(...args);
      }
    };
  }),
}));

describe('atomic-rating-range-facet', () => {
  const locators = {
    facetLabel: page.getByRole('button', {name: /Rating/i}),
    clearButton: page.getByRole('button', {name: /Clear filter/i}),
    values: () => page.locator('[part="values"]'),
    valueLinks: () => page.locator('[part="value-link"]'),
    selectedValueLinks: () => page.locator('[part="value-link-selected"]'),
    ratingIcons: () => page.locator('[part="value-rating-icon"]'),
    parts: (element: AtomicRatingRangeFacet) => {
      const qs = (part: string) =>
        element.shadowRoot?.querySelector(`[part="${part}"]`);
      const qsa = (part: string) =>
        element.shadowRoot?.querySelectorAll(`[part="${part}"]`);
      return {
        facet: qs('facet'),
        placeholder: qs('placeholder'),
        labelButton: qs('label-button'),
        labelButtonIcon: qs('label-button-icon'),
        clearButton: qs('clear-button'),
        clearButtonIcon: qs('clear-button-icon'),
        values: qs('values'),
        valueLabel: qsa('value-label'),
        valueCount: qsa('value-count'),
        valueRating: qsa('value-rating'),
        valueRatingIcon: qsa('value-rating-icon'),
        valueLink: qsa('value-link'),
        valueLinkSelected: qsa('value-link-selected'),
      };
    },
  };

  const renderRatingRangeFacet = async ({
    props = {},
    facetState,
    searchStatusState,
    tabManagerState,
  }: {
    props?: Partial<{
      facetId: string;
      label: string;
      field: string;
      numberOfIntervals: number;
      maxValueInIndex: number;
      minValueInIndex: number;
      icon: string;
      isCollapsed: boolean;
      headingLevel: number;
      filterFacetCount: boolean;
      injectionDepth: number;
      tabsIncluded: string[];
      tabsExcluded: string[];
      dependsOn: Record<string, string>;
    }>;
    facetState?: Partial<NumericFacetState>;
    searchStatusState?: Partial<SearchStatusState>;
    tabManagerState?: Partial<TabManagerState>;
  } = {}) => {
    const defaultFacetValues = [
      {
        start: 5,
        end: 5,
        endInclusive: true,
        state: 'idle' as const,
        numberOfResults: 10,
      },
      {
        start: 4,
        end: 5,
        endInclusive: true,
        state: 'idle' as const,
        numberOfResults: 8,
      },
      {
        start: 3,
        end: 5,
        endInclusive: true,
        state: 'idle' as const,
        numberOfResults: 6,
      },
      {
        start: 2,
        end: 5,
        endInclusive: true,
        state: 'idle' as const,
        numberOfResults: 4,
      },
      {
        start: 1,
        end: 5,
        endInclusive: true,
        state: 'idle' as const,
        numberOfResults: 2,
      },
    ];

    vi.mocked(buildNumericFacet).mockReturnValue(
      buildFakeNumericFacet({
        state: {
          facetId: 'rating_facet',
          values: defaultFacetValues,
          enabled: true,
          ...facetState,
        },
      })
    );
    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({
        state: {
          hasError: false,
          firstSearchExecuted: true,
          ...searchStatusState,
        },
      })
    );
    vi.mocked(buildTabManager).mockReturnValue(
      buildFakeTabManager({
        state: {
          activeTab: '',
          ...tabManagerState,
        },
      })
    );
    vi.mocked(buildFacetConditionsManager).mockReturnValue({
      stopWatching: vi.fn(),
      // biome-ignore lint/suspicious/noExplicitAny: mocking external dependency
    } as any);

    const {element} =
      await renderInAtomicSearchInterface<AtomicRatingRangeFacet>({
        template: html`
        <atomic-rating-range-facet
          facet-id=${ifDefined(props.facetId)}
          label=${ifDefined(props.label)}
          field=${ifDefined(props.field ?? 'rating')}
          number-of-intervals=${ifDefined(props.numberOfIntervals)}
          max-value-in-index=${ifDefined(props.maxValueInIndex)}
          min-value-in-index=${ifDefined(props.minValueInIndex)}
          icon=${ifDefined(props.icon)}
          ?is-collapsed=${props.isCollapsed}
          heading-level=${ifDefined(props.headingLevel)}
          ?filter-facet-count=${props.filterFacetCount}
          injection-depth=${ifDefined(props.injectionDepth)}
        ></atomic-rating-range-facet>
      `,
        selector: 'atomic-rating-range-facet',
      });

    return {element, locators, parts: locators.parts(element)};
  };

  it('should render correctly', async () => {
    const {element} = await renderRatingRangeFacet();
    expect(element).toBeDefined();
  });

  it('should render with default properties', async () => {
    const {element} = await renderRatingRangeFacet();
    expect(element.label).toBe('no-label');
    expect(element.numberOfIntervals).toBe(5);
    expect(element.maxValueInIndex).toBe(5);
    expect(element.minValueInIndex).toBe(1);
    expect(element.isCollapsed).toBe(false);
    expect(element.headingLevel).toBe(0);
    expect(element.filterFacetCount).toBe(true);
    expect(element.injectionDepth).toBe(1000);
  });

  it('should call buildNumericFacet with engine to set the facet', async () => {
    const {element} = await renderRatingRangeFacet({
      props: {field: 'snrating', numberOfIntervals: 5},
    });
    const buildNumericFacetMock = vi.mocked(buildNumericFacet);

    expect(buildNumericFacet).toHaveBeenCalledWith(element.bindings.engine, {
      options: expect.objectContaining({
        field: 'snrating',
        numberOfValues: 5,
      }),
    });
    expect(element.facet).toBe(buildNumericFacetMock.mock.results[0].value);
  });

  it('should call buildSearchStatus with engine to set the search status', async () => {
    const {element} = await renderRatingRangeFacet();
    const buildSearchStatusMock = vi.mocked(buildSearchStatus);

    expect(buildSearchStatus).toHaveBeenCalledExactlyOnceWith(
      element.bindings.engine
    );
    expect(element.searchStatus).toBe(
      buildSearchStatusMock.mock.results[0].value
    );
  });

  it('should call buildTabManager with engine to set the tab manager', async () => {
    const {element} = await renderRatingRangeFacet();
    const buildTabManagerMock = vi.mocked(buildTabManager);

    expect(buildTabManager).toHaveBeenCalledExactlyOnceWith(
      element.bindings.engine
    );
    expect(element.tabManager).toBe(buildTabManagerMock.mock.results[0].value);
  });

  describe('when field prop is missing', () => {
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should set error', async () => {
      const {element} = await renderRatingRangeFacet({props: {field: ''}});
      expect(element.error).toBeDefined();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  it('should render facet values with rating icons', async () => {
    await renderRatingRangeFacet();

    const valueLinks = locators.valueLinks();
    await expect.element(valueLinks.first()).toBeInTheDocument();

    const ratingIcons = locators.ratingIcons();
    await expect.element(ratingIcons.first()).toBeInTheDocument();
  });

  it('should render the correct number of facet values', async () => {
    await renderRatingRangeFacet({
      facetState: {
        values: [
          {
            start: 5,
            end: 5,
            endInclusive: true,
            state: 'idle',
            numberOfResults: 10,
          },
          {
            start: 4,
            end: 5,
            endInclusive: true,
            state: 'idle',
            numberOfResults: 8,
          },
          {
            start: 3,
            end: 5,
            endInclusive: true,
            state: 'idle',
            numberOfResults: 6,
          },
        ],
      },
    });

    const valueLinks = locators.valueLinks();
    await expect.element(valueLinks).toHaveCount(3);
  });

  it('should not render when search has error', async () => {
    await renderRatingRangeFacet({
      searchStatusState: {hasError: true},
    });

    const values = locators.values();
    await expect.element(values).not.toBeInTheDocument();
  });

  it('should not render when facet is not enabled', async () => {
    await renderRatingRangeFacet({
      facetState: {enabled: false},
    });

    const values = locators.values();
    await expect.element(values).not.toBeInTheDocument();
  });

  it('should render placeholder before first search', async () => {
    const {parts} = await renderRatingRangeFacet({
      searchStatusState: {firstSearchExecuted: false},
    });

    expect(parts.placeholder).toBeInTheDocument();
  });

  it('should not render values when no results', async () => {
    await renderRatingRangeFacet({
      facetState: {
        values: [],
      },
    });

    const values = locators.values();
    await expect.element(values).not.toBeInTheDocument();
  });

  it('should render collapsed facet when isCollapsed is true', async () => {
    await renderRatingRangeFacet({
      props: {isCollapsed: true},
    });

    const values = locators.values();
    await expect.element(values).not.toBeInTheDocument();
  });

  it('should update numberOfIntervals property', async () => {
    const {element} = await renderRatingRangeFacet({
      props: {numberOfIntervals: 5},
    });
    expect(element.numberOfIntervals).toBe(5);

    element.numberOfIntervals = 10;
    await element.updateComplete;

    expect(element.numberOfIntervals).toBe(10);
  });

  it('should update maxValueInIndex property', async () => {
    const {element} = await renderRatingRangeFacet({
      props: {maxValueInIndex: 5},
    });
    expect(element.maxValueInIndex).toBe(5);

    element.maxValueInIndex = 10;
    await element.updateComplete;

    expect(element.maxValueInIndex).toBe(10);
  });

  it('should handle invalid numberOfIntervals by setting error property', async () => {
    const {element} = await renderRatingRangeFacet();

    element.numberOfIntervals = -1;
    await element.updateComplete;

    expect(element.error).toBeDefined();
    expect(element.error.message).toContain('minimum value of 1 not respected');
  });

  it('should render selected facet value', async () => {
    await renderRatingRangeFacet({
      facetState: {
        values: [
          {
            start: 5,
            end: 5,
            endInclusive: true,
            state: 'selected',
            numberOfResults: 10,
          },
          {
            start: 4,
            end: 5,
            endInclusive: true,
            state: 'idle',
            numberOfResults: 8,
          },
        ],
      },
    });

    const selectedLinks = locators.selectedValueLinks();
    await expect.element(selectedLinks).toHaveCount(1);
  });

  it('should render clear button when facet has selected values', async () => {
    await renderRatingRangeFacet({
      facetState: {
        values: [
          {
            start: 5,
            end: 5,
            endInclusive: true,
            state: 'selected',
            numberOfResults: 10,
          },
        ],
      },
    });

    const clearButton = locators.clearButton;
    await expect.element(clearButton).toBeInTheDocument();
  });

  it('should call facet.deselectAll when clear button is clicked', async () => {
    const {element} = await renderRatingRangeFacet({
      facetState: {
        values: [
          {
            start: 5,
            end: 5,
            endInclusive: true,
            state: 'selected',
            numberOfResults: 10,
          },
        ],
      },
    });

    const deselectAllSpy = vi.spyOn(element.facet, 'deselectAll');

    const clearButton = locators.clearButton;
    await clearButton.click();

    expect(deselectAllSpy).toHaveBeenCalled();
  });

  it('should warn when both tabsIncluded and tabsExcluded are set', async () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    await renderRatingRangeFacet({
      props: {
        tabsIncluded: ['tab1'],
        tabsExcluded: ['tab2'],
      },
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('tabs-included')
    );

    consoleWarnSpy.mockRestore();
  });

  it('should call stopWatching on disconnectedCallback', async () => {
    const {element} = await renderRatingRangeFacet();

    const stopWatchingSpy = vi.fn();
    // @ts-ignore - accessing private property for testing
    element.dependenciesManager = {stopWatching: stopWatchingSpy};

    element.disconnectedCallback();

    expect(stopWatchingSpy).toHaveBeenCalled();
  });
});
