import {
  buildFacetConditionsManager,
  buildNumericFacet,
  buildSearchStatus,
  buildTabManager,
  type FacetConditionsManager,
  type NumericFacet,
  type SearchStatus,
  type TabManager,
} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import {page} from 'vitest/browser';
import './atomic-rating-range-facet';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeFacetConditionsManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-conditions-manager';
import {buildFakeNumericFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/search/numeric-facet-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import type {AtomicRatingRangeFacet} from './atomic-rating-range-facet';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-rating-range-facet', () => {
  let mockedRegisterFacet: Mock;
  let mockedNumericFacet: NumericFacet;
  let mockedSearchStatus: SearchStatus;
  let mockedTabManager: TabManager;
  let mockedFacetConditionsManager: FacetConditionsManager;

  beforeEach(() => {
    mockedRegisterFacet = vi.fn();
    mockedNumericFacet = buildFakeNumericFacet({});
    mockedSearchStatus = buildFakeSearchStatus({firstSearchExecuted: true});
    mockedTabManager = buildFakeTabManager({});
    mockedFacetConditionsManager = buildFakeFacetConditionsManager({});
  });

  const renderRatingRangeFacet = async ({
    props = {},
  }: {
    props?: Partial<{
      field: string;
      facetId: string;
      label: string;
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
  } = {}) => {
    vi.mocked(buildNumericFacet).mockReturnValue(mockedNumericFacet);
    vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);
    vi.mocked(buildTabManager).mockReturnValue(mockedTabManager);
    vi.mocked(buildFacetConditionsManager).mockReturnValue(
      mockedFacetConditionsManager
    );

    const {element} =
      await renderInAtomicSearchInterface<AtomicRatingRangeFacet>({
        template: html`<atomic-rating-range-facet
          field=${props.field ?? 'rating'}
          label=${props.label ?? 'Rating'}
          facet-id=${ifDefined(props.facetId)}
          number-of-intervals=${ifDefined(props.numberOfIntervals)}
          max-value-in-index=${ifDefined(props.maxValueInIndex)}
          min-value-in-index=${ifDefined(props.minValueInIndex)}
          icon=${ifDefined(props.icon)}
          ?is-collapsed=${props.isCollapsed}
          heading-level=${ifDefined(props.headingLevel)}
          filter-facet-count=${props.filterFacetCount}
          injection-depth=${ifDefined(props.injectionDepth)}
          .tabsIncluded=${props.tabsIncluded || []}
          .tabsExcluded=${props.tabsExcluded || []}
          .dependsOn=${props.dependsOn || {}}
        ></atomic-rating-range-facet>`,
        selector: 'atomic-rating-range-facet',
        bindings: (bindings) => ({
          ...bindings,
          store: {
            ...bindings.store,
            getUniqueIDFromEngine: vi.fn().mockReturnValue('123'),
            registerFacet: mockedRegisterFacet,
          },
        }),
      });

    const locators = {
      get title() {
        return page.getByText(props.label ?? 'Rating', {exact: true});
      },
      getFacetValueByPosition(valuePosition: number) {
        return page.getByRole('listitem').nth(valuePosition);
      },
      get clearButton() {
        return page.getByLabelText(/Clear \d+ filter for the Rating facet/);
      },
      get facetValues() {
        return page.getByRole('listitem');
      },
    };

    return {element, locators};
  };

  describe('initialization', () => {
    it('should render correctly', async () => {
      const {element} = await renderRatingRangeFacet();
      expect(element).toBeDefined();
    });

    it('should render with default properties', async () => {
      const {element} = await renderRatingRangeFacet();
      expect(element.numberOfIntervals).toBe(5);
      expect(element.maxValueInIndex).toBe(5);
      expect(element.minValueInIndex).toBe(1);
      expect(element.isCollapsed).toBe(false);
      expect(element.headingLevel).toBe(0);
      expect(element.filterFacetCount).toBe(true);
      expect(element.injectionDepth).toBe(1000);
    });

    it('should call buildNumericFacet with engine and correct options', async () => {
      const {element} = await renderRatingRangeFacet({
        props: {
          field: 'testfield',
          numberOfIntervals: 7,
          filterFacetCount: false,
          injectionDepth: 500,
        },
      });

      expect(buildNumericFacet).toHaveBeenCalledWith(element.bindings.engine, {
        options: expect.objectContaining({
          field: 'testfield',
          numberOfValues: 7,
          filterFacetCount: false,
          injectionDepth: 500,
          generateAutomaticRanges: false,
          sortCriteria: 'descending',
        }),
      });
    });

    it('should call buildSearchStatus with engine', async () => {
      const {element} = await renderRatingRangeFacet();
      expect(buildSearchStatus).toHaveBeenCalledWith(element.bindings.engine);
    });

    it('should call buildTabManager with engine', async () => {
      const {element} = await renderRatingRangeFacet();
      expect(buildTabManager).toHaveBeenCalledWith(element.bindings.engine);
    });

    it('should register facet in store', async () => {
      await renderRatingRangeFacet();
      expect(mockedRegisterFacet).toHaveBeenCalled();
    });
  });

  // TODO V4: KIT-5197 - unskip
  describe.skip('props validation', () => {
    it('should set error when field prop is missing', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const {element} = await renderRatingRangeFacet({
        props: {field: ''},
      });
      expect(element.error).toBeDefined();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle invalid numberOfIntervals by setting error property', async () => {
      const {element} = await renderRatingRangeFacet();

      element.numberOfIntervals = -1;
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toContain(
        'minimum value of 1 not respected'
      );
    });

    it('should warn when both tabsIncluded and tabsExcluded are provided', async () => {
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
  });

  describe('rendering', () => {
    it('should render the title', async () => {
      const {locators} = await renderRatingRangeFacet({
        props: {label: 'My Rating'},
      });
      await expect.element(locators.title).toBeVisible();
    });

    it('should render facet values', async () => {
      const {locators} = await renderRatingRangeFacet();
      const values = await locators.facetValues.all();
      expect(values.length).toBeGreaterThan(0);
    });

    it('should render placeholder when first search not executed', async () => {
      mockedSearchStatus = buildFakeSearchStatus({
        firstSearchExecuted: false,
      });

      const {element} = await renderRatingRangeFacet();
      const placeholder = element.shadowRoot?.querySelector(
        'atomic-facet-placeholder'
      );
      expect(placeholder).toBeDefined();
    });

    it('should render nothing when there are no values', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          ...mockedNumericFacet.state,
          values: [],
        },
      });

      const {element} = await renderRatingRangeFacet();
      const facetContainer =
        element.shadowRoot?.querySelector('[part="facet"]');
      expect(facetContainer).toBeNull();
    });

    it('should render nothing when search has error', async () => {
      mockedSearchStatus = buildFakeSearchStatus({
        hasError: true,
      });

      const {element} = await renderRatingRangeFacet();
      const facetContainer =
        element.shadowRoot?.querySelector('[part="facet"]');
      expect(facetContainer).toBeNull();
    });

    it('should render nothing when facet is not enabled', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          ...mockedNumericFacet.state,
          enabled: false,
        },
      });

      const {element} = await renderRatingRangeFacet();
      const facetContainer =
        element.shadowRoot?.querySelector('[part="facet"]');
      expect(facetContainer).toBeNull();
    });
  });

  describe('collapsed state', () => {
    it('should render values when not collapsed', async () => {
      const {element} = await renderRatingRangeFacet({
        props: {isCollapsed: false},
      });
      const values = element.shadowRoot?.querySelector('[part="values"]');
      expect(values).toBeDefined();
    });

    it('should not render values when collapsed', async () => {
      const {element} = await renderRatingRangeFacet({
        props: {isCollapsed: true},
      });
      const values = element.shadowRoot?.querySelector('[part="values"]');
      expect(values).toBeNull();
    });
  });

  describe('rating display', () => {
    it('should display rating icons for each value', async () => {
      const {element} = await renderRatingRangeFacet();
      const ratingIcons = element.shadowRoot?.querySelectorAll(
        '[part~="value-rating-icon"]'
      );
      expect(ratingIcons!.length).toBeGreaterThan(0);
    });

    it('should use custom icon when provided', async () => {
      const customIcon = '<svg>custom</svg>';
      const {element} = await renderRatingRangeFacet({
        props: {icon: customIcon},
      });
      expect(element.icon).toBe(customIcon);
    });
  });

  describe('interaction', () => {
    it('should call toggleSingleSelect when clicking link value', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        implementation: {
          toggleSingleSelect: vi.fn(),
        },
      });

      const {locators} = await renderRatingRangeFacet();
      const firstValue = locators.getFacetValueByPosition(0);
      await firstValue.click();

      expect(mockedNumericFacet.toggleSingleSelect).toHaveBeenCalled();
    });

    it('should call deselectAll when clicking clear button', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        implementation: {
          deselectAll: vi.fn(),
        },
        state: {
          values: [
            {
              start: 4,
              end: 5,
              endInclusive: false,
              state: 'selected',
              numberOfResults: 10,
            },
          ],
        },
      });

      const {locators} = await renderRatingRangeFacet();
      await locators.clearButton.click();

      expect(mockedNumericFacet.deselectAll).toHaveBeenCalled();
    });
  });

  describe('when removed from the DOM (#disconnectedCallback)', () => {
    it('should stop watching dependencies', async () => {
      const stopWatchingSpy = vi.spyOn(
        mockedFacetConditionsManager,
        'stopWatching'
      );
      const {element} = await renderRatingRangeFacet();
      element.disconnectedCallback();
      expect(stopWatchingSpy).toHaveBeenCalled();
    });
  });

  it('should respect custom numberOfIntervals', async () => {
    const {element} = await renderRatingRangeFacet({
      props: {numberOfIntervals: 10},
    });
    expect(element.numberOfIntervals).toBe(10);
  });

  it('should default maxValueInIndex to numberOfIntervals', async () => {
    const {element} = await renderRatingRangeFacet({
      props: {numberOfIntervals: 7},
    });
    expect(element.maxValueInIndex).toBe(7);
  });

  it('should default maxValueInIndex to numberOfIntervals in connectedCallback when undefined', async () => {
    const {element} = await renderRatingRangeFacet({
      props: {numberOfIntervals: 7, maxValueInIndex: undefined},
    });
    expect(element.maxValueInIndex).toBe(7);
  });

  it('should allow custom maxValueInIndex', async () => {
    const {element} = await renderRatingRangeFacet({
      props: {maxValueInIndex: 4},
    });
    expect(element.maxValueInIndex).toBe(4);
  });

  it('should allow custom minValueInIndex', async () => {
    const {element} = await renderRatingRangeFacet({
      props: {minValueInIndex: 2},
    });
    expect(element.minValueInIndex).toBe(2);
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

  it('should pass tabsIncluded to facet options', async () => {
    const {element} = await renderRatingRangeFacet({
      props: {tabsIncluded: ['tab1', 'tab2']},
    });

    expect(buildNumericFacet).toHaveBeenCalledWith(element.bindings.engine, {
      options: expect.objectContaining({
        tabs: expect.objectContaining({
          included: ['tab1', 'tab2'],
        }),
      }),
    });
  });

  it('should pass tabsExcluded to facet options', async () => {
    const {element} = await renderRatingRangeFacet({
      props: {tabsExcluded: ['tab3', 'tab4']},
    });

    expect(buildNumericFacet).toHaveBeenCalledWith(element.bindings.engine, {
      options: expect.objectContaining({
        tabs: expect.objectContaining({
          excluded: ['tab3', 'tab4'],
        }),
      }),
    });
  });

  it('should build facet conditions manager when dependsOn is provided', async () => {
    const {element} = await renderRatingRangeFacet({
      props: {dependsOn: {parentFacet: 'value'}},
    });

    expect(buildFacetConditionsManager).toHaveBeenCalledWith(
      element.bindings.engine,
      expect.objectContaining({
        facetId: expect.any(String),
        conditions: expect.any(Object),
      })
    );
  });

  describe('parts', () => {
    it('should have values part', async () => {
      const {element} = await renderRatingRangeFacet();
      const values = element.shadowRoot?.querySelector('[part="values"]');
      expect(values).toBeDefined();
    });

    it('should have value-link part', async () => {
      const {element} = await renderRatingRangeFacet();
      const valueLink = element.shadowRoot?.querySelector(
        '[part="value-link"]'
      );
      expect(valueLink).toBeDefined();
    });

    it('should have value-link-selected part for selected values', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
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

      const {element} = await renderRatingRangeFacet();

      // Test basic parts
      const values = element.shadowRoot?.querySelector('[part="values"]');
      expect(values).toBeDefined();

      const valueCount = element.shadowRoot?.querySelector(
        '[part="value-count"]'
      );

      expect(valueCount).toBeDefined();

      const placeholder = element.shadowRoot?.querySelector(
        '[part="placeholder"]'
      );

      expect(placeholder).toBeDefined();

      const valueLink = element.shadowRoot?.querySelector(
        '[part="value-link"]'
      );
      expect(valueLink).toBeDefined();

      const selectedLink = element.shadowRoot?.querySelector(
        '[part="value-link-selected"]'
      );
      expect(selectedLink).toBeDefined();

      const ratingIcon = element.shadowRoot?.querySelector(
        '[part~="value-rating-icon"]'
      );
      expect(ratingIcon).toBeDefined();
    });
  });
});
