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
import './atomic-rating-facet';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeFacetConditionsManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-conditions-manager';
import {buildFakeNumericFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/search/numeric-facet-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import type {AtomicRatingFacet} from './atomic-rating-facet';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-rating-facet', () => {
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

  const renderRatingFacet = async ({
    props = {},
  }: {
    props?: Partial<{
      field: string;
      facetId: string;
      label: string;
      numberOfIntervals: number;
      maxValueInIndex: number;
      minValueInIndex: number;
      displayValuesAs: 'checkbox' | 'link';
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

    const {element} = await renderInAtomicSearchInterface<AtomicRatingFacet>({
      template: html`<atomic-rating-facet
        field=${props.field ?? 'snrating'}
        label=${props.label ?? 'Rating'}
        facet-id=${ifDefined(props.facetId)}
        number-of-intervals=${ifDefined(props.numberOfIntervals)}
        max-value-in-index=${ifDefined(props.maxValueInIndex)}
        min-value-in-index=${ifDefined(props.minValueInIndex)}
        display-values-as=${ifDefined(props.displayValuesAs)}
        icon=${ifDefined(props.icon)}
        ?is-collapsed=${props.isCollapsed}
        heading-level=${ifDefined(props.headingLevel)}
        filter-facet-count=${props.filterFacetCount}
        injection-depth=${ifDefined(props.injectionDepth)}
        .tabsIncluded=${props.tabsIncluded || []}
        .tabsExcluded=${props.tabsExcluded || []}
        .dependsOn=${props.dependsOn || {}}
      ></atomic-rating-facet>`,
      selector: 'atomic-rating-facet',
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
      getFacetValueButtonByPosition(valuePosition: number) {
        const value = this.getFacetValueByPosition(valuePosition);
        return value.getByRole('checkbox');
      },
      getFacetValueLinkByPosition(valuePosition: number) {
        return this.getFacetValueByPosition(valuePosition);
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
      const {element} = await renderRatingFacet();
      expect(element).toBeDefined();
    });

    it('should render with default properties', async () => {
      const {element} = await renderRatingFacet();
      expect(element.numberOfIntervals).toBe(5);
      expect(element.displayValuesAs).toBe('checkbox');
      expect(element.isCollapsed).toBe(false);
      expect(element.filterFacetCount).toBe(true);
      expect(element.injectionDepth).toBe(1000);
    });

    it('should call buildNumericFacet with engine and correct options', async () => {
      const {element} = await renderRatingFacet({
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
      const {element} = await renderRatingFacet();
      expect(buildSearchStatus).toHaveBeenCalledWith(element.bindings.engine);
    });

    it('should call buildTabManager with engine', async () => {
      const {element} = await renderRatingFacet();
      expect(buildTabManager).toHaveBeenCalledWith(element.bindings.engine);
    });

    it('should register facet in store', async () => {
      await renderRatingFacet();
      expect(mockedRegisterFacet).toHaveBeenCalled();
    });
  });

  describe('props validation', () => {
    // TODO V4: KIT-5197 - Remove skip
    it.skip.each<{
      prop:
        | 'displayValuesAs'
        | 'numberOfIntervals'
        | 'minValueInIndex'
        | 'headingLevel'
        | 'injectionDepth';
      invalidValue: string | number;
    }>([
      {
        prop: 'displayValuesAs',
        invalidValue: 'invalid',
      },
      {
        prop: 'numberOfIntervals',
        invalidValue: 0,
      },
      {
        prop: 'minValueInIndex',
        invalidValue: -1,
      },
      {
        prop: 'headingLevel',
        invalidValue: 7,
      },
      {
        prop: 'injectionDepth',
        invalidValue: -1,
      },
    ])(
      'should set error when #$prop is invalid',
      async ({prop, invalidValue}) => {
        const element = await renderRatingFacet().then(({element}) => element);

        expect(element.error).toBeUndefined();

        // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
        (element as any)[prop] = invalidValue;
        await element.updateComplete;

        expect(element.error).toBeDefined();
        expect(element.error.message).toMatch(new RegExp(prop, 'i'));
      }
    );

    it('should warn when both tabsIncluded and tabsExcluded are provided', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      await renderRatingFacet({
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

    it('should handle explicit maxValueInIndex value', async () => {
      const {element} = await renderRatingFacet({
        props: {
          numberOfIntervals: 5,
          maxValueInIndex: 10,
        },
      });

      expect(element.maxValueInIndex).toBe(10);
    });
  });

  describe('rendering', () => {
    it('should render the title', async () => {
      const {locators} = await renderRatingFacet({props: {label: 'My Rating'}});
      await expect.element(locators.title).toBeVisible();
    });

    it('should render facet values', async () => {
      const {locators} = await renderRatingFacet();
      const values = await locators.facetValues.all();
      expect(values.length).toBeGreaterThan(0);
    });

    it('should render placeholder when first search not executed', async () => {
      mockedSearchStatus = buildFakeSearchStatus({
        firstSearchExecuted: false,
      });

      const {element} = await renderRatingFacet();
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

      const {element} = await renderRatingFacet();
      const facetContainer =
        element.shadowRoot?.querySelector('[part="facet"]');
      expect(facetContainer).toBeNull();
    });

    it('should render nothing when search has error', async () => {
      mockedSearchStatus = buildFakeSearchStatus({
        hasError: true,
      });

      const {element} = await renderRatingFacet();
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

      const {element} = await renderRatingFacet();
      const facetContainer =
        element.shadowRoot?.querySelector('[part="facet"]');
      expect(facetContainer).toBeNull();
    });
  });

  describe('display modes', () => {
    it('should render as checkboxes by default', async () => {
      const {element} = await renderRatingFacet();
      const checkbox = element.shadowRoot?.querySelector(
        '[part~="value-checkbox"]'
      );
      expect(checkbox).toBeDefined();
    });

    it('should render as links when displayValuesAs is "link"', async () => {
      const {element} = await renderRatingFacet({
        props: {displayValuesAs: 'link'},
      });
      const link = element.shadowRoot?.querySelector('[part~="value-link"]');
      expect(link).toBeDefined();
    });
  });

  describe('collapsed state', () => {
    it('should render values when not collapsed', async () => {
      const {element} = await renderRatingFacet({
        props: {isCollapsed: false},
      });
      const values = element.shadowRoot?.querySelector('[part="values"]');
      expect(values).toBeDefined();
    });

    it('should not render values when collapsed', async () => {
      const {element} = await renderRatingFacet({
        props: {isCollapsed: true},
      });
      const values = element.shadowRoot?.querySelector('[part="values"]');
      expect(values).toBeNull();
    });
  });

  describe('rating display', () => {
    it('should display rating icons for each value', async () => {
      const {element} = await renderRatingFacet();
      const ratingIcons = element.shadowRoot?.querySelectorAll(
        '[part~="value-rating-icon"]'
      );
      expect(ratingIcons!.length).toBeGreaterThan(0);
    });

    it('should use custom icon when provided', async () => {
      const customIcon = '<svg>custom</svg>';
      const {element} = await renderRatingFacet({
        props: {icon: customIcon},
      });
      expect(element.icon).toBe(customIcon);
    });
  });

  describe('interaction', () => {
    it('should call toggleSelect when clicking checkbox value', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        implementation: {
          toggleSelect: vi.fn(),
        },
      });

      const {locators} = await renderRatingFacet();
      const firstValueButton = locators.getFacetValueButtonByPosition(0);
      await firstValueButton.click();

      expect(mockedNumericFacet.toggleSelect).toHaveBeenCalled();
    });

    it('should call toggleSingleSelect when clicking link value', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        implementation: {
          toggleSingleSelect: vi.fn(),
        },
      });

      const {locators} = await renderRatingFacet({
        props: {displayValuesAs: 'link'},
      });
      const firstValueButton = locators.getFacetValueLinkByPosition(0);
      await firstValueButton.click();

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

      const {locators} = await renderRatingFacet();
      await locators.clearButton.click();

      expect(mockedNumericFacet.deselectAll).toHaveBeenCalled();
    });
  });

  describe('disconnectedCallback', () => {
    it('should stop watching dependencies when disconnected', async () => {
      mockedFacetConditionsManager = buildFakeFacetConditionsManager({});
      const stopWatchingSpy = vi.spyOn(
        mockedFacetConditionsManager,
        'stopWatching'
      );

      const {element} = await renderRatingFacet();
      element.disconnectedCallback();

      expect(stopWatchingSpy).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should render heading with correct level', async () => {
      const {element} = await renderRatingFacet({props: {headingLevel: 3}});
      const heading = element.shadowRoot?.querySelector('h3');
      expect(heading).toBeDefined();
    });

    it('should render clear button when values are selected', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          ...mockedNumericFacet.state,
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

      const {locators} = await renderRatingFacet();
      await expect.element(locators.clearButton).toBeInTheDocument();
    });
  });

  describe('number of intervals', () => {
    it('should respect custom numberOfIntervals', async () => {
      const {element} = await renderRatingFacet({
        props: {numberOfIntervals: 10},
      });
      expect(element.numberOfIntervals).toBe(10);
    });

    it('should default maxValueInIndex to numberOfIntervals', async () => {
      const {element} = await renderRatingFacet({
        props: {numberOfIntervals: 7},
      });
      expect(element.maxValueInIndex).toBe(7);
    });

    it('should allow custom maxValueInIndex', async () => {
      const {element} = await renderRatingFacet({
        props: {maxValueInIndex: 4},
      });
      expect(element.maxValueInIndex).toBe(4);
    });

    it('should allow custom minValueInIndex', async () => {
      const {element} = await renderRatingFacet({
        props: {minValueInIndex: 2},
      });
      expect(element.minValueInIndex).toBe(2);
    });
  });

  describe('tabs configuration', () => {
    it('should pass tabsIncluded to facet options', async () => {
      const {element} = await renderRatingFacet({
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
      const {element} = await renderRatingFacet({
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
  });

  it('should build facet conditions manager when dependsOn is provided', async () => {
    const {element} = await renderRatingFacet({
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
});
