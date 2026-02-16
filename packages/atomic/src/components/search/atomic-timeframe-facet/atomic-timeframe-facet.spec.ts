import {
  buildDateFacet,
  buildDateFilter,
  buildFacetConditionsManager,
  buildSearchStatus,
  buildTabManager,
  type DateFacet,
  type DateFilter,
  type DateRangeRequest,
  loadDateFacetSetActions,
} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeFacetConditionsManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-conditions-manager';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import type {AtomicTimeframeFacet} from './atomic-timeframe-facet';
import './atomic-timeframe-facet';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-timeframe-facet', () => {
  let mockedRegisterFacet: Mock;
  let mockedDateFacet: DateFacet;
  let mockedDateFilter: DateFilter;
  let mockedConsole: ReturnType<typeof mockConsole>;

  beforeEach(() => {
    mockedConsole = mockConsole();
    mockedRegisterFacet = vi.fn();

    const dateFacetState = {
      facetId: 'date-facet',
      values: [] as DateRangeRequest[],
      hasActiveValues: false,
      sortCriterion: 'descending' as const,
      isLoading: false,
      enabled: true,
    };

    const dateFilterState = {
      facetId: 'date-filter',
      range: undefined as DateRangeRequest | undefined,
    };

    mockedDateFacet = {
      get state() {
        return dateFacetState;
      },
      subscribe: vi.fn((cb) => {
        cb();
        return vi.fn();
      }),
      toggleSingleSelect: vi.fn(),
      deselectAll: vi.fn(),
      setRanges: vi.fn(),
    } as unknown as DateFacet;

    mockedDateFilter = {
      get state() {
        return dateFilterState;
      },
      subscribe: vi.fn((cb) => {
        cb();
        return vi.fn();
      }),
      setRange: vi.fn(),
      clear: vi.fn(),
    } as unknown as DateFilter;

    vi.mocked(buildDateFacet).mockReturnValue(mockedDateFacet);
    vi.mocked(buildDateFilter).mockReturnValue(mockedDateFilter);
    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({firstSearchExecuted: true})
    );
    vi.mocked(buildTabManager).mockReturnValue(buildFakeTabManager({}));
    vi.mocked(buildFacetConditionsManager).mockReturnValue(
      buildFakeFacetConditionsManager({})
    );
    vi.mocked(loadDateFacetSetActions).mockReturnValue({
      deselectAllDateFacetValues: vi.fn().mockReturnValue({type: 'mock'}),
    } as unknown as ReturnType<typeof loadDateFacetSetActions>);
  });

  const setupElement = async (
    props?: Partial<{
      field: string;
      label: string;
      tabsIncluded: string[];
      tabsExcluded: string[];
      withDatePicker: boolean;
      isCollapsed: boolean;
      headingLevel: number;
      filterFacetCount: boolean;
      injectionDepth: number;
      dependsOn: Record<string, string>;
      min: string;
      max: string;
      sortCriteria: 'ascending' | 'descending';
      facetId: string;
    }>
  ) => {
    const {element} = await renderInAtomicSearchInterface<AtomicTimeframeFacet>(
      {
        template: html`<atomic-timeframe-facet
        field=${props?.field ?? 'date'}
        label=${props?.label ?? 'Date'}
        facet-id=${ifDefined(props?.facetId)}
        sort-criteria=${ifDefined(props?.sortCriteria)}
        injection-depth=${ifDefined(props?.injectionDepth)}
        heading-level=${ifDefined(props?.headingLevel)}
        .tabsIncluded=${props?.tabsIncluded || []}
        .tabsExcluded=${props?.tabsExcluded || []}
        .dependsOn=${props?.dependsOn || {}}
        ?filter-facet-count=${props?.filterFacetCount}
        ?is-collapsed=${props?.isCollapsed}
        ?with-date-picker=${props?.withDatePicker}
        min=${ifDefined(props?.min)}
        max=${ifDefined(props?.max)}
      ></atomic-timeframe-facet>`,
        selector: 'atomic-timeframe-facet',
        bindings: (bindings) => ({
          ...bindings,
          store: {
            ...bindings.store,
            getUniqueIDFromEngine: vi.fn().mockReturnValue('123'),
            registerFacet: mockedRegisterFacet,
            state: {
              ...bindings.store.state,
              dateFacets: {},
            },
          },
        }),
      }
    );

    const qs = (part: string) =>
      element.shadowRoot?.querySelector(`[part~="${part}"]`);
    const qsa = (part: string) =>
      element.shadowRoot?.querySelectorAll(`[part~="${part}"]`);

    const locators = {
      get facet() {
        return qs('facet');
      },
      get placeholder() {
        return qs('placeholder');
      },
      get labelButton() {
        return qs('label-button') as HTMLElement | null;
      },
      get clearButton() {
        return qs('clear-button') as HTMLElement | null;
      },
      get values() {
        return qs('values');
      },
      get valueLinks() {
        return qsa('value-link');
      },
    };

    return {element, locators};
  };

  describe('#initialize', () => {
    it('should build search status controller with engine', async () => {
      const {element} = await setupElement();
      expect(buildSearchStatus).toHaveBeenCalledWith(element.bindings.engine);
      expect(element.searchStatus).toBeDefined();
    });

    it('should build tab manager controller with engine', async () => {
      const {element} = await setupElement();
      expect(buildTabManager).toHaveBeenCalledWith(element.bindings.engine);
      expect(element.tabManager).toBeDefined();
    });

    it('should register facet in store', async () => {
      await setupElement();
      expect(mockedRegisterFacet).toHaveBeenCalled();
    });

    it('should log a warning when both tabs-included and tabs-excluded are provided', async () => {
      await setupElement({
        tabsIncluded: ['tab1'],
        tabsExcluded: ['tab2'],
      });

      expect(mockedConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('tabs-included')
      );
      expect(mockedConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('tabs-excluded')
      );
    });
  });

  describe('when receiving props', () => {
    it('should use field property', async () => {
      const {element} = await setupElement({field: 'customfield'});
      expect(element.field).toBe('customfield');
    });

    it('should use facetId property when provided', async () => {
      const {element} = await setupElement({facetId: 'my-facet-id'});
      expect(element.facetId).toBe('my-facet-id');
    });

    it('should use sortCriteria property', async () => {
      const {element} = await setupElement({sortCriteria: 'ascending'});
      expect(element.sortCriteria).toBe('ascending');
    });

    it.each<{
      prop: 'sortCriteria' | 'headingLevel' | 'injectionDepth';
      validValue: string | number;
      invalidValue: string | number;
    }>([
      {prop: 'sortCriteria', validValue: 'ascending', invalidValue: 'invalid'},
      {prop: 'headingLevel', validValue: 2, invalidValue: 7},
      {prop: 'injectionDepth', validValue: 1000, invalidValue: -1},
    ])(
      'should log validation warning when #$prop is updated to invalid value',
      async ({prop, validValue, invalidValue}) => {
        const {element} = await setupElement({[prop]: validValue});

        // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
        (element as any)[prop] = invalidValue;
        await element.updateComplete;

        expect(mockedConsole.warn).toHaveBeenCalledWith(
          expect.stringContaining(
            'Prop validation failed for component atomic-timeframe-facet'
          ),
          element
        );
        expect(mockedConsole.warn).toHaveBeenCalledWith(
          expect.stringContaining(prop),
          element
        );
      }
    );
  });

  describe('#render', () => {
    it('should render placeholder before first search is executed', async () => {
      vi.mocked(buildSearchStatus).mockReturnValue(
        buildFakeSearchStatus({firstSearchExecuted: false})
      );

      const {locators} = await setupElement();
      expect(locators.placeholder).not.toBeNull();
      expect(locators.facet).toBeNull();
    });

    it('should not render facet when there is an error', async () => {
      vi.mocked(buildSearchStatus).mockReturnValue(
        buildFakeSearchStatus({firstSearchExecuted: true, hasError: true})
      );

      const {locators} = await setupElement();
      expect(locators.facet).toBeNull();
    });

    it('should not render facet when no values are available', async () => {
      const {locators} = await setupElement();
      expect(locators.facet).toBeNull();
    });
  });

  describe('#disconnectedCallback', () => {
    it('should clean up event listeners via element.remove()', async () => {
      const {element} = await setupElement({withDatePicker: true});
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic-date-input-apply',
        expect.any(Function)
      );
    });
  });
});
