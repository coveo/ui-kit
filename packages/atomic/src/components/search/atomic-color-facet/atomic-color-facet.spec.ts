import {
  buildFacet,
  buildFacetConditionsManager,
  buildSearchStatus,
  buildTabManager,
} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import {page} from 'vitest/browser';
import './atomic-color-facet';
import {ifDefined} from 'lit/directives/if-defined.js';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeFacetConditionsManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-conditions-manager';
import {buildFakeFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import type {AtomicColorFacet} from './atomic-color-facet';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-color-facet', () => {
  let mockedRegisterFacet: Mock;
  let mockedConsole: ReturnType<typeof mockConsole>;

  beforeEach(() => {
    mockedConsole = mockConsole();
    mockedRegisterFacet = vi.fn();
    vi.mocked(buildFacet).mockReturnValue(buildFakeFacet({}));
    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({firstSearchExecuted: true})
    );
    vi.mocked(buildTabManager).mockReturnValue(buildFakeTabManager({}));
    vi.mocked(buildFacetConditionsManager).mockReturnValue(
      buildFakeFacetConditionsManager({})
    );
  });

  const setupElement = async (
    props: {
      field?: string;
      tabsIncluded?: string[];
      tabsExcluded?: string[];
      customSort?: string[];
      allowedValues?: string[];
      injectionDepth?: number;
      filterFacetCount?: boolean;
      resultsMustMatch?: 'allValues' | 'atLeastOneValue';
      sortCriteria?: 'score' | 'alphanumeric' | 'occurrences';
      numberOfValues?: number;
      isCollapsed?: boolean;
      displayValuesAs?: 'checkbox' | 'box';
      withSearch?: boolean;
      facetId?: string;
    } = {}
  ) => {
    const {element} = await renderInAtomicSearchInterface<AtomicColorFacet>({
      template: html`<atomic-color-facet
        field=${props.field ?? 'filetype'}
        label="File Type"
        facet-id=${ifDefined(props.facetId)}
        display-values-as=${ifDefined(props.displayValuesAs)}
        sort-criteria=${ifDefined(props.sortCriteria)}
        number-of-values=${ifDefined(props.numberOfValues)}
        results-must-match=${ifDefined(props.resultsMustMatch)}
        injection-depth=${ifDefined(props.injectionDepth)}
        .allowedValues=${props.allowedValues || []}
        .customSort=${props.customSort || []}
        .tabsIncluded=${props.tabsIncluded || []}
        .tabsExcluded=${props.tabsExcluded || []}
        filter-facet-count=${ifDefined(props.filterFacetCount)}
        is-collapsed=${ifDefined(props.isCollapsed)}
        with-search=${ifDefined(props.withSearch)}
      ></atomic-color-facet>`,
      selector: 'atomic-color-facet',
      bindings: (bindings) => ({
        ...bindings,
        store: {
          ...bindings.store,
          getUniqueIDFromEngine: vi.fn().mockReturnValue('123'),
          registerFacet: mockedRegisterFacet,
        },
      }),
    });
    const qs = (part: string) =>
      element.shadowRoot?.querySelector(`[part~="${part}"]`)!;
    const qsa = (part: string, ...additionalSelector: string[]) =>
      element.shadowRoot?.querySelectorAll(
        `[part~="${part}"]${additionalSelector?.join('')}`
      )!;

    const locators = {
      get title() {
        return page.getByText('File Type', {exact: true});
      },
      getFacetValueByPosition(valuePosition: number) {
        return page.getByTestId(`facet-value-${valuePosition}`);
      },
      getFacetValueButtonByPosition(valuePosition: number) {
        return page.getByTestId(`facet-value-button-${valuePosition}`);
      },
      getFacetValueByLabel(value: string | RegExp) {
        return page.getByText(value);
      },
      getFacetValueButtonByLabel(value: string | RegExp) {
        return page.getByRole('button', {name: value});
      },
      get componentError() {
        return page.getByText(/error/i);
      },
      placeholder: element.shadowRoot?.querySelector('[part="placeholder"]'),
      facet: qs('facet'),
      labelButton: qs('label-button'),
      labelButtonIcon: qs('label-button-icon'),
      clearButton: qs('clear-button'),
      clearButtonIcon: qs('clear-button-icon'),
      searchWrapper: qs('search-wrapper'),
      searchInput: qs('search-input'),
      searchIcon: qs('search-icon'),
      searchClearButton: qs('search-clear-button'),
      moreMatches: qs('more-matches'),
      noMatches: qs('no-matches'),
      matchesQuery: qs('matches-query'),
      searchHighlight: qs('search-highlight'),
      values: qsa('values'),
      valueLabel: qsa('value-label'),
      valueCount: qsa('value-count'),
      valueBox: qsa('value-box'),
      valueBoxSelected: qsa('value-box-selected'),
      valueCheckbox: qsa('value-checkbox'),
      valueCheckboxChecked: qsa('value-checkbox-checked'),
      valueCheckboxLabel: qsa('value-checkbox-label'),
      defaultColorValue: qsa('default-color-value'),
      showMore: qs('show-more'),
      showLess: qs('show-less'),
      showMoreLessIcon: qs('show-more-less-icon'),
    };
    return {element, locators};
  };

  describe('#render', () => {
    it('should render the title', async () => {
      const {locators} = await setupElement();
      const title = locators.title;
      await expect.element(title).toBeVisible();
    });

    it('should render the first facet value', async () => {
      const {locators} = await setupElement();
      await expect
        .element(locators.values[0] as HTMLElement)
        .toBeInTheDocument();
    });

    it('should render facet values when available', async () => {
      const {locators} = await setupElement();
      const valueLabel = locators.valueLabel;

      expect(valueLabel!.length).toBe(2);
      await expect
        .element(valueLabel[0] as HTMLElement)
        .toHaveTextContent('value-1');
      await expect
        .element(valueLabel[1] as HTMLElement)
        .toHaveTextContent('value-2');
    });

    it('should render all parts for box display', async () => {
      const {locators} = await setupElement({displayValuesAs: 'box'});
      await expect
        .element(locators.labelButton as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.labelButtonIcon as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.searchWrapper as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.searchInput as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.searchIcon as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.values[0] as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.valueLabel[0] as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.valueCount[0] as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.showMore as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.showLess as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.showMoreLessIcon as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.valueBox[0] as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.defaultColorValue[0] as HTMLElement)
        .toBeInTheDocument();
      await expect.element(locators.facet as HTMLElement).toBeInTheDocument();
    });

    it('should render all parts for checkbox display', async () => {
      const {locators} = await setupElement({displayValuesAs: 'checkbox'});
      await expect
        .element(locators.labelButton as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.labelButtonIcon as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.searchWrapper as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.searchInput as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.searchIcon as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.values[0] as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.valueLabel[0] as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.valueCount[0] as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.showMore as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.showLess as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.showMoreLessIcon as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.valueCheckbox[0] as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(locators.valueCheckboxLabel[0] as HTMLElement)
        .toBeInTheDocument();
      await expect.element(locators.facet as HTMLElement).toBeInTheDocument();
    });

    it('should not render search parts when search is disabled', async () => {
      const {locators} = await setupElement({withSearch: false});
      expect(locators.searchWrapper).toBeNull();
    });

    it('should render placeholder before first search is executed', async () => {
      vi.mocked(buildSearchStatus).mockReturnValue(
        buildFakeSearchStatus({firstSearchExecuted: false})
      );

      const {locators} = await setupElement();
      expect(locators.placeholder).toBeInTheDocument();
      expect(locators.facet).toBeNull();
    });

    it('should not render facet when no values are available', async () => {
      vi.mocked(buildFacet).mockReturnValue(
        buildFakeFacet({
          state: {
            values: [],
            enabled: true,
          },
        })
      );

      const {locators} = await setupElement();
      expect(locators.facet).toBeNull();
    });

    it('should not render facet when disabled', async () => {
      vi.mocked(buildFacet).mockReturnValue(
        buildFakeFacet({
          state: {
            values: [
              {value: 'value-1', state: 'idle', numberOfResults: 10},
              {value: 'value-2', state: 'idle', numberOfResults: 5},
            ],
            enabled: false,
          },
        })
      );

      const {locators} = await setupElement();
      expect(locators.facet).toBeNull();
    });

    it('should not render facet when there is an error', async () => {
      vi.mocked(buildSearchStatus).mockReturnValue(
        buildFakeSearchStatus({hasError: true})
      );

      const {locators} = await setupElement();
      expect(locators.facet).toBeNull();
    });
  });

  describe('#initialize', () => {
    it('should build facet controller with engine', async () => {
      const {element} = await setupElement();
      expect(buildFacet).toHaveBeenCalledWith(
        element.bindings.engine,
        expect.objectContaining({options: expect.any(Object)})
      );
      expect(element.facet).toBeDefined();
    });

    it('should build search status controller', async () => {
      const {element} = await setupElement();
      expect(buildSearchStatus).toHaveBeenCalledWith(element.bindings.engine);
      expect(element.searchStatus).toBeDefined();
    });

    it('should build tab manager controller', async () => {
      const {element} = await setupElement();
      expect(buildTabManager).toHaveBeenCalledWith(element.bindings.engine);
      expect(element.tabManager).toBeDefined();
    });

    it('should register facet in store', async () => {
      await setupElement();
      expect(mockedRegisterFacet).toHaveBeenCalledWith(
        'facets',
        expect.objectContaining({
          facetId: expect.any(String),
          element: expect.any(Object),
        })
      );
    });

    it('should bind state to controllers', async () => {
      const {element} = await setupElement();
      expect(element.facetState).toBeDefined();
      expect(element.searchStatusState).toBeDefined();
      expect(element.tabManagerState).toBeDefined();
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

  describe('#disconnectedCallback', () => {
    it('should stop watching facet conditions manager', async () => {
      const mockStopWatching = vi.fn();
      vi.mocked(buildFacetConditionsManager).mockReturnValue(
        buildFakeFacetConditionsManager({
          stopWatching: mockStopWatching,
        })
      );

      const {element} = await setupElement();
      element.remove();
      expect(mockStopWatching).toHaveBeenCalled();
    });
  });

  it('should pass field to facet controller', async () => {
    await setupElement({field: 'author'});
    expect(buildFacet).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        options: expect.objectContaining({field: 'author'}),
      })
    );
  });

  it('should pass numberOfValues to facet controller', async () => {
    await setupElement({numberOfValues: 10});
    expect(buildFacet).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        options: expect.objectContaining({numberOfValues: 10}),
      })
    );
  });

  it('should pass sortCriteria to facet controller', async () => {
    await setupElement({sortCriteria: 'alphanumeric'});
    expect(buildFacet).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        options: expect.objectContaining({sortCriteria: 'alphanumeric'}),
      })
    );
  });

  it('should pass resultsMustMatch to facet controller', async () => {
    await setupElement({resultsMustMatch: 'allValues'});
    expect(buildFacet).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        options: expect.objectContaining({resultsMustMatch: 'allValues'}),
      })
    );
  });

  it('should render box display when displayValuesAs is box', async () => {
    const {locators} = await setupElement({displayValuesAs: 'box'});
    await expect
      .element(locators.valueBox[0] as HTMLElement)
      .toBeInTheDocument();
  });

  it('should render checkbox display when displayValuesAs is checkbox', async () => {
    const {locators} = await setupElement({displayValuesAs: 'checkbox'});
    await expect
      .element(locators.valueCheckbox[0] as HTMLElement)
      .toBeInTheDocument();
  });

  it('should not render values when isCollapsed is true', async () => {
    const {locators} = await setupElement({isCollapsed: true});
    expect(locators.values[0]).toBeUndefined();
  });

  it('should render values when isCollapsed is false', async () => {
    const {locators} = await setupElement({isCollapsed: false});
    await expect.element(locators.values[0] as HTMLElement).toBeInTheDocument();
  });

  it('should render search input when withSearch is true', async () => {
    const {locators} = await setupElement({withSearch: true});
    await expect
      .element(locators.searchInput as HTMLElement)
      .toBeInTheDocument();
  });

  it('should not render search input when withSearch is false', async () => {
    const {locators} = await setupElement({withSearch: false});
    expect(locators.searchWrapper).toBeNull();
  });

  it('should pass filterFacetCount to facet controller', async () => {
    await setupElement({filterFacetCount: false});
    expect(buildFacet).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        options: expect.objectContaining({filterFacetCount: false}),
      })
    );
  });

  it('should pass injectionDepth to facet controller', async () => {
    await setupElement({injectionDepth: 2000});
    expect(buildFacet).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        options: expect.objectContaining({injectionDepth: 2000}),
      })
    );
  });

  it('should pass allowedValues to facet controller when not empty', async () => {
    await setupElement({allowedValues: ['pdf', 'doc']});
    expect(buildFacet).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        options: expect.objectContaining({
          allowedValues: ['pdf', 'doc'],
        }),
      })
    );
  });

  it('should not pass allowedValues when empty', async () => {
    await setupElement({allowedValues: []});
    expect(buildFacet).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        options: expect.objectContaining({
          allowedValues: undefined,
        }),
      })
    );
  });

  it('should pass customSort to facet controller when not empty', async () => {
    await setupElement({customSort: ['pdf', 'doc']});
    expect(buildFacet).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        options: expect.objectContaining({
          customSort: ['pdf', 'doc'],
        }),
      })
    );
  });

  it('should not pass customSort when empty', async () => {
    await setupElement({customSort: []});
    expect(buildFacet).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        options: expect.objectContaining({
          customSort: undefined,
        }),
      })
    );
  });

  it('should pass tabsIncluded to facet controller', async () => {
    await setupElement({tabsIncluded: ['tab1', 'tab2']});
    expect(buildFacet).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        options: expect.objectContaining({
          tabs: expect.objectContaining({included: ['tab1', 'tab2']}),
        }),
      })
    );
  });

  it('should pass tabsExcluded to facet controller', async () => {
    await setupElement({tabsExcluded: ['tab3', 'tab4']});
    expect(buildFacet).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        options: expect.objectContaining({
          tabs: expect.objectContaining({excluded: ['tab3', 'tab4']}),
        }),
      })
    );
  });

  it('should toggle facet value selection when clicked', async () => {
    const mockToggleSelect = vi.fn();
    vi.mocked(buildFacet).mockReturnValue(
      buildFakeFacet({
        implementation: {toggleSelect: mockToggleSelect},
      })
    );

    const {locators} = await setupElement({displayValuesAs: 'box'});
    const firstValue = locators.valueBox[0] as HTMLElement;
    firstValue.click();

    expect(mockToggleSelect).toHaveBeenCalled();
  });

  it('should clear all selections when clear button is clicked', async () => {
    const mockDeselectAll = vi.fn();
    vi.mocked(buildFacet).mockReturnValue(
      buildFakeFacet({
        state: {
          values: [
            {
              value: 'value-1',
              state: 'selected',
              numberOfResults: 10,
            },
          ],
        },
        implementation: {deselectAll: mockDeselectAll},
      })
    );

    const {locators} = await setupElement();
    const clearButton = locators.clearButton as HTMLElement;
    clearButton.click();

    expect(mockDeselectAll).toHaveBeenCalled();
  });

  it('should toggle collapse when label button is clicked', async () => {
    const {element, locators} = await setupElement({isCollapsed: false});
    const labelButton = locators.labelButton as HTMLElement;

    labelButton.click();
    await element.updateComplete;

    expect(element.isCollapsed).toBe(true);
  });

  it('should show more values when show more is clicked', async () => {
    const mockShowMoreValues = vi.fn();
    vi.mocked(buildFacet).mockReturnValue(
      buildFakeFacet({
        state: {canShowMoreValues: true},
        implementation: {showMoreValues: mockShowMoreValues},
      })
    );

    const {locators} = await setupElement();
    const showMore = locators.showMore as HTMLElement;
    showMore.click();

    expect(mockShowMoreValues).toHaveBeenCalled();
  });

  it('should show less values when show less is clicked', async () => {
    const mockShowLessValues = vi.fn();
    vi.mocked(buildFacet).mockReturnValue(
      buildFakeFacet({
        state: {canShowMoreValues: true},
        implementation: {showLessValues: mockShowLessValues},
      })
    );

    const {locators} = await setupElement();
    const showLess = locators.showLess as HTMLElement;
    showLess.click();

    expect(mockShowLessValues).toHaveBeenCalled();
  });

  it('should display search results when query is entered', async () => {
    const mockSearch = vi.fn();
    const mockUpdateText = vi.fn();
    const mockUpdateCaptions = vi.fn();
    vi.mocked(buildFacet).mockReturnValue(
      buildFakeFacet({
        state: {
          facetSearch: {
            query: 'pdf',
            values: [{rawValue: 'pdf', count: 5, displayValue: 'PDF'}],
            isLoading: false,
            moreValuesAvailable: false,
          },
        },
        implementation: {
          facetSearch: {
            search: mockSearch,
            updateText: mockUpdateText,
            updateCaptions: mockUpdateCaptions,
            clear: vi.fn(),
            exclude: vi.fn(),
            singleExclude: vi.fn(),
            select: vi.fn(),
            singleSelect: vi.fn(),
            showMoreResults: vi.fn(),
          },
        },
      })
    );

    await setupElement();
    expect(mockUpdateText).not.toHaveBeenCalled();
  });

  it('should clear search when clear button is clicked', async () => {
    const mockClear = vi.fn();
    vi.mocked(buildFacet).mockReturnValue(
      buildFakeFacet({
        state: {
          facetSearch: {
            query: 'test',
            values: [{rawValue: 'test', count: 5, displayValue: 'Test'}],
            isLoading: false,
            moreValuesAvailable: false,
          },
        },
        implementation: {
          facetSearch: {
            clear: mockClear,
            search: vi.fn(),
            updateText: vi.fn(),
            updateCaptions: vi.fn(),
            exclude: vi.fn(),
            singleExclude: vi.fn(),
            select: vi.fn(),
            singleSelect: vi.fn(),
            showMoreResults: vi.fn(),
          },
        },
      })
    );

    const {locators} = await setupElement();
    const clearButton = locators.searchClearButton as HTMLElement;
    if (clearButton) {
      clearButton.click();
      expect(mockClear).toHaveBeenCalled();
    }
  });

  // These tests ensure ValidatePropsController is properly wired up for all validated props.

  // TODO V4: KIT-5197 - Remove skip
  it.skip.each<{
    prop:
      | 'field'
      | 'numberOfValues'
      | 'headingLevel'
      | 'injectionDepth'
      | 'sortCriteria'
      | 'resultsMustMatch'
      | 'displayValuesAs'
      | 'allowedValues'
      | 'customSort'
      | 'tabsExcluded'
      | 'tabsIncluded';
    invalidValue: string | number | string[];
  }>([
    {
      prop: 'field',
      invalidValue: '',
    },
    {
      prop: 'numberOfValues',
      invalidValue: 0,
    },
    {
      prop: 'headingLevel',
      invalidValue: 7,
    },
    {
      prop: 'injectionDepth',
      invalidValue: -1,
    },
    {
      prop: 'sortCriteria',
      invalidValue: 'invalid',
    },
    {
      prop: 'resultsMustMatch',
      invalidValue: 'invalid',
    },
    {
      prop: 'displayValuesAs',
      invalidValue: 'invalid',
    },
    {
      prop: 'allowedValues',
      invalidValue: new Array(26).fill('value'),
    },
    {
      prop: 'customSort',
      invalidValue: new Array(26).fill('value'),
    },
    {
      prop: 'tabsExcluded',
      invalidValue: [''],
    },
    {
      prop: 'tabsIncluded',
      invalidValue: [''],
    },
  ])(
    'should set error when #$prop is invalid',
    async ({prop, invalidValue}) => {
      const {element} = await setupElement();

      expect(element.error).toBeUndefined();

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (element as any)[prop] = invalidValue;
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(new RegExp(prop, 'i'));
    }
  );

  // TODO V4: KIT-5197 - Remove this test
  it.each<{
    prop:
      | 'field'
      | 'numberOfValues'
      | 'headingLevel'
      | 'injectionDepth'
      | 'sortCriteria'
      | 'resultsMustMatch'
      | 'displayValuesAs'
      | 'allowedValues'
      | 'customSort'
      | 'tabsExcluded'
      | 'tabsIncluded';
    validValue: string | number | string[];
    invalidValue: string | number | string[];
  }>([
    {
      prop: 'field',
      validValue: 'author',
      invalidValue: '',
    },
    {
      prop: 'numberOfValues',
      validValue: 10,
      invalidValue: 0,
    },
    {
      prop: 'headingLevel',
      validValue: 2,
      invalidValue: 7,
    },
    {
      prop: 'injectionDepth',
      validValue: 1000,
      invalidValue: -1,
    },
    {
      prop: 'sortCriteria',
      validValue: 'alphanumeric',
      invalidValue: 'invalid',
    },
    {
      prop: 'resultsMustMatch',
      validValue: 'atLeastOneValue',
      invalidValue: 'invalid',
    },
    {
      prop: 'displayValuesAs',
      validValue: 'checkbox',
      invalidValue: 'invalid',
    },
    {
      prop: 'allowedValues',
      validValue: ['pdf', 'doc'],
      invalidValue: new Array(26).fill('value'),
    },
    {
      prop: 'customSort',
      validValue: ['pdf', 'doc'],
      invalidValue: new Array(26).fill('value'),
    },
    {
      prop: 'tabsExcluded',
      validValue: ['tab1', 'tab2'],
      invalidValue: [''],
    },
    {
      prop: 'tabsIncluded',
      validValue: ['tab1', 'tab2'],
      invalidValue: [''],
    },
  ])(
    'should log validation warning when #$prop is updated to invalid value',
    async ({prop, validValue, invalidValue}) => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const {element} = await setupElement({[prop]: validValue});

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (element as any)[prop] = invalidValue;
      await element.updateComplete;

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Prop validation failed for component atomic-color-facet'
        ),
        element
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(prop),
        element
      );

      consoleWarnSpy.mockRestore();
    }
  );
});
