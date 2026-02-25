/** biome-ignore-all lint/style/noNonNullAssertion: For testing, locators should always exist */

import {
  buildDateFacet,
  buildDateFilter,
  buildFacetConditionsManager,
  buildSearchStatus,
  type DateFacet,
  type DateFilter,
  type DateRangeRequest,
  loadDateFacetSetActions,
  type SearchStatus,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  type MockInstance,
  vi,
} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import {shouldDisplayInputForFacetRange} from '@/src/components/common/facets/facet-common';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/search-status-controller';
import {buildFakeFacetConditionsManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-conditions-manager';
import '@/src/components/common/atomic-timeframe/atomic-timeframe';
import type {AtomicInsightTimeframeFacet} from './atomic-insight-timeframe-facet';
import './atomic-insight-timeframe-facet';

vi.mock('@coveo/headless/insight', {spy: true});
vi.mock('@/src/components/common/facets/facet-common', {spy: true});

describe('atomic-insight-timeframe-facet', () => {
  let mockedRegisterFacet: Mock;
  let mockedDateFacet: DateFacet;
  let mockedDateFilter: DateFilter;
  let mockedSearchStatus: SearchStatus;
  let mockedDeselectAllDateFacetValues: Mock;

  const buildMockDateFacetValue = (
    overrides?: Partial<{
      start: string;
      end: string;
      numberOfResults: number;
      state: 'idle' | 'selected' | 'excluded';
      endInclusive: boolean;
    }>
  ) => ({
    start: 'past-1-month',
    end: 'now',
    numberOfResults: 10,
    state: 'idle' as 'idle' | 'selected' | 'excluded',
    endInclusive: false,
    ...overrides,
  });

  const createMockDateFacet = (options?: {
    state?: Partial<{
      facetId: string;
      values: ReturnType<typeof buildMockDateFacetValue>[];
      hasActiveValues: boolean;
      sortCriterion: 'ascending' | 'descending';
      isLoading: boolean;
      enabled: boolean;
    }>;
    toggleSingleSelect?: Mock;
    deselectAll?: Mock;
    setRanges?: Mock;
  }): DateFacet => {
    const state = {
      facetId: 'date',
      values: [
        buildMockDateFacetValue({
          start: 'past-1-month',
          end: 'now',
          numberOfResults: 10,
        }),
        buildMockDateFacetValue({
          start: 'past-1-year',
          end: 'now',
          numberOfResults: 5,
        }),
      ],
      hasActiveValues: false,
      sortCriterion: 'descending' as const,
      isLoading: false,
      enabled: true,
      ...options?.state,
    };
    return {
      get state() {
        return state;
      },
      subscribe: vi.fn((cb: () => void) => {
        cb();
        return vi.fn();
      }),
      toggleSingleSelect: options?.toggleSingleSelect ?? vi.fn(),
      deselectAll: options?.deselectAll ?? vi.fn(),
      setRanges: options?.setRanges ?? vi.fn(),
    } as unknown as DateFacet;
  };

  beforeEach(() => {
    vi.mocked(shouldDisplayInputForFacetRange).mockReset();
    mockedRegisterFacet = vi.fn();
    mockedDeselectAllDateFacetValues = vi
      .fn()
      .mockReturnValue({type: 'mock-deselect'});
    mockedDateFacet = createMockDateFacet();
    mockedDateFilter = {
      get state() {
        return {
          facetId: 'date_input',
          range: undefined as DateRangeRequest | undefined,
          enabled: true,
          isLoading: false,
        };
      },
      subscribe: vi.fn((cb: () => void) => {
        cb();
        return vi.fn();
      }),
      setRange: vi.fn(),
      clear: vi.fn(),
    } as unknown as DateFilter;
    mockedSearchStatus = buildFakeSearchStatus({firstSearchExecuted: true});
  });

  const setupElement = async (
    props?: Partial<{
      field: string;
      label: string;
      withDatePicker: boolean;
      isCollapsed: boolean;
      headingLevel: number;
      filterFacetCount: boolean;
      injectionDepth: number;
      dependsOn: Record<string, string>;
      sortCriteria: 'ascending' | 'descending';
      facetId: string;
    }>
  ) => {
    vi.mocked(buildDateFacet).mockReturnValue(mockedDateFacet);
    vi.mocked(buildDateFilter).mockReturnValue(mockedDateFilter);
    vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);
    vi.mocked(buildFacetConditionsManager).mockReturnValue(
      buildFakeFacetConditionsManager({})
    );
    vi.mocked(loadDateFacetSetActions).mockReturnValue({
      deselectAllDateFacetValues: mockedDeselectAllDateFacetValues,
    } as unknown as ReturnType<typeof loadDateFacetSetActions>);

    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightTimeframeFacet>({
        template: html`<atomic-insight-timeframe-facet
          field=${props?.field ?? 'date'}
          label=${props?.label ?? 'Date'}
          facet-id=${ifDefined(props?.facetId)}
          sort-criteria=${ifDefined(props?.sortCriteria)}
          injection-depth=${ifDefined(props?.injectionDepth)}
          heading-level=${ifDefined(props?.headingLevel)}
          .dependsOn=${props?.dependsOn || {}}
          ?filter-facet-count=${props?.filterFacetCount}
          ?is-collapsed=${props?.isCollapsed}
          ?with-date-picker=${props?.withDatePicker}
        >
          <atomic-timeframe
            period="past"
            unit="month"
            amount="1"
          ></atomic-timeframe>
          <atomic-timeframe
            period="past"
            unit="year"
            amount="1"
          ></atomic-timeframe>
        </atomic-insight-timeframe-facet>`,
        selector: 'atomic-insight-timeframe-facet',
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
      });

    const qs = <T extends HTMLElement>(selector: string) =>
      element.shadowRoot!.querySelector<T>(selector);
    const qsa = <T extends HTMLElement>(selector: string) =>
      element.shadowRoot!.querySelectorAll<T>(selector);

    return {
      element,
      getFacetValueByPosition(valuePosition: number) {
        return page.getByRole('listitem').nth(valuePosition);
      },
      get facet() {
        return qs('[part~=facet]')!;
      },
      get placeholder() {
        return qs('[part~=placeholder]');
      },
      get labelButton() {
        return qs('[part~=label-button]')!;
      },
      get labelButtonIcon() {
        return qs('[part~=label-button-icon]')!;
      },
      get clearButton() {
        return qs<HTMLButtonElement>('[part~=clear-button]')!;
      },
      get values() {
        return qs('[part~=values]')!;
      },
      get valueLabel() {
        return qsa('[part~=value-label]');
      },
      get valueCount() {
        return qsa('[part~=value-count]');
      },
      get valueLink() {
        return qsa('[part~=value-link]');
      },
      get dateInput() {
        return qs('atomic-facet-date-input')!;
      },
      get inputStart() {
        return element.shadowRoot!.querySelector(
          '[part~=input-start]'
        )! as HTMLInputElement;
      },
      get inputEnd() {
        return element.shadowRoot!.querySelector(
          '[part~=input-end]'
        )! as HTMLInputElement;
      },
      get inputApplyButton() {
        return element.shadowRoot!.querySelector(
          '[part~=input-apply-button]'
        )! as HTMLButtonElement;
      },
    };
  };

  describe('#initialize', () => {
    it('should build search status controller with engine', async () => {
      const {element} = await setupElement();
      expect(buildSearchStatus).toHaveBeenCalledWith(element.bindings.engine);
      expect(element.searchStatus).toBeDefined();
    });

    it('should call buildDateFacet with engine and correct options', async () => {
      const {element} = await setupElement({
        field: 'customdate',
        sortCriteria: 'ascending',
        injectionDepth: 500,
      });

      expect(buildDateFacet).toHaveBeenCalledWith(element.bindings.engine, {
        options: expect.objectContaining({
          field: 'customdate',
          sortCriteria: 'ascending',
          injectionDepth: 500,
          generateAutomaticRanges: false,
        }),
      });
    });

    it('should register facet in store', async () => {
      await setupElement();
      expect(mockedRegisterFacet).toHaveBeenCalled();
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

    describe('when prop validation fails', () => {
      let consoleWarnSpy: MockInstance;

      beforeEach(() => {
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      });

      it.each<{
        prop: 'sortCriteria' | 'headingLevel' | 'injectionDepth';
        validValue: string | number;
        invalidValue: string | number;
      }>([
        {
          prop: 'sortCriteria',
          validValue: 'ascending',
          invalidValue: 'invalid',
        },
        {prop: 'headingLevel', validValue: 2, invalidValue: 7},
        {prop: 'injectionDepth', validValue: 1000, invalidValue: -1},
      ])(
        'should log validation warning when #$prop is updated to invalid value',
        async ({prop, validValue, invalidValue}) => {
          const {element} = await setupElement({[prop]: validValue});

          // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
          (element as any)[prop] = invalidValue;
          await element.updateComplete;

          expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining(
              'Prop validation failed for component atomic-insight-timeframe-facet'
            ),
            element
          );
          expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining(prop),
            element
          );
        }
      );
    });
  });

  describe('#render', () => {
    it('should render the facet', async () => {
      const {facet} = await setupElement();
      await expect.element(facet).toBeInTheDocument();
    });

    it('should render facet values', async () => {
      const {valueLabel} = await setupElement();

      expect(valueLabel).toHaveLength(2);
      await expect.element(valueLabel[0]).toBeInTheDocument();
      await expect.element(valueLabel[1]).toBeInTheDocument();
    });

    it('should render the values container', async () => {
      const {values} = await setupElement();
      await expect.element(values).toBeInTheDocument();
    });

    it('should render the first facet value', async () => {
      const {getFacetValueByPosition} = await setupElement();
      const facetValue = getFacetValueByPosition(0);
      await expect.element(facetValue).toBeVisible();
    });

    it('should render the label button part', async () => {
      const {labelButton} = await setupElement();
      await expect.element(labelButton).toBeInTheDocument();
    });

    it('should render the label button icon part', async () => {
      const {labelButtonIcon} = await setupElement();
      await expect.element(labelButtonIcon).toBeInTheDocument();
    });

    it('should render value count parts', async () => {
      const {valueCount} = await setupElement();
      await expect.element(valueCount[0]).toBeInTheDocument();
    });

    it('should render value link parts', async () => {
      const {valueLink} = await setupElement();
      await expect.element(valueLink[0]).toBeInTheDocument();
    });

    it('should render placeholder before first search is executed', async () => {
      mockedSearchStatus = buildFakeSearchStatus({
        firstSearchExecuted: false,
      });

      const {placeholder, facet} = await setupElement();
      expect(placeholder).not.toBeNull();
      expect(facet).not.toBeInTheDocument();
    });

    it('should not render facet when there is an error', async () => {
      mockedSearchStatus = buildFakeSearchStatus({
        firstSearchExecuted: true,
        hasError: true,
      });

      const {facet} = await setupElement();
      expect(facet).not.toBeInTheDocument();
    });

    it('should not render facet when no values are available', async () => {
      mockedDateFacet = createMockDateFacet({state: {values: []}});

      const {facet} = await setupElement();
      expect(facet).not.toBeInTheDocument();
    });

    it('should not render facet when disabled', async () => {
      mockedDateFacet = createMockDateFacet({state: {enabled: false}});

      const {facet} = await setupElement();
      expect(facet).not.toBeInTheDocument();
    });

    it('should not render values when numberOfResults is 0 and state is idle', async () => {
      mockedDateFacet = createMockDateFacet({
        state: {
          values: [
            buildMockDateFacetValue({numberOfResults: 0, state: 'idle'}),
          ],
        },
      });

      const {values} = await setupElement();
      expect(values).not.toBeInTheDocument();
    });

    it('should not render values when collapsed', async () => {
      const {values} = await setupElement({isCollapsed: true});
      expect(values).not.toBeInTheDocument();
    });

    describe('when withDatePicker is enabled', () => {
      it('should render date input when #shouldDisplayInputForFacetRange returns true', async () => {
        vi.mocked(shouldDisplayInputForFacetRange).mockReturnValue(true);
        const {dateInput} = await setupElement({withDatePicker: true});
        await expect.element(dateInput).toBeInTheDocument();
      });

      it('should not render date input when #shouldDisplayInputForFacetRange returns false', async () => {
        vi.mocked(shouldDisplayInputForFacetRange).mockReturnValue(false);
        const {dateInput} = await setupElement({withDatePicker: true});
        expect(dateInput).not.toBeInTheDocument();
      });
    });
  });

  describe('when interacting with facet values', () => {
    it('should call #toggleSingleSelect when value is clicked', async () => {
      const mockToggleSingleSelect = vi.fn();
      const mockValue = buildMockDateFacetValue({
        start: 'past-1-month',
        end: 'now',
        numberOfResults: 10,
        state: 'idle',
      });

      mockedDateFacet = createMockDateFacet({
        toggleSingleSelect: mockToggleSingleSelect,
        state: {values: [mockValue]},
      });

      const {valueLink} = await setupElement();
      await userEvent.click(valueLink[0]);

      expect(mockToggleSingleSelect).toHaveBeenCalledWith(mockValue);
    });

    it('should call #deselectAll when clear button is clicked', async () => {
      const mockDeselectAll = vi.fn();
      mockedDateFacet = createMockDateFacet({
        deselectAll: mockDeselectAll,
        state: {
          values: [
            buildMockDateFacetValue({state: 'selected', numberOfResults: 5}),
          ],
        },
      });

      const {clearButton} = await setupElement();
      await clearButton.click();

      expect(mockDeselectAll).toHaveBeenCalled();
    });

    it('should call #focusAfterSearch when clear button is clicked', async () => {
      const focusAfterSearchSpy = vi.spyOn(
        FocusTargetController.prototype,
        'focusAfterSearch'
      );
      mockedDateFacet = createMockDateFacet({
        state: {
          values: [
            buildMockDateFacetValue({state: 'selected', numberOfResults: 5}),
          ],
        },
      });

      const {clearButton} = await setupElement();
      await clearButton.click();

      expect(focusAfterSearchSpy).toHaveBeenCalled();
    });
  });

  describe('when toggling collapse', () => {
    it('should toggle collapse state', async () => {
      const {element, labelButton} = await setupElement({
        isCollapsed: true,
      });

      await userEvent.click(labelButton);
      expect(element.isCollapsed).toBe(false);

      await userEvent.click(labelButton);
      expect(element.isCollapsed).toBe(true);
    });
  });

  describe('when date input is applied', () => {
    it('should dispatch deselectAllDateFacetValues action', async () => {
      vi.mocked(shouldDisplayInputForFacetRange).mockReturnValue(true);
      const {element} = await setupElement({withDatePicker: true});

      element.dispatchEvent(
        new CustomEvent('atomic-date-input-apply', {
          detail: {start: '2023-01-01', end: '2023-12-31'},
          bubbles: true,
          composed: true,
        })
      );

      expect(mockedDeselectAllDateFacetValues).toHaveBeenCalledWith('date');
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
