import {
  buildFacet,
  buildFacetConditionsManager,
  buildSearchStatus,
  buildTabManager,
} from '@coveo/headless';
import {page, userEvent} from '@vitest/browser/context';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import './atomic-facet';
import {ifDefined} from 'lit/directives/if-defined.js';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeFacetConditionsManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-conditions-manager';
import {buildFakeFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import type {AtomicFacet} from './atomic-facet';

vi.mock('@coveo/headless', {spy: true});

describe('AtomicFacet', () => {
  let mockedRegisterFacet: Mock;

  beforeEach(() => {
    mockedRegisterFacet = vi.fn();
    vi.mocked(buildFacet).mockReturnValue(buildFakeFacet({}));
    vi.mocked(buildSearchStatus).mockReturnValue(buildFakeSearchStatus({}));
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
      displayValuesAs?: 'checkbox' | 'link' | 'box';
      withSearch?: boolean;
      enableExclusion?: boolean;
      facetId?: string;
    } = {}
  ) => {
    const {element} = await renderInAtomicSearchInterface<AtomicFacet>({
      template: html`<atomic-facet
        field=${props.field ?? 'defaultField'}
        label="Test Field"
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
        enable-exclusion=${ifDefined(props.enableExclusion)}
      ></atomic-facet>`,
      selector: 'atomic-facet',
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
        return page.getByText('Test Field', {exact: true});
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
      placeholder: element.shadowRoot?.querySelector(
        'atomic-facet-placeholder'
      ),
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
      valueCheckbox: qsa('value-checkbox'),
      valueCheckboxChecked: qsa('value-checkbox-checked'),
      valueCheckboxExcluded: qsa(
        'value-checkbox-checked',
        '[aria-pressed=mixed]'
      ),
      valueCheckboxLabel: qsa('value-checkbox-label'),
      valueCheckboxIcon: qsa('value-checkbox-icon'),
      valueLink: qsa('value-link'),
      valueLinkSelected: qsa('value-link-selected'),
      valueBox: qsa('value-box'),
      valueBoxSelected: qsa('value-box-selected'),
      valueExcludeButton: qsa('value-exclude-button'),
      showMore: qs('show-more'),
      showLess: qs('show-less'),
      showMoreLessIcon: qs('show-more-less-icon'),
    };
    return {element, locators};
  };

  describe('render', () => {
    it('should render the title', async () => {
      const {locators} = await setupElement();
      const title = locators.title;
      await expect.element(title).toBeVisible();
    });

    it('should render the first facet value', async () => {
      const {locators} = await setupElement();
      await expect.element(locators.values[0]).toBeInTheDocument();
    });

    it('should render facet values when available', async () => {
      const {locators} = await setupElement();
      const valueLabel = locators.valueLabel;

      expect(valueLabel!.length).toBe(2);
      await expect.element(valueLabel[0]).toHaveTextContent('value-1');
      await expect.element(valueLabel[1]).toHaveTextContent('value-2');
    });

    it('should render every parts', async () => {
      const {locators} = await setupElement();
      await expect.element(locators.labelButton).toBeInTheDocument();
      await expect.element(locators.labelButtonIcon).toBeInTheDocument();
      await expect.element(locators.searchWrapper).toBeInTheDocument();
      await expect.element(locators.searchInput).toBeInTheDocument();
      await expect.element(locators.searchIcon).toBeInTheDocument();
      await expect.element(locators.values[0]).toBeInTheDocument();
      await expect.element(locators.valueLabel[0]).toBeInTheDocument();
      await expect.element(locators.valueCount[0]).toBeInTheDocument();
      await expect.element(locators.showMore).toBeInTheDocument();
      await expect.element(locators.showLess).toBeInTheDocument();
      await expect.element(locators.showMoreLessIcon).toBeInTheDocument();
      await expect.element(locators.valueCheckbox[0]).toBeInTheDocument();
      await expect.element(locators.valueCheckboxLabel[0]).toBeInTheDocument();
      await expect.element(locators.valueCheckboxIcon[0]).toBeInTheDocument();
      await expect.element(locators.facet).toBeInTheDocument();
    });

    it('should not render search parts when search is disabled', async () => {
      const {locators} = await setupElement({withSearch: false});
      await expect.element(locators.searchWrapper).not.toBeInTheDocument();
      await expect.element(locators.searchInput).not.toBeInTheDocument();
    });

    it('should render value exclude button when exclusion is enabled', async () => {
      const {locators} = await setupElement({
        enableExclusion: true,
      });
      await expect.element(locators.valueExcludeButton[0]).toBeInTheDocument();
    });

    describe('facet value states', () => {
      it('should render 2 idle values', async () => {
        const {locators} = await setupElement();
        expect(locators.valueCheckbox.length).toBe(2);
        expect(locators.valueCheckboxChecked.length).toBe(0);
      });

      it('should render selected values correctly', async () => {
        vi.mocked(buildFacet).mockReturnValue(
          buildFakeFacet({
            state: {
              values: [
                {
                  value: 'Value 1',
                  state: 'selected',
                  numberOfResults: 10,
                },
                {
                  value: 'Value 2',
                  state: 'idle',
                  numberOfResults: 5,
                },
              ],
            },
          })
        );

        const {locators} = await setupElement();
        expect(locators.valueCheckbox.length).toBe(2);
        expect(locators.valueCheckboxChecked.length).toBe(1);
      });

      it('should render value excluded values correctly', async () => {
        vi.mocked(buildFacet).mockReturnValue(
          buildFakeFacet({
            state: {
              values: [
                {
                  value: 'Value 1',
                  state: 'excluded',
                  numberOfResults: 10,
                },
              ],
            },
          })
        );
        const {locators} = await setupElement({
          enableExclusion: true,
        });
        await expect(locators.valueCheckboxExcluded.length).toBe(1);
      });
    });

    describe('show more / show less state', () => {
      it('should not render the show more button when canShowMoreValues is false', async () => {
        vi.mocked(buildFacet).mockReturnValue(
          buildFakeFacet({
            state: {
              canShowMoreValues: false,
            },
          })
        );
        const {locators} = await setupElement({});
        await expect.element(locators.showMore).not.toBeInTheDocument();
      });

      it('should not render the show less button when canShowLessValues is false', async () => {
        vi.mocked(buildFacet).mockReturnValue(
          buildFakeFacet({
            state: {
              canShowLessValues: false,
            },
          })
        );
        const {locators} = await setupElement();
        await expect.element(locators.showLess).not.toBeInTheDocument();
      });
    });

    describe('clear button', () => {
      it('should not render the clear button when there are no selected values', async () => {
        const {locators} = await setupElement();
        await expect.element(locators.clearButton).not.toBeInTheDocument();
        await expect.element(locators.clearButtonIcon).not.toBeInTheDocument();
      });

      it('should render the clear button when there are selected values', async () => {
        vi.mocked(buildFacet).mockReturnValue(
          buildFakeFacet({
            state: {
              values: [
                {
                  value: 'Value 1',
                  state: 'selected',
                  numberOfResults: 10,
                },
              ],
            },
          })
        );

        const {locators} = await setupElement();

        await expect.element(locators.clearButton).toBeVisible();
        await expect
          .element(locators.clearButton)
          .toHaveTextContent('Clear filter');
        await expect.element(locators.clearButtonIcon).toBeVisible();
      });
    });

    describe('facet search', () => {
      it('should render facet search parts when there are search results', async () => {
        vi.mocked(buildFacet).mockReturnValue(
          buildFakeFacet({
            state: {
              facetSearch: {
                isLoading: false,
                query: 'test query',
                moreValuesAvailable: true,
                values: [
                  {
                    count: 10,
                    displayValue: 'returned test query',
                    rawValue: 'returned test query',
                  },
                ],
              },
            },
          })
        );

        const {locators} = await setupElement();

        await expect.element(locators.searchClearButton).toBeVisible();
        await expect
          .element(locators.matchesQuery)
          .toHaveTextContent('test query');
        await expect
          .element(locators.moreMatches)
          .toHaveTextContent('More matches for test query');
        await expect
          .element(locators.searchHighlight)
          .toHaveTextContent('test query');
      });

      it('should render more matches caption when there are more values available', async () => {
        vi.mocked(buildFacet).mockReturnValue(
          buildFakeFacet({
            state: {
              facetSearch: {
                isLoading: false,
                query: 'test query',
                moreValuesAvailable: true,
                values: [
                  {
                    count: 10,
                    displayValue: 'returned test query',
                    rawValue: 'returned test query',
                  },
                ],
              },
            },
          })
        );

        await setupElement();
        await expect
          .element(page.getByText('More matches for test query'))
          .toBeVisible();
      });

      it('should render proper part when there are no search results', async () => {
        vi.mocked(buildFacet).mockReturnValue(
          buildFakeFacet({
            state: {
              facetSearch: {
                isLoading: false,
                query: 'test query',
                moreValuesAvailable: false,
                values: [],
              },
            },
          })
        );

        const {locators} = await setupElement();
        await expect.element(locators.noMatches).toBeVisible();
        await expect
          .element(locators.noMatches)
          .toHaveTextContent('No matches found for test query');
      });
    });

    describe('collapsed state', () => {
      it('does not render the body when isCollapsed is true', async () => {
        const {locators} = await setupElement({isCollapsed: true});

        expect(locators.values.length).toBe(0);
        await expect.element(locators.searchInput).not.toBeInTheDocument();
        await expect.element(locators.showMore).not.toBeInTheDocument();
      });
    });

    describe('display modes', () => {
      it('should render link values when displayValuesAs is link', async () => {
        const {locators} = await setupElement({displayValuesAs: 'link'});
        await expect.element(locators.valueLink[0]).toBeInTheDocument();
      });

      it('should render box values when displayValuesAs is box', async () => {
        const {locators} = await setupElement({displayValuesAs: 'box'});
        await expect.element(locators.valueBox[0]).toBeInTheDocument();
      });

      it('should render selected link values correctly', async () => {
        vi.mocked(buildFacet).mockReturnValue(
          buildFakeFacet({
            state: {
              values: [
                {
                  value: 'Value 1',
                  state: 'selected',
                  numberOfResults: 10,
                },
              ],
            },
          })
        );

        const {locators} = await setupElement({displayValuesAs: 'link'});
        await expect.element(locators.valueLinkSelected[0]).toBeInTheDocument();
      });

      it('should render selected box values correctly', async () => {
        vi.mocked(buildFacet).mockReturnValue(
          buildFakeFacet({
            state: {
              values: [
                {
                  value: 'Value 1',
                  state: 'selected',
                  numberOfResults: 10,
                },
              ],
            },
          })
        );

        const {locators} = await setupElement({displayValuesAs: 'box'});
        await expect.element(locators.valueBoxSelected[0]).toBeInTheDocument();
      });
    });
  });

  describe('user interactions', () => {
    it('should call facet.deselectAll when the clear button is clicked', async () => {
      const deselectAll = vi.fn();
      vi.mocked(buildFacet).mockReturnValue(
        buildFakeFacet({
          implementation: {
            deselectAll,
          },
          state: {
            values: [
              {
                value: 'Value 1',
                state: 'selected',
                numberOfResults: 10,
              },
            ],
          },
        })
      );

      const {locators} = await setupElement();

      await userEvent.click(locators.clearButton);
      expect(deselectAll).toHaveBeenCalledOnce();
    });

    it('should call facet.showMoreValues when the show more button is clicked', async () => {
      const showMoreValues = vi.fn();
      vi.mocked(buildFacet).mockReturnValue(
        buildFakeFacet({
          implementation: {
            showMoreValues,
          },
          state: {canShowMoreValues: true},
        })
      );
      const {locators} = await setupElement();
      await userEvent.click(locators.showMore);

      expect(showMoreValues).toHaveBeenCalled();
    });

    it('should call facet.showLessValues when the show less button is clicked', async () => {
      const showLessValues = vi.fn();
      vi.mocked(buildFacet).mockReturnValue(
        buildFakeFacet({
          implementation: {
            showLessValues,
          },
          state: {
            canShowLessValues: true,
          },
        })
      );
      const {locators} = await setupElement();
      await userEvent.click(locators.showLess);

      expect(showLessValues).toHaveBeenCalled();
    });

    it('should call facet.toggleSelect when a value is clicked', async () => {
      const toggleSelect = vi.fn();
      vi.mocked(buildFacet).mockReturnValue(
        buildFakeFacet({
          implementation: {
            toggleSelect,
          },
        })
      );
      const {locators} = await setupElement();

      await userEvent.click(locators.valueLabel[0]);
      expect(toggleSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 'value-1',
        })
      );
    });

    it('should call facet.toggleExclude when exclude button is clicked', async () => {
      const toggleExclude = vi.fn();
      vi.mocked(buildFacet).mockReturnValue(
        buildFakeFacet({
          implementation: {
            toggleExclude,
          },
        })
      );

      const {locators} = await setupElement({
        enableExclusion: true,
      });

      await userEvent.click(locators.valueExcludeButton[0]);
      expect(toggleExclude).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 'value-1',
        })
      );
    });

    it('should call facetSearch.showMoreResults when more matches button is clicked', async () => {
      const showMoreResults = vi.fn();
      vi.mocked(buildFacet).mockReturnValue(
        buildFakeFacet({
          implementation: {
            // @ts-expect-error: ignoring other methods
            facetSearch: {
              showMoreResults,
              updateCaptions: vi.fn(),
            },
          },
          state: {
            facetSearch: {
              moreValuesAvailable: true,
              isLoading: false,
              query: 'ele',
              values: [
                {
                  displayValue: 'sd',
                  rawValue: 'sd',
                  count: 1,
                },
              ],
            },
          },
        })
      );

      const {locators} = await setupElement();
      await userEvent.click(locators.moreMatches);

      expect(showMoreResults).toHaveBeenCalled();
    });

    it('should call facet.facetSearch.clear when search clear button is clicked', async () => {
      const clear = vi.fn();
      vi.mocked(buildFacet).mockReturnValue(
        buildFakeFacet({
          implementation: {
            // @ts-expect-error: ignoring other methods
            facetSearch: {
              clear,
            },
          },
          state: {
            facetSearch: {
              isLoading: false,
              query: 'test query',
              moreValuesAvailable: false,
              values: [],
            },
          },
        })
      );

      const {locators} = await setupElement();
      await userEvent.click(locators.searchClearButton);

      expect(clear).toHaveBeenCalled();
    });

    it('should call facet.facetSearch.updateText and search when a search query is entered', async () => {
      const search = vi.fn();
      const updateText = vi.fn();
      vi.mocked(buildFacet).mockReturnValue(
        buildFakeFacet({
          implementation: {
            // @ts-expect-error: ignoring other methods
            facetSearch: {
              updateText,
              search,
              updateCaptions: vi.fn(),
            },
          },
        })
      );

      const {locators} = await setupElement();
      await userEvent.type(locators.searchInput, 'test query');

      expect(updateText).toHaveBeenCalledWith('test query');
      expect(search).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should display an error message when facet encounters an error', async () => {
      const {element, locators} = await setupElement();
      element.error = new Error('An error occurred');
      element.requestUpdate();
      await expect.element(locators.componentError).toBeVisible();
    });
  });

  describe('placeholder state', () => {
    it('should render placeholder when first search has not been executed', async () => {
      vi.mocked(buildSearchStatus).mockReturnValue(
        buildFakeSearchStatus({
          hasResults: true,
          firstSearchExecuted: false,
          hasError: false,
          isLoading: false,
        })
      );
      const {locators} = await setupElement();
      await expect(locators.placeholder).toBeInTheDocument();
    });

    it('should not render placeholder when first search has been executed', async () => {
      vi.mocked(buildSearchStatus).mockReturnValue(
        buildFakeSearchStatus({
          hasResults: true,
          firstSearchExecuted: true,
          hasError: false,
          isLoading: false,
        })
      );
      const {locators} = await setupElement();
      await expect(locators.placeholder).not.toBeInTheDocument();
    });
  });

  describe('#initialize', () => {
    const mockedEngine = expect.objectContaining({
      subscribe: expect.any(Function),
    });

    it('should call #buildSearchStatus with engine', async () => {
      await setupElement();
      expect(buildSearchStatus).toHaveBeenCalledWith(mockedEngine);
    });

    it('should call #buildTabManager with engine', async () => {
      await setupElement();
      expect(buildTabManager).toHaveBeenCalledWith(mockedEngine);
    });

    it('should call #buildFacetConditionsManager with engine and options', async () => {
      await setupElement();
      expect(buildFacetConditionsManager).toHaveBeenCalledWith(mockedEngine, {
        conditions: [],
        facetId: 'some-facet-id',
      });
    });

    it('should pass facetId to buildFacet options', async () => {
      await setupElement({facetId: 'customId'});

      expect(buildFacet).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            facetId: 'customId',
          }),
        })
      );
    });

    it('should pass numberOfValues to buildFacet options', async () => {
      await setupElement({numberOfValues: 12});

      expect(buildFacet).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            numberOfValues: 12,
            facetSearch: {
              numberOfValues: 12,
            },
          }),
        })
      );
    });

    it('should pass sortCriteria to buildFacet options', async () => {
      await setupElement({sortCriteria: 'alphanumeric'});

      expect(buildFacet).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            sortCriteria: 'alphanumeric',
          }),
        })
      );
    });

    it('should pass resultsMustMatch to buildFacet options', async () => {
      await setupElement({resultsMustMatch: 'allValues'});

      expect(buildFacet).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            resultsMustMatch: 'allValues',
          }),
        })
      );
    });

    it('should pass filterFacetCount to buildFacet options', async () => {
      await setupElement({filterFacetCount: false});

      expect(buildFacet).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            filterFacetCount: false,
          }),
        })
      );
    });

    it('should pass injectionDepth to buildFacet options', async () => {
      await setupElement({injectionDepth: 500});

      expect(buildFacet).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            injectionDepth: 500,
          }),
        })
      );
    });

    it('should pass allowedValues to buildFacet options', async () => {
      await setupElement({
        injectionDepth: 500,
        allowedValues: ['value1', 'value2'],
      });

      expect(buildFacet).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            allowedValues: ['value1', 'value2'],
          }),
        })
      );
    });

    it('should pass customSort to buildFacet options', async () => {
      await setupElement({customSort: ['sortValue1', 'sortValue2']});

      expect(buildFacet).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            customSort: ['sortValue1', 'sortValue2'],
          }),
        })
      );
    });

    it('should pass tabsIncluded to buildFacet options', async () => {
      await setupElement({tabsIncluded: ['tab1', 'tab2']});

      expect(buildFacet).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            tabs: expect.objectContaining({
              included: ['tab1', 'tab2'],
            }),
          }),
        })
      );
    });

    it('should pass tabsExcluded to buildFacet options', async () => {
      await setupElement({tabsExcluded: ['excludedTab1', 'excludedTab2']});

      expect(buildFacet).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            tabs: expect.objectContaining({
              excluded: ['excludedTab1', 'excludedTab2'],
            }),
          }),
        })
      );
    });

    it('should pass field to buildFacet options', async () => {
      await setupElement({field: 'customField'});
      expect(buildFacet).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            field: 'customField',
          }),
        })
      );
    });
  });

  describe('data validation', () => {
    it('should warn when tabsIncluded and tabsExcluded are both set', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      await setupElement({
        tabsIncluded: ['tab1'],
        tabsExcluded: ['tab2'],
      });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Values for both \"tabs-included\" and \"tabs-excluded\" have been provided. This is could lead to unexpected behaviors.'
      );
      consoleWarnSpy.mockRestore();
    });

    it('should warn when exclusions are enabled on other display values than checkbox', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      await setupElement({
        displayValuesAs: 'link',
        enableExclusion: true,
      });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'The \"enableExclusion\" property is only available when \"displayValuesAs\" is set to \"checkbox\".'
      );
      consoleWarnSpy.mockRestore();
    });

    it('should register the facet', async () => {
      const {element} = await setupElement({facetId: 'some-facet-id'});
      expect(mockedRegisterFacet).toHaveBeenCalledWith(
        'facets',
        expect.objectContaining({
          facetId: 'some-facet-id',
          element,
        })
      );
    });
  });

  describe('accessibility', () => {
    it('should announce facet search values to screen readers when there are search results', async () => {
      vi.mocked(buildFacet).mockReturnValue(
        buildFakeFacet({
          implementation: {
            // @ts-expect-error: ignoring other methods
            facetSearch: {
              select: vi.fn(),
            },
          },
          state: {
            facetSearch: {
              moreValuesAvailable: true,
              isLoading: false,
              query: 'ele',
              values: [
                {
                  displayValue: 'sd',
                  rawValue: 'sd',
                  count: 1,
                },
              ],
            },
          },
        })
      );

      const setMessageSpy = vi.spyOn(
        AriaLiveRegionController.prototype,
        'message',
        'set'
      );
      const {locators} = await setupElement();
      await userEvent.click(locators.valueLabel[0]);
      expect(setMessageSpy).toHaveBeenCalledWith(
        '1 value found in the Test Field facet'
      );
    });
  });

  describe('#disconnectedCallback', () => {
    it('should stop watching facetConditionsManager', async () => {
      const stopWatching = vi.fn();
      vi.mocked(buildFacetConditionsManager).mockReturnValue(
        buildFakeFacetConditionsManager({
          stopWatching,
        })
      );
      const {element} = await setupElement();
      await element.remove();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(stopWatching).toHaveBeenCalled();
    });
  });
});
