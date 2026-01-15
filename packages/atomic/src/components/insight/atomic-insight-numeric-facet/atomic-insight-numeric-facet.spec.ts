import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';

vi.mock('@coveo/headless/insight', {spy: true});

import {
  buildFacetConditionsManager,
  buildNumericFacet,
  buildNumericFilter,
  buildSearchStatus,
  type FacetConditionsManager,
  loadNumericFacetSetActions,
  type NumericFacet,
  type NumericFilter,
  type SearchStatus,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {page, userEvent} from 'vitest/browser';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/search-status-controller';
import {buildFakeFacetConditionsManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-conditions-manager';
import {buildFakeNumericFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/search/numeric-facet-controller';
import {buildFakeNumericFilter} from '@/vitest-utils/testing-helpers/fixtures/headless/search/numeric-filter-controller';
import type {AtomicInsightNumericFacet} from './atomic-insight-numeric-facet';
import './atomic-insight-numeric-facet';

describe('atomic-insight-numeric-facet', () => {
  let mockedRegisterFacet: Mock;
  let mockedNumericFacet: NumericFacet;
  let mockedNumericFilter: NumericFilter;
  let mockedSearchStatus: SearchStatus;
  let mockedFacetConditionsManager: FacetConditionsManager;

  beforeEach(() => {
    mockedRegisterFacet = vi.fn();
    mockedNumericFacet = buildFakeNumericFacet({});
    mockedNumericFilter = buildFakeNumericFilter({});
    mockedSearchStatus = buildFakeSearchStatus({firstSearchExecuted: true});
    mockedFacetConditionsManager = buildFakeFacetConditionsManager({});

    vi.mocked(loadNumericFacetSetActions).mockReturnValue({
      deselectAllNumericFacetValues: vi.fn().mockReturnValue({type: 'mock'}),
    } as unknown as ReturnType<typeof loadNumericFacetSetActions>);
  });

  const setupElement = async ({
    props = {},
    withInput = false,
  }: {
    props?: Partial<{
      field: string;
      facetId: string;
      label: string;
      numberOfValues: number;
      sortCriteria: 'ascending' | 'descending';
      rangeAlgorithm: 'equiprobable' | 'even';
      displayValuesAs: 'checkbox' | 'link';
      isCollapsed: boolean;
      headingLevel: number;
      filterFacetCount: boolean;
      injectionDepth: number;
      withInput: 'integer' | 'decimal';
      dependsOn: Record<string, string>;
    }>;
    withInput?: boolean;
  } = {}) => {
    vi.mocked(buildNumericFacet).mockReturnValue(mockedNumericFacet);
    vi.mocked(buildNumericFilter).mockReturnValue(mockedNumericFilter);
    vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);
    vi.mocked(buildFacetConditionsManager).mockReturnValue(
      mockedFacetConditionsManager
    );

    const inputType = withInput ? 'integer' : props.withInput;

    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightNumericFacet>({
        template: html`<atomic-insight-numeric-facet
        field=${props.field ?? 'price'}
        label=${props.label ?? 'Price'}
        facet-id=${ifDefined(props.facetId)}
        number-of-values=${ifDefined(props.numberOfValues)}
        sort-criteria=${ifDefined(props.sortCriteria)}
        range-algorithm=${ifDefined(props.rangeAlgorithm)}
        display-values-as=${ifDefined(props.displayValuesAs)}
        ?is-collapsed=${props.isCollapsed}
        heading-level=${ifDefined(props.headingLevel)}
        ?filter-facet-count=${props.filterFacetCount}
        injection-depth=${ifDefined(props.injectionDepth)}
        with-input=${ifDefined(inputType)}
        .dependsOn=${props.dependsOn || {}}
      ></atomic-insight-numeric-facet>`,
        selector: 'atomic-insight-numeric-facet',
        bindings: (bindings) => ({
          ...bindings,
          store: {
            ...bindings.store,
            getUniqueIDFromEngine: vi.fn().mockReturnValue('123'),
            registerFacet: mockedRegisterFacet,
            state: {
              ...bindings.store.state,
              numericFacets: {},
            },
          },
        }),
      });

    const qs = (part: string) =>
      element.shadowRoot?.querySelector(`[part~="${part}"]`)!;
    const qsa = (part: string) =>
      element.shadowRoot?.querySelectorAll(`[part~="${part}"]`)!;

    const locators = {
      get title() {
        return page.getByText(props.label ?? 'Price', {exact: true});
      },
      getFacetValueByPosition(valuePosition: number) {
        return page.getByRole('listitem').nth(valuePosition);
      },
      getFacetValueButtonByPosition(valuePosition: number) {
        return page.getByRole('checkbox').nth(valuePosition);
      },
      get clearButton() {
        return page.getByLabelText(/Clear \d+ filter/);
      },
      get facet() {
        return qs('facet');
      },
      get placeholder() {
        return element.shadowRoot?.querySelector('atomic-facet-placeholder');
      },
      get labelButton() {
        return qs('label-button');
      },
      get labelButtonIcon() {
        return qs('label-button-icon');
      },
      get clearButtonElement() {
        return qs('clear-button');
      },
      get clearButtonIcon() {
        return qs('clear-button-icon');
      },
      get values() {
        return qs('values');
      },
      get valueLabel() {
        return qsa('value-label');
      },
      get valueCount() {
        return qsa('value-count');
      },
      get valueCheckbox() {
        return qsa('value-checkbox');
      },
      get valueCheckboxChecked() {
        return qsa('value-checkbox-checked');
      },
      get valueCheckboxLabel() {
        return qsa('value-checkbox-label');
      },
      get valueCheckboxIcon() {
        return qsa('value-checkbox-icon');
      },
      get valueLink() {
        return qsa('value-link');
      },
      get valueLinkSelected() {
        return qsa('value-link-selected');
      },
      get inputForm() {
        return qs('input-form');
      },
      get inputStart() {
        return qs('input-start');
      },
      get inputEnd() {
        return qs('input-end');
      },
      get inputApplyButton() {
        return qs('input-apply-button');
      },
      get numberInput() {
        return element.shadowRoot?.querySelector('atomic-facet-number-input');
      },
    };

    return {element, locators};
  };

  describe('when initializing', () => {
    it('should render correctly', async () => {
      const {element} = await setupElement();
      expect(element).toBeDefined();
    });

    it('should render with default properties', async () => {
      const {element} = await setupElement();
      expect(element.numberOfValues).toBe(8);
      expect(element.sortCriteria).toBe('ascending');
      expect(element.rangeAlgorithm).toBe('equiprobable');
      expect(element.displayValuesAs).toBe('checkbox');
      expect(element.isCollapsed).toBe(false);
      expect(element.headingLevel).toBe(0);
      expect(element.filterFacetCount).toBe(true);
      expect(element.injectionDepth).toBe(1000);
    });

    it('should call buildNumericFacet with engine and correct options', async () => {
      const {element} = await setupElement({
        props: {
          field: 'testfield',
          numberOfValues: 10,
          sortCriteria: 'descending',
          rangeAlgorithm: 'even',
          injectionDepth: 500,
        },
      });

      expect(buildNumericFacet).toHaveBeenCalledWith(element.bindings.engine, {
        options: expect.objectContaining({
          field: 'testfield',
          numberOfValues: 10,
          sortCriteria: 'descending',
          rangeAlgorithm: 'even',
          injectionDepth: 500,
          generateAutomaticRanges: true,
        }),
      });
    });

    it('should call buildSearchStatus with engine', async () => {
      const {element} = await setupElement();
      expect(buildSearchStatus).toHaveBeenCalledWith(element.bindings.engine);
    });

    it('should call buildTabManager with engine', async () => {
      const {element} = await setupElement();
      expect(buildTabManager).toHaveBeenCalledWith(element.bindings.engine);
    });

    it('should register facet in store', async () => {
      await setupElement();
      expect(mockedRegisterFacet).toHaveBeenCalled();
    });
  });

  describe('when rendering', () => {
    it('should render the title', async () => {
      const {locators} = await setupElement();
      await expect.element(locators.title).toBeVisible();
    });

    it('should render facet values when available', async () => {
      const {locators} = await setupElement();
      expect(locators.valueLabel.length).toBeGreaterThan(0);
    });

    it('should render the first facet value', async () => {
      const {locators} = await setupElement();
      const facetValue = locators.getFacetValueByPosition(0);
      await expect.element(facetValue).toBeVisible();
    });

    it('should render every part', async () => {
      const {locators} = await setupElement();
      await expect.element(locators.facet).toBeInTheDocument();
      await expect.element(locators.labelButton).toBeInTheDocument();
      await expect.element(locators.labelButtonIcon).toBeInTheDocument();
      await expect.element(locators.values).toBeInTheDocument();
      await expect.element(locators.valueLabel[0]).toBeInTheDocument();
      await expect.element(locators.valueCount[0]).toBeInTheDocument();
      await expect.element(locators.valueCheckbox[0]).toBeInTheDocument();
      await expect.element(locators.valueCheckboxLabel[0]).toBeInTheDocument();
      await expect.element(locators.valueCheckboxIcon[0]).toBeInTheDocument();
    });

    it('should render "no-label" when label is not provided', async () => {
      mockedNumericFacet = buildFakeNumericFacet({});

      const {element} =
        await renderInAtomicInsightInterface<AtomicInsightNumericFacet>({
          template: html`<atomic-insight-numeric-facet
            field="price"
          ></atomic-insight-numeric-facet>`,
          selector: 'atomic-insight-numeric-facet',
          bindings: (bindings) => {
            vi.mocked(buildNumericFacet).mockReturnValue(mockedNumericFacet);
            vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);
            vi.mocked(buildFacetConditionsManager).mockReturnValue(
              mockedFacetConditionsManager
            );
            return {
              ...bindings,
              store: {
                ...bindings.store,
                getUniqueIDFromEngine: vi.fn().mockReturnValue('123'),
                registerFacet: mockedRegisterFacet,
                state: {
                  ...bindings.store.state,
                  numericFacets: {},
                },
              },
            };
          },
        });

      expect(element.label).toBe('no-label');
    });

    it('should not render the facet when it has no values', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          values: [],
        },
      });

      const {locators} = await setupElement();
      expect(locators.facet).not.toBeInTheDocument();
    });

    it('should not render the facet when disabled', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          enabled: false,
        },
      });

      const {locators} = await setupElement();
      expect(locators.facet).not.toBeInTheDocument();
    });

    it('should render placeholder before first search is executed', async () => {
      mockedSearchStatus = buildFakeSearchStatus({firstSearchExecuted: false});

      const {element} = await setupElement();
      const placeholder = element.shadowRoot?.querySelector(
        '[part="placeholder"]'
      );
      expect(placeholder).toBeInTheDocument();
    });
  });

  describe('when rendering facet value states', () => {
    it('should render idle values correctly', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          values: [
            {
              start: 0,
              end: 100,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 10,
            },
            {
              start: 100,
              end: 200,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 5,
            },
          ],
        },
      });

      const {locators} = await setupElement();
      expect(locators.valueCheckbox.length).toBe(2);
      expect(locators.valueCheckboxChecked.length).toBe(0);
    });

    it('should render selected values correctly', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          values: [
            {
              start: 0,
              end: 100,
              endInclusive: false,
              state: 'selected',
              numberOfResults: 10,
            },
            {
              start: 100,
              end: 200,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 5,
            },
          ],
        },
      });

      const {locators} = await setupElement();
      expect(locators.valueCheckbox.length).toBe(2);
      expect(locators.valueCheckboxChecked.length).toBe(1);
    });

    it('should render value counts correctly', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          values: [
            {
              start: 0,
              end: 100,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 42,
            },
          ],
        },
      });

      const {locators} = await setupElement();
      await expect.element(locators.valueCount[0]).toHaveTextContent('42');
    });
  });

  describe('when displayValuesAs is link', () => {
    it('should render values as links', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          values: [
            {
              start: 0,
              end: 100,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 10,
            },
          ],
        },
      });

      const {locators} = await setupElement({
        props: {displayValuesAs: 'link'},
      });

      expect(locators.valueLink.length).toBe(1);
      expect(locators.valueCheckbox.length).toBe(0);
    });

    it('should render selected link values correctly', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          values: [
            {
              start: 0,
              end: 100,
              endInclusive: false,
              state: 'selected',
              numberOfResults: 10,
            },
          ],
        },
      });

      const {locators} = await setupElement({
        props: {displayValuesAs: 'link'},
      });

      expect(locators.valueLinkSelected.length).toBe(1);
    });
  });

  describe('when rendering clear button', () => {
    it('should not render clear button when there are no selected values', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          values: [
            {
              start: 0,
              end: 100,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 10,
            },
          ],
        },
      });

      const {locators} = await setupElement();
      expect(locators.clearButtonElement).not.toBeInTheDocument();
    });

    it('should render clear button when there are selected values', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          values: [
            {
              start: 0,
              end: 100,
              endInclusive: false,
              state: 'selected',
              numberOfResults: 10,
            },
          ],
        },
      });

      const {locators} = await setupElement();
      await expect.element(locators.clearButtonElement).toBeInTheDocument();
      await expect.element(locators.clearButtonIcon).toBeInTheDocument();
    });

    it('should call facet.deselectAll when the clear button is clicked', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        implementation: {
          deselectAll: vi.fn(),
        },
        state: {
          values: [
            {
              start: 0,
              end: 100,
              endInclusive: false,
              state: 'selected',
              numberOfResults: 10,
            },
          ],
        },
      });

      const {locators} = await setupElement();
      await userEvent.click(locators.clearButton);

      expect(mockedNumericFacet.deselectAll).toHaveBeenCalled();
    });
  });

  describe('when isCollapsed is true', () => {
    it('should not render values', async () => {
      const {locators} = await setupElement({props: {isCollapsed: true}});

      expect(locators.values).not.toBeInTheDocument();
    });

    it('should toggle collapse when the header is clicked', async () => {
      const {element, locators} = await setupElement({
        props: {isCollapsed: true},
      });

      await userEvent.click(locators.labelButton);

      expect(element.isCollapsed).toBe(false);
    });
  });

  describe('when interacting with facet values', () => {
    it('should call facet.toggleSelect when a checkbox value is clicked', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        implementation: {
          toggleSelect: vi.fn(),
        },
        state: {
          values: [
            {
              start: 0,
              end: 100,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 10,
            },
          ],
        },
      });

      const {locators} = await setupElement();
      const facetValueButton = locators.getFacetValueButtonByPosition(0);
      await userEvent.click(facetValueButton);

      expect(mockedNumericFacet.toggleSelect).toHaveBeenCalledWith({
        start: 0,
        end: 100,
        endInclusive: false,
        state: 'idle',
        numberOfResults: 10,
      });
    });

    it('should call facet.toggleSingleSelect when a link value is clicked', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        implementation: {
          toggleSingleSelect: vi.fn(),
        },
        state: {
          values: [
            {
              start: 0,
              end: 100,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 10,
            },
          ],
        },
      });

      const {locators} = await setupElement({
        props: {displayValuesAs: 'link'},
      });

      await userEvent.click(locators.valueLink[0]);

      expect(mockedNumericFacet.toggleSingleSelect).toHaveBeenCalledWith({
        start: 0,
        end: 100,
        endInclusive: false,
        state: 'idle',
        numberOfResults: 10,
      });
    });
  });

  describe('when withInput is set', () => {
    it('should build numeric filter', async () => {
      const {element} = await setupElement({withInput: true});

      expect(buildNumericFilter).toHaveBeenCalledWith(element.bindings.engine, {
        options: expect.objectContaining({
          field: 'price',
        }),
      });
    });

    it('should render input controls when withInput is set and filter has no range', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          values: [
            {
              start: 0,
              end: 100,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 10,
            },
          ],
        },
      });

      const {locators} = await setupElement({withInput: true});

      expect(locators.numberInput).toBeInTheDocument();
    });

    it('should render the clear button when filter has a range', async () => {
      mockedNumericFilter = buildFakeNumericFilter({
        state: {
          range: {
            start: 50,
            end: 150,
            endInclusive: true,
            state: 'selected',
            numberOfResults: 10,
          },
        },
      });

      const {locators} = await setupElement({withInput: true});

      await expect.element(locators.clearButtonElement).toBeInTheDocument();
    });

    it('should call filter.clear when clear button is clicked with input range', async () => {
      mockedNumericFilter = buildFakeNumericFilter({
        implementation: {
          clear: vi.fn(),
        },
        state: {
          range: {
            start: 50,
            end: 150,
            endInclusive: true,
            state: 'selected',
            numberOfResults: 10,
          },
        },
      });

      const {locators} = await setupElement({withInput: true});
      await userEvent.click(locators.clearButton);

      expect(mockedNumericFilter.clear).toHaveBeenCalled();
    });
  });

  describe('when configuring tabs', () => {
    describe('when both tabsIncluded and tabsExcluded are provided', () => {
      let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

      beforeEach(() => {
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      });

      it('should warn about conflicting tabs configuration', async () => {
        await setupElement({
          props: {
            tabsIncluded: ['tab1'],
            tabsExcluded: ['tab2'],
          },
        });

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('tabs-included')
        );
      });
    });

    it('should pass tabs configuration to buildNumericFacet', async () => {
      const {element} = await setupElement({
        props: {
          tabsIncluded: ['tab1', 'tab2'],
        },
      });

      expect(buildNumericFacet).toHaveBeenCalledWith(element.bindings.engine, {
        options: expect.objectContaining({
          tabs: {
            included: ['tab1', 'tab2'],
            excluded: [],
          },
        }),
      });
    });
  });

  describe('when validating props', () => {
    describe('when displayValuesAs has invalid value', () => {
      let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

      beforeEach(() => {
        consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {});
      });

      it('should set error when displayValuesAs is invalid', async () => {
        const {element} =
          await renderInAtomicInsightInterface<AtomicInsightNumericFacet>({
            template: html`<atomic-insight-numeric-facet
              field="price"
              display-values-as=${'invalid' as 'checkbox'}
            ></atomic-insight-numeric-facet>`,
            selector: 'atomic-insight-numeric-facet',
            bindings: (bindings) => {
              vi.mocked(buildNumericFacet).mockReturnValue(mockedNumericFacet);
              vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);
              vi.mocked(buildFacetConditionsManager).mockReturnValue(
                mockedFacetConditionsManager
              );
              return {
                ...bindings,
                store: {
                  ...bindings.store,
                  getUniqueIDFromEngine: vi.fn().mockReturnValue('123'),
                  registerFacet: mockedRegisterFacet,
                  state: {
                    ...bindings.store.state,
                    numericFacets: {},
                  },
                },
              };
            },
          });

        expect(element.error).toBeDefined();
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });

    describe('when withInput has invalid value', () => {
      let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

      beforeEach(() => {
        consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {});
      });

      it('should set error when withInput is invalid', async () => {
        const {element} =
          await renderInAtomicInsightInterface<AtomicInsightNumericFacet>({
            template: html`<atomic-insight-numeric-facet
              field="price"
              with-input=${'invalid' as 'integer'}
            ></atomic-insight-numeric-facet>`,
            selector: 'atomic-insight-numeric-facet',
            bindings: (bindings) => {
              vi.mocked(buildNumericFacet).mockReturnValue(mockedNumericFacet);
              vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);
              vi.mocked(buildFacetConditionsManager).mockReturnValue(
                mockedFacetConditionsManager
              );
              return {
                ...bindings,
                store: {
                  ...bindings.store,
                  getUniqueIDFromEngine: vi.fn().mockReturnValue('123'),
                  registerFacet: mockedRegisterFacet,
                  state: {
                    ...bindings.store.state,
                    numericFacets: {},
                  },
                },
              };
            },
          });

        expect(element.error).toBeDefined();
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });
  });

  describe('when selecting multiple values', () => {
    it('should render multiple selected checkboxes', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          values: [
            {
              start: 0,
              end: 100,
              endInclusive: false,
              state: 'selected',
              numberOfResults: 10,
            },
            {
              start: 100,
              end: 200,
              endInclusive: false,
              state: 'selected',
              numberOfResults: 5,
            },
            {
              start: 200,
              end: 300,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 3,
            },
          ],
        },
      });

      const {locators} = await setupElement();
      expect(locators.valueCheckboxChecked.length).toBe(2);
    });

    it('should call toggleSelect for each clicked value', async () => {
      const toggleSelectMock = vi.fn();
      mockedNumericFacet = buildFakeNumericFacet({
        implementation: {
          toggleSelect: toggleSelectMock,
        },
        state: {
          values: [
            {
              start: 0,
              end: 100,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 10,
            },
            {
              start: 100,
              end: 200,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 5,
            },
          ],
        },
      });

      const {locators} = await setupElement();
      await userEvent.click(locators.getFacetValueButtonByPosition(0));
      await userEvent.click(locators.getFacetValueButtonByPosition(1));

      expect(toggleSelectMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('when configuring numberOfValues', () => {
    it('should pass numberOfValues to buildNumericFacet', async () => {
      await setupElement({
        props: {
          numberOfValues: 5,
        },
      });

      expect(buildNumericFacet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          options: expect.objectContaining({
            numberOfValues: 5,
          }),
        })
      );
    });

    it('should not render facet values when numberOfValues is 0 and no input range', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          values: [],
        },
      });

      const {locators} = await setupElement({
        props: {
          numberOfValues: 0,
        },
      });

      expect(locators.values).not.toBeInTheDocument();
    });
  });

  describe('when configuring sortCriteria', () => {
    it('should pass ascending sortCriteria to buildNumericFacet', async () => {
      await setupElement({
        props: {
          sortCriteria: 'ascending',
        },
      });

      expect(buildNumericFacet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          options: expect.objectContaining({
            sortCriteria: 'ascending',
          }),
        })
      );
    });

    it('should pass descending sortCriteria to buildNumericFacet', async () => {
      await setupElement({
        props: {
          sortCriteria: 'descending',
        },
      });

      expect(buildNumericFacet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          options: expect.objectContaining({
            sortCriteria: 'descending',
          }),
        })
      );
    });
  });

  describe('when configuring rangeAlgorithm', () => {
    it('should pass even rangeAlgorithm to buildNumericFacet', async () => {
      await setupElement({
        props: {
          rangeAlgorithm: 'even',
        },
      });

      expect(buildNumericFacet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          options: expect.objectContaining({
            rangeAlgorithm: 'even',
          }),
        })
      );
    });

    it('should pass equiprobable rangeAlgorithm to buildNumericFacet', async () => {
      await setupElement({
        props: {
          rangeAlgorithm: 'equiprobable',
        },
      });

      expect(buildNumericFacet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          options: expect.objectContaining({
            rangeAlgorithm: 'equiprobable',
          }),
        })
      );
    });
  });

  describe('when facet has no results', () => {
    it('should not render facet when field returns no values', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          values: [],
        },
      });

      const {locators} = await setupElement();
      expect(locators.facet).not.toBeInTheDocument();
    });

    it('should render facet with input when filter has range even with no facet values', async () => {
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          values: [],
        },
      });
      mockedNumericFilter = buildFakeNumericFilter({
        state: {
          range: {
            start: 50,
            end: 150,
            endInclusive: true,
            state: 'selected',
            numberOfResults: 10,
          },
        },
      });

      const {locators} = await setupElement({withInput: true});
      await expect.element(locators.numberInput).toBeInTheDocument();
    });
  });
});
