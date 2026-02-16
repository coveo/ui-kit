import type {
  DateFacet,
  DateFacetValue,
  DateFilter,
  DateRangeRequest,
  SearchStatusState,
} from '@coveo/headless';
import {html, nothing} from 'lit';
import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import type {FocusTargetController} from '@/src/utils/accessibility-utils';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common';
import {buildFakeFacetConditionsManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-conditions-manager';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {TimeframeFacetCommon} from './timeframe-facet-common';

const buildFakeDateFacet = (overrides?: Partial<DateFacet>): DateFacet => {
  return {
    state: {
      facetId: 'test-facet-id',
      enabled: true,
      values: [],
      ...(overrides?.state || {}),
    },
    subscribe: genericSubscribe,
    toggleSingleSelect: vi.fn(),
    deselectAll: vi.fn(),
    ...overrides,
  } as unknown as DateFacet;
};

const buildFakeDateFilter = (overrides?: Partial<DateFilter>): DateFilter => {
  return {
    state: {
      facetId: 'test-filter-id',
      enabled: true,
      isLoading: false,
      range: undefined,
      ...(overrides?.state || {}),
      // biome-ignore lint/suspicious/noExplicitAny: Test fixture builder requires flexible state override
    } as any,
    subscribe: genericSubscribe,
    setRange: vi.fn(),
    clear: vi.fn(),
    ...overrides,
  } as unknown as DateFilter;
};

describe('TimeframeFacetCommon', () => {
  let mockHost: HTMLElement;
  let mockBindings: Partial<Bindings>;
  let setFacetIdSpy: Mock<(id: string) => string>;
  let getSearchStatusStateSpy: Mock<() => SearchStatusState>;
  let buildDependenciesManagerSpy: Mock<
    (facetId: string) => ReturnType<typeof buildFakeFacetConditionsManager>
  >;
  let buildDateRangeSpy: Mock<
    (config: {start: unknown; end: unknown}) => DateRangeRequest
  >;
  let initializeFacetForDatePickerSpy: Mock<() => DateFacet>;
  let initializeFacetForDateRangeSpy: Mock<
    (values: DateRangeRequest[]) => DateFacet
  >;
  let initializeFilterSpy: Mock<() => DateFilter>;

  beforeEach(async () => {
    mockHost = document.createElement('div');
    mockHost.querySelectorAll = vi.fn(
      () => []
    ) as unknown as typeof mockHost.querySelectorAll;

    mockBindings = {
      store: {
        state: {
          dateFacets: {},
        },
        registerFacet: vi.fn(),
      },
      i18n: await createTestI18n(),
    } as unknown as Partial<Bindings>;

    setFacetIdSpy = vi.fn((id: string) => id);
    getSearchStatusStateSpy = vi.fn(
      () =>
        ({
          hasError: false,
          firstSearchExecuted: true,
          hasResults: true,
        }) as SearchStatusState
    );
    buildDependenciesManagerSpy = vi.fn(() =>
      buildFakeFacetConditionsManager()
    );
    buildDateRangeSpy = vi.fn(
      (config) => ({start: config.start, end: config.end}) as DateRangeRequest
    );
    initializeFacetForDatePickerSpy = vi.fn(() => buildFakeDateFacet());
    initializeFacetForDateRangeSpy = vi.fn(() => buildFakeDateFacet());
    initializeFilterSpy = vi.fn(() => buildFakeDateFilter());
  });

  const createInstance = (
    overrides: {
      facetId?: string;
      withDatePicker?: boolean;
      deserializeRelativeDate?: Mock<
        (date: string) => {period: string; unit?: string; amount?: number}
      >;
    } = {}
  ) => {
    return new TimeframeFacetCommon({
      facetId: overrides.facetId,
      host: mockHost,
      bindings: mockBindings as Bindings,
      label: 'test-label',
      field: 'date',
      headingLevel: 2,
      dependsOn: {},
      withDatePicker: overrides.withDatePicker ?? false,
      setFacetId: setFacetIdSpy,
      getSearchStatusState: getSearchStatusStateSpy,
      buildDependenciesManager: buildDependenciesManagerSpy,
      deserializeRelativeDate: overrides.deserializeRelativeDate ?? vi.fn(),
      buildDateRange: buildDateRangeSpy,
      initializeFacetForDatePicker: initializeFacetForDatePickerSpy,
      initializeFacetForDateRange: initializeFacetForDateRangeSpy,
      initializeFilter: initializeFilterSpy,
      sortCriteria: 'descending',
    });
  };

  it('should use props.facetId when provided', () => {
    const common = createInstance({facetId: 'custom-facet-id'});

    expect(setFacetIdSpy).toHaveBeenCalledWith('custom-facet-id');
    expect(common).toBeDefined();
  });

  it('should generate random facetId if field already exists in store', () => {
    // biome-ignore lint/suspicious/noExplicitAny: Test fixture requires any type
    mockBindings.store!.state.dateFacets.date = {} as any;

    createInstance();

    const capturedFacetId = setFacetIdSpy.mock.calls[0][0];
    expect(capturedFacetId).toContain('date_');
    expect(capturedFacetId).not.toBe('date');
  });

  it('should use field as facetId if no conflicts', () => {
    createInstance();

    expect(setFacetIdSpy).toHaveBeenCalledWith('date');
  });

  it('should parse manual timeframes from DOM', () => {
    const mockTimeframeElements = [
      {label: 'Last 24 hours', amount: 24, unit: 'hour', period: 'past'},
      {label: 'Last 7 days', amount: 7, unit: 'day', period: 'past'},
    ];

    mockHost.querySelectorAll = vi.fn(
      () => mockTimeframeElements
    ) as unknown as typeof mockHost.querySelectorAll;

    createInstance();

    expect(mockHost.querySelectorAll).toHaveBeenCalledWith('atomic-timeframe');
  });

  it('should create facetForDateRange when manualTimeframes.length > 0', () => {
    const mockTimeframeElements = [
      {label: 'Last 24 hours', amount: 24, unit: 'hour', period: 'past'},
    ];
    mockHost.querySelectorAll = vi.fn(
      () => mockTimeframeElements
    ) as unknown as typeof mockHost.querySelectorAll;

    createInstance();

    expect(initializeFacetForDateRangeSpy).toHaveBeenCalled();
  });

  it('should create facetForDatePicker when props.withDatePicker is true', () => {
    createInstance({withDatePicker: true});

    expect(initializeFacetForDatePickerSpy).toHaveBeenCalled();
  });

  it('should create filter when props.withDatePicker is true', () => {
    createInstance({withDatePicker: true});

    expect(initializeFilterSpy).toHaveBeenCalled();
  });

  it('should NOT create facetForDateRange when manualTimeframes is empty', () => {
    mockHost.querySelectorAll = vi.fn(
      () => []
    ) as unknown as typeof mockHost.querySelectorAll;

    createInstance();

    expect(initializeFacetForDateRangeSpy).not.toHaveBeenCalled();
  });

  it('should NOT create facetForDatePicker when props.withDatePicker is false', () => {
    createInstance();

    expect(initializeFacetForDatePickerSpy).not.toHaveBeenCalled();
  });

  it('should create facetForDateRangeDependenciesManager when facetForDateRange exists', () => {
    const mockTimeframeElements = [
      {label: 'Last 24 hours', amount: 24, unit: 'hour', period: 'past'},
    ];
    mockHost.querySelectorAll = vi.fn(
      () => mockTimeframeElements
    ) as unknown as typeof mockHost.querySelectorAll;

    createInstance();

    expect(buildDependenciesManagerSpy).toHaveBeenCalledWith('test-facet-id');
  });

  it('should create facetForDatePickerDependenciesManager when facetForDatePicker exists', () => {
    createInstance({withDatePicker: true});

    expect(buildDependenciesManagerSpy).toHaveBeenCalledWith('test-facet-id');
  });

  it('should create filterDependenciesManager when filter exists', () => {
    createInstance({withDatePicker: true});

    expect(buildDependenciesManagerSpy).toHaveBeenCalledWith('test-filter-id');
  });

  it('should NOT create facetForDateRangeDependenciesManager when facetForDateRange does not exist', () => {
    mockHost.querySelectorAll = vi.fn(
      () => []
    ) as unknown as typeof mockHost.querySelectorAll;

    createInstance();

    expect(buildDependenciesManagerSpy).not.toHaveBeenCalled();
  });

  it('should NOT create facetForDatePickerDependenciesManager when facetForDatePicker does not exist', () => {
    mockHost.querySelectorAll = vi.fn(
      () => []
    ) as unknown as typeof mockHost.querySelectorAll;

    createInstance();

    expect(buildDependenciesManagerSpy).not.toHaveBeenCalled();
  });

  it('should NOT create filterDependenciesManager when filter does not exist', () => {
    mockHost.querySelectorAll = vi.fn(
      () => []
    ) as unknown as typeof mockHost.querySelectorAll;

    createInstance();

    expect(buildDependenciesManagerSpy).not.toHaveBeenCalled();
  });

  it('should register facet to bindings.store.dateFacets with correct facetInfo', () => {
    createInstance();

    expect(mockBindings.store!.registerFacet).toHaveBeenCalledWith(
      'dateFacets',
      expect.objectContaining({
        facetId: 'date',
        element: mockHost,
      })
    );
  });

  it('should initialize popover with facet metadata', () => {
    // Test passes if registration completes without error
    // Popover initialization is tested indirectly via constructor
    createInstance();

    expect(mockBindings.store!.registerFacet).toHaveBeenCalled();
  });

  it('should alias filter.state.facetId in dateFacets when filter exists', () => {
    mockBindings.store!.state.dateFacets = {};

    createInstance({withDatePicker: true});

    const filterFacetId = 'test-filter-id';
    const mainFacetId = 'date';
    expect(mockBindings.store!.state.dateFacets[filterFacetId]).toBe(
      mockBindings.store!.state.dateFacets[mainFacetId]
    );
  });

  it('should provide format function that uses formatFacetValue', () => {
    createInstance();

    // biome-ignore lint/suspicious/noExplicitAny: Test spy access
    const registerCall = (mockBindings.store!.registerFacet as any).mock
      .calls[0];
    expect(registerCall[1]).toHaveProperty('format');
    expect(typeof registerCall[1].format).toBe('function');
  });

  describe('when formatting facet values through store callback', () => {
    it('should return custom label when matching timeframe exists', () => {
      const mockTimeframeElements = [
        {label: 'Last 24 hours', amount: 24, unit: 'hour', period: 'past'},
      ];
      mockHost.querySelectorAll = vi.fn(
        () => mockTimeframeElements
      ) as unknown as typeof mockHost.querySelectorAll;

      const deserializeRelativeDateSpy = vi.fn((date: string) => {
        if (date === '2023-01-01') {
          return {period: 'past' as const, unit: 'hour' as const, amount: 24};
        }
        return {period: 'now' as const};
      });

      createInstance({deserializeRelativeDate: deserializeRelativeDateSpy});

      // biome-ignore lint/suspicious/noExplicitAny: Test spy access
      const formatFn = (mockBindings.store!.registerFacet as any).mock
        .calls[0][1].format;

      const facetValue: DateFacetValue = {
        start: '2023-01-01',
        end: '2023-01-02',
        endInclusive: false,
        state: 'idle',
        numberOfResults: 10,
      };

      const result = formatFn(facetValue);
      expect(result).toBe('Last 24 hours');
    });

    it('should return i18n key when no custom label exists', () => {
      const mockTimeframeElements = [{amount: 7, unit: 'day', period: 'past'}];
      mockHost.querySelectorAll = vi.fn(
        () => mockTimeframeElements
      ) as unknown as typeof mockHost.querySelectorAll;

      const deserializeRelativeDateSpy = vi.fn((date: string) => {
        if (date === '2023-01-01') {
          return {period: 'past' as const, unit: 'day' as const, amount: 7};
        }
        return {period: 'now' as const};
      });

      createInstance({deserializeRelativeDate: deserializeRelativeDateSpy});

      // biome-ignore lint/suspicious/noExplicitAny: Test spy access
      const formatFn = (mockBindings.store!.registerFacet as any).mock
        .calls[0][1].format;

      const facetValue: DateFacetValue = {
        start: '2023-01-01',
        end: '2023-01-02',
        endInclusive: false,
        state: 'idle',
        numberOfResults: 10,
      };

      const result = formatFn(facetValue);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should use start date period for past ranges', () => {
      const mockTimeframeElements = [
        {amount: 24, unit: 'hour', period: 'past'},
      ];
      mockHost.querySelectorAll = vi.fn(
        () => mockTimeframeElements
      ) as unknown as typeof mockHost.querySelectorAll;

      const deserializeRelativeDateSpy = vi.fn((date: string) => {
        if (date === '2023-01-01') {
          return {period: 'past' as const, unit: 'hour' as const, amount: 24};
        }
        return {period: 'now' as const};
      });

      createInstance({deserializeRelativeDate: deserializeRelativeDateSpy});

      // biome-ignore lint/suspicious/noExplicitAny: Test spy access
      const formatFn = (mockBindings.store!.registerFacet as any).mock
        .calls[0][1].format;

      const facetValue: DateFacetValue = {
        start: '2023-01-01',
        end: '2023-01-02',
        endInclusive: false,
        state: 'idle',
        numberOfResults: 10,
      };

      formatFn(facetValue);
      expect(deserializeRelativeDateSpy).toHaveBeenCalledWith('2023-01-01');
    });

    it('should use end date period for future ranges', () => {
      const mockTimeframeElements = [{amount: 7, unit: 'day', period: 'next'}];
      mockHost.querySelectorAll = vi.fn(
        () => mockTimeframeElements
      ) as unknown as typeof mockHost.querySelectorAll;

      const deserializeRelativeDateSpy = vi.fn((date: string) => {
        if (date === '2023-01-01') {
          return {period: 'now' as const};
        }
        if (date === '2023-01-08') {
          return {period: 'next' as const, unit: 'day' as const, amount: 7};
        }
        return {period: 'now' as const};
      });

      createInstance({deserializeRelativeDate: deserializeRelativeDateSpy});

      // biome-ignore lint/suspicious/noExplicitAny: Test spy access
      const formatFn = (mockBindings.store!.registerFacet as any).mock
        .calls[0][1].format;

      const facetValue: DateFacetValue = {
        start: '2023-01-01',
        end: '2023-01-08',
        endInclusive: false,
        state: 'idle',
        numberOfResults: 10,
      };

      formatFn(facetValue);
      expect(deserializeRelativeDateSpy).toHaveBeenCalledWith('2023-01-08');
    });

    it('should fallback to date range format when deserialization fails', () => {
      const deserializeRelativeDateSpy = vi.fn(() => {
        throw new Error('Invalid date format');
      });

      createInstance({deserializeRelativeDate: deserializeRelativeDateSpy});

      // biome-ignore lint/suspicious/noExplicitAny: Test spy access
      const formatFn = (mockBindings.store!.registerFacet as any).mock
        .calls[0][1].format;

      const facetValue: DateFacetValue = {
        start: '2023-01-01T00:00:00.000Z',
        end: '2023-01-08T00:00:00.000Z',
        endInclusive: false,
        state: 'idle',
        numberOfResults: 10,
      };

      const result = formatFn(facetValue);
      expect(result).toContain('to');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('#currentValues', () => {
    it('should map manualTimeframes to DateRangeRequest array', () => {
      const mockTimeframeElements = [
        {label: 'Last 24 hours', amount: 24, unit: 'hour', period: 'past'},
        {label: 'Last 7 days', amount: 7, unit: 'day', period: 'past'},
      ];
      mockHost.querySelectorAll = vi.fn(
        () => mockTimeframeElements
      ) as unknown as typeof mockHost.querySelectorAll;

      const common = createInstance();

      const currentValues = common.currentValues;
      expect(currentValues).toHaveLength(2);
      expect(buildDateRangeSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('should build past ranges with start={period, unit, amount} and end={period: "now"}', () => {
      const mockTimeframeElements = [
        {label: 'Last 24 hours', amount: 24, unit: 'hour', period: 'past'},
      ];
      mockHost.querySelectorAll = vi.fn(
        () => mockTimeframeElements
      ) as unknown as typeof mockHost.querySelectorAll;

      const common = createInstance();

      common.currentValues;
      expect(buildDateRangeSpy).toHaveBeenCalledWith({
        start: {period: 'past', unit: 'hour', amount: 24},
        end: {period: 'now'},
      });
    });

    it('should build future ranges with start={period: "now"} and end={period, unit, amount}', () => {
      const mockTimeframeElements = [
        {label: 'Next 7 days', amount: 7, unit: 'day', period: 'next'},
      ];
      mockHost.querySelectorAll = vi.fn(
        () => mockTimeframeElements
      ) as unknown as typeof mockHost.querySelectorAll;

      const common = createInstance();

      common.currentValues;
      expect(buildDateRangeSpy).toHaveBeenCalledWith({
        start: {period: 'now'},
        end: {period: 'next', unit: 'day', amount: 7},
      });
    });
  });

  describe('#disconnectedCallback', () => {
    it('should return early if host.isConnected is true', () => {
      const mockTimeframeElements = [
        {label: 'Last 24 hours', amount: 24, unit: 'hour', period: 'past'},
      ];
      mockHost.querySelectorAll = vi.fn(
        () => mockTimeframeElements
      ) as unknown as typeof mockHost.querySelectorAll;
      Object.defineProperty(mockHost, 'isConnected', {
        value: true,
        writable: true,
      });

      const mockDepsManager = buildFakeFacetConditionsManager();
      buildDependenciesManagerSpy = vi.fn(() => mockDepsManager);

      const common = createInstance();

      common.disconnectedCallback();
      expect(mockDepsManager.stopWatching).not.toHaveBeenCalled();
    });

    it('should call stopWatching on facetForDateRangeDependenciesManager if it exists', () => {
      const mockTimeframeElements = [
        {label: 'Last 24 hours', amount: 24, unit: 'hour', period: 'past'},
      ];
      mockHost.querySelectorAll = vi.fn(
        () => mockTimeframeElements
      ) as unknown as typeof mockHost.querySelectorAll;
      Object.defineProperty(mockHost, 'isConnected', {
        value: false,
        writable: true,
      });

      const mockDepsManager = buildFakeFacetConditionsManager();
      buildDependenciesManagerSpy = vi.fn(() => mockDepsManager);

      const common = createInstance();

      common.disconnectedCallback();
      expect(mockDepsManager.stopWatching).toHaveBeenCalled();
    });

    it('should call stopWatching on facetForDatePickerDependenciesManager if it exists', () => {
      Object.defineProperty(mockHost, 'isConnected', {
        value: false,
        writable: true,
      });

      const mockDepsManager = buildFakeFacetConditionsManager();
      buildDependenciesManagerSpy = vi.fn(() => mockDepsManager);

      const common = createInstance({withDatePicker: true});

      common.disconnectedCallback();
      // Called twice: once for facetForDatePicker, once for filter
      expect(mockDepsManager.stopWatching).toHaveBeenCalledTimes(2);
    });

    it('should call stopWatching on filterDependenciesManager if it exists', () => {
      Object.defineProperty(mockHost, 'isConnected', {
        value: false,
        writable: true,
      });

      const mockDepsManager = buildFakeFacetConditionsManager();
      buildDependenciesManagerSpy = vi.fn(() => mockDepsManager);

      const common = createInstance({withDatePicker: true});

      common.disconnectedCallback();
      expect(mockDepsManager.stopWatching).toHaveBeenCalled();
    });

    it('should NOT throw if dependency managers are undefined', () => {
      Object.defineProperty(mockHost, 'isConnected', {
        value: false,
        writable: true,
      });

      const common = createInstance();

      expect(() => common.disconnectedCallback()).not.toThrow();
    });
  });

  describe('#render', () => {
    let mockHeaderFocus: FocusTargetController;

    beforeEach(() => {
      mockHeaderFocus = {
        setTarget: vi.fn(),
        focusAfterSearch: vi.fn(),
      } as unknown as FocusTargetController;
    });

    it('should render nothing when hasError is true', () => {
      const common = createInstance();

      const result = common.render({
        hasError: true,
        firstSearchExecuted: true,
        isCollapsed: false,
        headerFocus: mockHeaderFocus,
        onToggleCollapse: vi.fn(),
      });

      expect(result).toBe(nothing);
    });

    it('should render nothing when enabled is false', () => {
      initializeFacetForDatePickerSpy = vi.fn(() =>
        buildFakeDateFacet({
          state: {
            facetId: 'test',
            enabled: false,
            values: [],
            sortCriterion: 'descending',
            isLoading: false,
            hasActiveValues: false,
          },
        })
      );

      const common = createInstance({withDatePicker: true});

      const result = common.render({
        hasError: false,
        firstSearchExecuted: true,
        isCollapsed: false,
        headerFocus: mockHeaderFocus,
        onToggleCollapse: vi.fn(),
      });

      expect(result).toBe(nothing);
    });

    it('should render nothing when shouldRenderFacet is false', () => {
      mockHost.querySelectorAll = vi.fn(
        () => []
      ) as unknown as typeof mockHost.querySelectorAll;

      const common = createInstance();

      const result = common.render({
        hasError: false,
        firstSearchExecuted: true,
        isCollapsed: false,
        headerFocus: mockHeaderFocus,
        onToggleCollapse: vi.fn(),
      });

      expect(result).toBe(nothing);
    });

    it('should render a facet placeholder when firstSearchExecuted is false', async () => {
      const mockTimeframeElements = [
        {label: 'Last 24 hours', amount: 24, unit: 'hour', period: 'past'},
      ];
      mockHost.querySelectorAll = vi.fn(
        () => mockTimeframeElements
      ) as unknown as typeof mockHost.querySelectorAll;

      const common = createInstance();

      const result = common.render({
        hasError: false,
        firstSearchExecuted: false,
        isCollapsed: false,
        headerFocus: mockHeaderFocus,
        onToggleCollapse: vi.fn(),
      });

      const element = await renderFunctionFixture(html`${result}`);
      const placeholder = element.querySelector('[part="placeholder"]');

      expect(placeholder).not.toBeNull();
      expect(placeholder).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render a facet container with header when conditions met', async () => {
      const mockTimeframeElements = [
        {label: 'Last 24 hours', amount: 24, unit: 'hour', period: 'past'},
      ];
      mockHost.querySelectorAll = vi.fn(
        () => mockTimeframeElements
      ) as unknown as typeof mockHost.querySelectorAll;

      const mockFacetValue: DateFacetValue = {
        start: '2023-01-01',
        end: '2023-01-02',
        endInclusive: false,
        state: 'idle',
        numberOfResults: 10,
      };

      initializeFacetForDateRangeSpy = vi.fn(() =>
        buildFakeDateFacet({
          state: {
            facetId: 'test',
            enabled: true,
            values: [mockFacetValue],
            sortCriterion: 'descending',
            isLoading: false,
            hasActiveValues: false,
          },
        })
      );

      const common = createInstance();

      const result = common.render({
        hasError: false,
        firstSearchExecuted: true,
        isCollapsed: false,
        headerFocus: mockHeaderFocus,
        onToggleCollapse: vi.fn(),
      });

      const element = await renderFunctionFixture(html`${result}`);
      const facetContainer = element.querySelector('[part="facet"]');

      expect(facetContainer).not.toBeNull();
      expect(result).not.toBe(nothing);
    });

    it('should NOT render values/input when isCollapsed is true', async () => {
      const mockTimeframeElements = [
        {label: 'Last 24 hours', amount: 24, unit: 'hour', period: 'past'},
      ];
      mockHost.querySelectorAll = vi.fn(
        () => mockTimeframeElements
      ) as unknown as typeof mockHost.querySelectorAll;

      const mockFacetValue: DateFacetValue = {
        start: '2023-01-01',
        end: '2023-01-02',
        endInclusive: false,
        state: 'idle',
        numberOfResults: 10,
      };

      initializeFacetForDateRangeSpy = vi.fn(() =>
        buildFakeDateFacet({
          state: {
            facetId: 'test',
            enabled: true,
            values: [mockFacetValue],
            sortCriterion: 'descending',
            isLoading: false,
            hasActiveValues: false,
          },
        })
      );

      const common = createInstance();

      const result = common.render({
        hasError: false,
        firstSearchExecuted: true,
        isCollapsed: true,
        headerFocus: mockHeaderFocus,
        onToggleCollapse: vi.fn(),
      });

      const element = await renderFunctionFixture(html`${result}`);
      const facetContainer = element.querySelector('[part="facet"]');
      const values = element.querySelector('[part="values"]');
      const dateInput = element.querySelector('atomic-facet-date-input');

      expect(facetContainer).not.toBeNull();
      expect(values).toBeNull();
      expect(dateInput).toBeNull();
    });

    it('should render values when not collapsed and shouldRenderValues is true', async () => {
      const mockTimeframeElements = [
        {label: 'Last 24 hours', amount: 24, unit: 'hour', period: 'past'},
      ];
      mockHost.querySelectorAll = vi.fn(
        () => mockTimeframeElements
      ) as unknown as typeof mockHost.querySelectorAll;

      const mockFacetValue: DateFacetValue = {
        start: '2023-01-01',
        end: '2023-01-02',
        endInclusive: false,
        state: 'idle',
        numberOfResults: 10,
      };

      initializeFacetForDateRangeSpy = vi.fn(() =>
        buildFakeDateFacet({
          state: {
            facetId: 'test',
            enabled: true,
            values: [mockFacetValue],
            sortCriterion: 'descending',
            isLoading: false,
            hasActiveValues: false,
          },
        })
      );

      const common = createInstance();

      const result = common.render({
        hasError: false,
        firstSearchExecuted: true,
        isCollapsed: false,
        headerFocus: mockHeaderFocus,
        onToggleCollapse: vi.fn(),
      });

      const element = await renderFunctionFixture(html`${result}`);
      const values = element.querySelector('[part="values"]');

      expect(values).not.toBeNull();
    });

    it('should render date input when not collapsed and withDatePicker is true', async () => {
      initializeFilterSpy = vi.fn(() =>
        buildFakeDateFilter({
          state: {
            facetId: 'test-filter-id',
            enabled: true,
            isLoading: false,
            range: {
              start: '2023-01-01',
              end: '2023-01-31',
              numberOfResults: 10,
              endInclusive: true,
              state: 'selected',
            },
          },
        })
      );

      const common = createInstance({withDatePicker: true});

      const result = common.render({
        hasError: false,
        firstSearchExecuted: true,
        isCollapsed: false,
        headerFocus: mockHeaderFocus,
        onToggleCollapse: vi.fn(),
      });

      const element = await renderFunctionFixture(html`${result}`);
      const dateInput = element.querySelector('atomic-facet-date-input');

      expect(dateInput).not.toBeNull();
    });
  });
});
