import {
  buildDateFacet,
  buildDateFilter,
  buildFacetConditionsManager,
  buildSearchStatus,
  buildTabManager,
} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import {shouldDisplayInputForFacetRange} from '@/src/components/common/facets/facet-common';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeDateFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/search/date-facet-controller';
import {buildFakeDateFacetValue} from '@/vitest-utils/testing-helpers/fixtures/headless/search/date-facet-value';
import {buildFakeDateFilter} from '@/vitest-utils/testing-helpers/fixtures/headless/search/date-filter-controller';
import {buildFakeFacetConditionsManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-conditions-manager';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import type {AtomicTimeframeFacet} from './atomic-timeframe-facet';
import './atomic-timeframe-facet';

vi.mock('@coveo/headless', {spy: true});
vi.mock('@/src/components/common/facets/facet-common', {spy: true});

describe('atomic-timeframe-facet', () => {
  let mockedRegisterFacet: MockInstance;

  beforeEach(() => {
    mockConsole();
    mockedRegisterFacet = vi.fn();
    vi.mocked(buildDateFacet).mockReturnValue(
      buildFakeDateFacet({
        state: {
          facetId: 'date',
          field: 'date',
          values: [
            buildFakeDateFacetValue({
              start: 'past-1-month',
              end: 'now',
              numberOfResults: 10,
              state: 'idle',
            }),
            buildFakeDateFacetValue({
              start: 'past-3-months',
              end: 'now',
              numberOfResults: 20,
              state: 'idle',
            }),
          ],
        },
      })
    );
    vi.mocked(buildDateFilter).mockReturnValue(buildFakeDateFilter({}));
    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({firstSearchExecuted: true})
    );
    vi.mocked(buildTabManager).mockReturnValue(buildFakeTabManager({}));
    vi.mocked(buildFacetConditionsManager).mockReturnValue(
      buildFakeFacetConditionsManager({})
    );
    vi.mocked(shouldDisplayInputForFacetRange).mockReturnValue(false);
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
        filter-facet-count=${ifDefined(props?.filterFacetCount)}
        is-collapsed=${ifDefined(props?.isCollapsed)}
        with-date-picker=${ifDefined(props?.withDatePicker)}
        min=${ifDefined(props?.min)}
        max=${ifDefined(props?.max)}
      >
        <atomic-timeframe unit="month" amount="1" period="past"></atomic-timeframe>
        <atomic-timeframe unit="month" amount="3" period="past"></atomic-timeframe>
      </atomic-timeframe-facet>`,
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

    return {
      element,
      getFacetValueByPosition(valuePosition: number) {
        return page.getByRole('listitem').nth(valuePosition);
      },
      getFacetValueByLabel(value: string | RegExp) {
        return page.getByRole('listitem').filter({hasText: value});
      },
      getFacetValueButtonByLabel(value: string | RegExp) {
        return page.getByLabelText(`Inclusion filter on ${value}`);
      },
      get facet() {
        return element.shadowRoot!.querySelector('[part=facet]')!;
      },
      get placeholder() {
        return element.shadowRoot!.querySelector('[part=placeholder]')!;
      },
      get title() {
        return page.getByText('Date', {exact: true});
      },
      get componentError() {
        return page.getByText(/error/i);
      },
      get clearButton() {
        return element.shadowRoot!.querySelector(
          '[part=clear-button]'
        ) as HTMLButtonElement;
      },
      get labelButton() {
        return element.shadowRoot!.querySelector('[part=label-button]')!;
      },
      get labelButtonIcon() {
        return element.shadowRoot!.querySelector('[part=label-button-icon]')!;
      },
      get values() {
        return element.shadowRoot!.querySelector('[part=values]')!;
      },
      get valueLabel() {
        return element.shadowRoot!.querySelectorAll('[part=value-label]');
      },
      get valueCount() {
        return element.shadowRoot!.querySelectorAll('[part=value-count]');
      },
      get valueLink() {
        return element.shadowRoot!.querySelectorAll('[part=value-link]');
      },
      get dateInput() {
        return element.shadowRoot!.querySelector('atomic-facet-date-input')!;
      },
      get inputStart() {
        return element.shadowRoot!.querySelector(
          '[part=input-start]'
        )! as HTMLInputElement;
      },
      get inputEnd() {
        return element.shadowRoot!.querySelector(
          '[part=input-end]'
        )! as HTMLInputElement;
      },
      get inputApplyButton() {
        return element.shadowRoot!.querySelector(
          '[part=input-apply-button]'
        )! as HTMLButtonElement;
      },
    };
  };

  describe('when rendering (#render)', () => {
    it('should render the title', async () => {
      const {title} = await setupElement();
      await expect.element(title).toBeVisible();
    });

    it('should render the facet', async () => {
      const {facet} = await setupElement();
      await expect.element(facet).toBeVisible();
    });

    it('should render the first facet value', async () => {
      const {getFacetValueByPosition} = await setupElement();
      const facetValue = getFacetValueByPosition(0);
      await expect.element(facetValue).toBeVisible();
    });

    it('should render facet values', async () => {
      const {valueLabel} = await setupElement();

      expect(valueLabel).toHaveLength(2);
      await expect.element(valueLabel[0]).toBeInTheDocument();
      await expect.element(valueLabel[1]).toBeInTheDocument();
    });

    it('should render values', async () => {
      const {values} = await setupElement();
      await expect.element(values).toBeInTheDocument();
    });

    it('should render the first facet value label', async () => {
      const {getFacetValueByLabel} = await setupElement();
      const facetValueLabel = getFacetValueByLabel('Past Month');
      await expect.element(facetValueLabel).toBeVisible();
    });

    it('should render the first facet value button label', async () => {
      const {getFacetValueButtonByLabel} = await setupElement();
      const facetValueButton = getFacetValueButtonByLabel('Past Month');
      await expect.element(facetValueButton).toBeVisible();
    });

    it('should render the label button part', async () => {
      const {labelButton} = await setupElement();
      await expect.element(labelButton).toBeInTheDocument();
    });

    it('should render the label button icon part', async () => {
      const {labelButtonIcon} = await setupElement();
      await expect.element(labelButtonIcon).toBeInTheDocument();
    });

    it('should render the first value count part', async () => {
      const {valueCount} = await setupElement();
      await expect.element(valueCount![0]).toBeInTheDocument();
    });

    it('should render the first value part', async () => {
      const {valueLink} = await setupElement();
      await expect.element(valueLink![0]).toBeInTheDocument();
    });

    describe('when withDatePicker is true', () => {
      it('should render input start when shouldDisplayInputForFacetRange returns true', async () => {
        vi.mocked(shouldDisplayInputForFacetRange).mockReturnValue(true);
        const {inputStart} = await setupElement({withDatePicker: true});
        await expect.element(inputStart).toBeInTheDocument();
      });

      it('should render input end when shouldDisplayInputForFacetRange returns true', async () => {
        vi.mocked(shouldDisplayInputForFacetRange).mockReturnValue(true);
        const {inputEnd} = await setupElement({withDatePicker: true});
        await expect.element(inputEnd).toBeInTheDocument();
      });

      it('should render date input when shouldDisplayInputForFacetRange returns true', async () => {
        vi.mocked(shouldDisplayInputForFacetRange).mockReturnValue(true);
        const {dateInput} = await setupElement({withDatePicker: true});
        await expect.element(dateInput).toBeInTheDocument();
      });

      it('should not render date input when shouldDisplayInputForFacetRange returns false', async () => {
        vi.mocked(shouldDisplayInputForFacetRange).mockReturnValue(false);
        const {dateInput} = await setupElement({withDatePicker: true});
        await expect.element(dateInput).not.toBeInTheDocument();
      });
    });

    it('should not render values when numberOfResults is 0 and state is idle', async () => {
      vi.mocked(buildDateFacet).mockReturnValue(
        buildFakeDateFacet({
          state: {
            values: [
              buildFakeDateFacetValue({
                start: 'past-1-month',
                end: 'now',
                numberOfResults: 0,
                state: 'idle',
              }),
            ],
          },
        })
      );

      const {values} = await setupElement();
      await expect.element(values).not.toBeInTheDocument();
    });

    it('should not render facet when there are no values', async () => {
      vi.mocked(buildDateFacet).mockReturnValue(
        buildFakeDateFacet({
          state: {
            values: [],
          },
        })
      );

      const {facet} = await setupElement();
      expect(facet).not.toBeInTheDocument();
    });

    it('should not render values when collapsed', async () => {
      const {values} = await setupElement({
        isCollapsed: true,
      });

      await expect.element(values).not.toBeInTheDocument();
    });

    it('should not render facet when search status has error', async () => {
      vi.mocked(buildSearchStatus).mockReturnValue(
        buildFakeSearchStatus({
          hasError: true,
          firstSearchExecuted: true,
        })
      );

      const {facet} = await setupElement();
      await expect.element(facet).not.toBeInTheDocument();
    });

    it('should render placeholder when first search not executed', async () => {
      vi.mocked(buildSearchStatus).mockReturnValue(
        buildFakeSearchStatus({
          firstSearchExecuted: false,
        })
      );

      const {placeholder} = await setupElement();
      await expect.element(placeholder).toBeInTheDocument();
    });
  });

  describe('props', () => {
    describe('field', () => {
      it('should pass field to buildDateFacet', async () => {
        await setupElement({field: 'customfield'});
        expect(buildDateFacet).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.objectContaining({
              field: 'customfield',
            }),
          })
        );
      });
    });

    describe('facetId', () => {
      it('should pass facetId to buildDateFacet when provided', async () => {
        await setupElement({facetId: 'my-facet-id'});
        expect(buildDateFacet).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.objectContaining({
              facetId: 'my-facet-id',
            }),
          })
        );
      });

      it('should use field as facetId when facetId is not provided', async () => {
        await setupElement({field: 'date'});
        expect(buildDateFacet).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.objectContaining({
              facetId: 'date',
            }),
          })
        );
      });
    });

    describe('sortCriteria', () => {
      it('should pass sortCriteria to buildDateFacet', async () => {
        await setupElement({sortCriteria: 'ascending'});
        expect(buildDateFacet).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.objectContaining({
              sortCriteria: 'ascending',
            }),
          })
        );
      });
    });

    describe('filterFacetCount', () => {
      it('should pass filterFacetCount to buildDateFacet', async () => {
        await setupElement({filterFacetCount: false});
        expect(buildDateFacet).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.objectContaining({
              filterFacetCount: false,
            }),
          })
        );
      });
    });

    describe('injectionDepth', () => {
      it('should pass injectionDepth to buildDateFacet', async () => {
        await setupElement({injectionDepth: 2000});
        expect(buildDateFacet).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.objectContaining({
              injectionDepth: 2000,
            }),
          })
        );
      });

      it('should warn when injectionDepth is negative', async () => {
        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        await setupElement({injectionDepth: -1});
        expect(consoleWarnSpy).toHaveBeenCalled();
      });
    });

    describe('tabsIncluded', () => {
      it('should pass tabsIncluded to buildDateFacet', async () => {
        await setupElement({tabsIncluded: ['tab1', 'tab2']});
        expect(buildDateFacet).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.objectContaining({
              tabs: expect.objectContaining({
                included: ['tab1', 'tab2'],
              }),
            }),
          })
        );
      });
    });

    describe('tabsExcluded', () => {
      it('should pass tabsExcluded to buildDateFacet', async () => {
        await setupElement({tabsExcluded: ['tab1', 'tab2']});
        expect(buildDateFacet).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.objectContaining({
              tabs: expect.objectContaining({
                excluded: ['tab1', 'tab2'],
              }),
            }),
          })
        );
      });
    });

    it('should warn when both tabsIncluded and tabsExcluded are provided', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      await setupElement({
        tabsIncluded: ['tab1'],
        tabsExcluded: ['tab2'],
      });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('tabs-included')
      );
    });
  });

  describe('#controllers', () => {
    it('should build date facet controller', async () => {
      await setupElement();
      expect(buildDateFacet).toHaveBeenCalled();
    });

    it('should build search status controller', async () => {
      await setupElement();
      expect(buildSearchStatus).toHaveBeenCalled();
    });

    it('should build tab manager controller', async () => {
      await setupElement();
      expect(buildTabManager).toHaveBeenCalled();
    });

    it('should build date filter controller when withDatePicker is true', async () => {
      await setupElement({withDatePicker: true});
      expect(buildDateFilter).toHaveBeenCalled();
    });

    it('should build two date facet controllers when withDatePicker is true', async () => {
      await setupElement({withDatePicker: true});
      expect(buildDateFacet).toHaveBeenCalledTimes(2);
    });

    it('should build facet conditions manager when dependsOn is provided', async () => {
      await setupElement({dependsOn: {abc: 'value'}});
      expect(buildFacetConditionsManager).toHaveBeenCalled();
    });
  });

  describe('when removed from the DOM (#disconnectedCallback)', () => {
    it('should stop watching dependencies when component is removed', async () => {
      const stopWatching = vi.fn();
      vi.mocked(buildFacetConditionsManager).mockReturnValue(
        buildFakeFacetConditionsManager({
          implementation: {
            stopWatching,
          },
        })
      );

      const {element} = await setupElement({dependsOn: {abc: 'value'}});
      element.remove();

      expect(stopWatching).toHaveBeenCalled();
    });
  });

  describe('#interactions', () => {
    it('should call toggleSingleSelect when value is clicked', async () => {
      const toggleSingleSelect = vi.fn();
      vi.mocked(buildDateFacet).mockReturnValue(
        buildFakeDateFacet({
          implementation: {
            toggleSingleSelect,
          },
        })
      );

      const {getFacetValueButtonByLabel} = await setupElement();
      const facetValueButton = getFacetValueButtonByLabel('Past Month');

      await facetValueButton.click();

      expect(toggleSingleSelect).toHaveBeenCalled();
    });

    it('should call deselectAll when clear button is clicked', async () => {
      const deselectAll = vi.fn();
      vi.mocked(buildDateFacet).mockReturnValue(
        buildFakeDateFacet({
          state: {
            values: [
              buildFakeDateFacetValue({
                state: 'selected',
              }),
            ],
          },
          implementation: {
            deselectAll,
          },
        })
      );

      const {clearButton} = await setupElement();

      await clearButton.click();

      expect(deselectAll).toHaveBeenCalled();
    });

    it('should call filter.setRange when apply button is clicked with date picker enabled', async () => {
      const setRange = vi.fn();
      vi.mocked(buildDateFilter).mockReturnValue(
        buildFakeDateFilter({
          implementation: {
            setRange,
          },
        })
      );
      vi.mocked(shouldDisplayInputForFacetRange).mockReturnValue(true);

      const {element} = await setupElement({
        withDatePicker: true,
      });

      const dateInput = element.shadowRoot!.querySelector(
        'atomic-facet-date-input'
      )!;

      const customEvent = new CustomEvent('atomic-date-input-apply', {
        detail: {
          start: '2023-01-01',
          end: '2023-12-31',
          endInclusive: true,
        },
        bubbles: true,
        composed: true,
      });

      dateInput.dispatchEvent(customEvent);

      expect(setRange).toHaveBeenCalledWith({
        start: '2023-01-01',
        end: '2023-12-31',
        endInclusive: true,
      });
    });
  });

  describe('#store', () => {
    it('should register facet with store', async () => {
      await setupElement();
      expect(mockedRegisterFacet).toHaveBeenCalledWith(
        'dateFacets',
        expect.objectContaining({
          label: expect.any(Function),
          facetId: expect.any(String),
          element: expect.anything(),
          isHidden: expect.any(Function),
          format: expect.any(Function),
        })
      );
    });
  });
});
