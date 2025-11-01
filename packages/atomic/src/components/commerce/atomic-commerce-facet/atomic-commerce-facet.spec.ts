import type {RegularFacet, Summary} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeRegularFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/facet-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import type {AtomicCommerceFacet} from './atomic-commerce-facet';
import './atomic-commerce-facet';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-facet', () => {
  let mockedSummary: Summary;
  let mockedFacet: RegularFacet;
  let mockedConsoleError: MockInstance;

  const locators = {
    get title() {
      return page.getByText('some-display-name', {exact: true});
    },
    getFacetValueByPosition(valuePosition: number) {
      return page.getByRole('listitem').nth(valuePosition);
    },
    getFacetValueButtonByPosition(valuePosition: number) {
      const value = this.getFacetValueByPosition(valuePosition);
      return value.getByRole('checkbox');
    },
    getFacetValueByLabel(value: string | RegExp) {
      return page.getByRole('listitem').filter({hasText: value});
    },
    getFacetValueButtonByLabel(value: string | RegExp) {
      return page.getByLabelText(`Inclusion filter on ${value}`);
    },
    get componentError() {
      return page.getByText(
        'Look at the developer console for more information'
      );
    },
    moreMatches(element: Element) {
      return element.shadowRoot!.querySelector('[part=more-matches]')!;
    },
    parts: (element: Element) => {
      const qs = (part: string) =>
        element.shadowRoot?.querySelector(`[part~="${part}"]`);
      const qsa = (part: string) =>
        element.shadowRoot?.querySelectorAll(`[part~="${part}"]`);
      return {
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
        valueCheckboxLabel: qsa('value-checkbox-label'),
        valueCheckboxIcon: qsa('value-checkbox-icon'),
        showMore: qs('show-more'),
        showLess: qs('show-less'),
        showMoreLessIcon: qs('show-more-less-icon'),
      };
    },
  };

  beforeEach(() => {
    mockedConsoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockedSummary = buildFakeSummary({});
    mockedFacet = buildFakeRegularFacet({
      implementation: {
        toggleSelect: vi.fn(),
        toggleExclude: vi.fn(),
        deselectAll: vi.fn(),
        showMoreValues: vi.fn(),
        showLessValues: vi.fn(),
        facetSearch: {
          clear: vi.fn(),
          updateText: vi.fn(),
          search: vi.fn(),
          select: vi.fn(),
          exclude: vi.fn(),
          singleExclude: vi.fn(),
          singleSelect: vi.fn(),
          showMoreResults: vi.fn(),
        },
      },
    });
  });

  afterEach(() => {
    mockedConsoleError.mockRestore();
  });

  const setupElement = async ({isCollapsed} = {isCollapsed: false}) => {
    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceFacet>({
        template: html`<atomic-commerce-facet
          .facet=${mockedFacet}
          .summary=${mockedSummary}
          ?is-collapsed=${isCollapsed}
          field="testField"
        ></atomic-commerce-facet>`,
        selector: 'atomic-commerce-facet',
        bindings: (bindings) => {
          bindings.store.getUniqueIDFromEngine = vi.fn().mockReturnValue('123');
          return bindings;
        },
      });
    return element;
  };

  it('should render the title', async () => {
    await setupElement();
    const title = locators.title;
    await expect.element(title).toBeVisible();
  });

  it('should render the first facet value', async () => {
    await setupElement();
    const facetValue = locators.getFacetValueByPosition(0);
    await expect.element(facetValue).toBeVisible();
  });

  it('should render the first facet value button', async () => {
    await setupElement();
    const facetValueButton = locators.getFacetValueButtonByPosition(0);
    await expect.element(facetValueButton).toBeVisible();
  });

  it('should render the first facet value label', async () => {
    await setupElement();
    const facetValueLabel = locators.getFacetValueByLabel('value-1');
    await expect.element(facetValueLabel).toBeVisible();
  });

  it('should render the first facet value button label', async () => {
    await setupElement();
    const facetValueButtonLabel =
      locators.getFacetValueButtonByLabel('value-1');
    await expect.element(facetValueButtonLabel).toBeVisible();
  });

  it('should render the label button part', async () => {
    const element = await setupElement();
    const parts = locators.parts(element);
    await expect.element(parts.labelButton!).toBeInTheDocument();
  });

  it('should render the label button icon part', async () => {
    const element = await setupElement();
    const parts = locators.parts(element);
    await expect.element(parts.labelButtonIcon!).toBeInTheDocument();
  });

  it('should render the search wrapper part', async () => {
    const element = await setupElement();
    const parts = locators.parts(element);
    await expect.element(parts.searchWrapper!).toBeInTheDocument();
  });

  it('should render the search input part', async () => {
    const element = await setupElement();
    const parts = locators.parts(element);
    await expect.element(parts.searchInput!).toBeInTheDocument();
  });

  it('should render the search icon part', async () => {
    const element = await setupElement();
    const parts = locators.parts(element);
    await expect.element(parts.searchIcon!).toBeInTheDocument();
  });

  it('should render the first value part', async () => {
    const element = await setupElement();
    const parts = locators.parts(element);
    await expect.element(parts.values![0]).toBeInTheDocument();
  });

  it('should render the first value label part', async () => {
    const element = await setupElement();
    const parts = locators.parts(element);
    await expect.element(parts.valueLabel![0]).toBeInTheDocument();
  });

  it('should render the first value count part', async () => {
    const element = await setupElement();
    const parts = locators.parts(element);
    await expect.element(parts.valueCount![0]).toBeInTheDocument();
  });

  it('should render the first value checkbox part', async () => {
    const element = await setupElement();
    const parts = locators.parts(element);
    await expect.element(parts.valueCheckbox![0]).toBeInTheDocument();
  });

  it('should render the first value checkbox label part', async () => {
    const element = await setupElement();
    const parts = locators.parts(element);
    await expect.element(parts.valueCheckboxLabel![0]).toBeInTheDocument();
  });

  it('should render the first value checkbox icon part', async () => {
    const element = await setupElement();
    const parts = locators.parts(element);
    await expect.element(parts.valueCheckboxIcon![0]).toBeInTheDocument();
  });

  it('should render the show more button part', async () => {
    const element = await setupElement();
    const parts = locators.parts(element);
    await expect.element(parts.showMore!).toBeInTheDocument();
  });

  it('should render the show less button part', async () => {
    const element = await setupElement();
    const parts = locators.parts(element);
    await expect.element(parts.showLess!).toBeInTheDocument();
  });

  it('should render the show more/less icon part', async () => {
    const element = await setupElement();
    const parts = locators.parts(element);
    await expect.element(parts.showMoreLessIcon!).toBeInTheDocument();
  });

  it('should render and error when the facet is undefined', async () => {
    // @ts-expect-error: mocking facet to be undefined
    mockedFacet = undefined;
    await setupElement();

    expect(locators.componentError).toBeVisible();
    expect(mockedConsoleError).toHaveBeenCalledWith(
      new Error(
        'The "facet" property is required for <atomic-commerce-facet>.'
      ),
      expect.anything()
    );
  });

  it('should display an error message when facet encounter an error', async () => {
    const element = await setupElement();
    element.error = new Error('An error occurred');
    element.requestUpdate();
    await expect.element(locators.componentError).toBeVisible();
  });

  it('should render facet values when available', async () => {
    mockedFacet = buildFakeRegularFacet({
      state: {
        values: [
          {
            value: 'Value 1',
            state: 'idle',
            numberOfResults: 10,
            isAutoSelected: false,
            isSuggested: false,
            moreValuesAvailable: false,
          },
          {
            value: 'Value 2',
            state: 'selected',
            numberOfResults: 5,
            isAutoSelected: false,
            isSuggested: false,
            moreValuesAvailable: false,
          },
        ],
      },
    });

    const element = await setupElement();
    const valueLabel = locators.parts(element).valueLabel;

    expect(valueLabel!.length).toBe(2);
    await expect.element(valueLabel![0]).toHaveTextContent('Value 1');
    await expect.element(valueLabel![1]).toHaveTextContent('Value 2');
  });

  describe('when a value is selected', () => {
    beforeEach(() => {
      mockedFacet = buildFakeRegularFacet({
        state: {
          values: [
            {
              value: 'Value 1',
              state: 'selected',
              numberOfResults: 10,
              isAutoSelected: false,
              isSuggested: false,
              moreValuesAvailable: false,
            },
          ],
        },
      });
    });

    it('should select the "value 1" facet value', async () => {
      const element = await setupElement();
      const parts = locators.parts(element);

      expect(parts.valueCheckboxChecked?.length).toBe(1);
      await expect.element(parts.valueLabel![0]).toHaveTextContent('Value 1');
    });

    it('should add a bold class to the label', async () => {
      const element = await setupElement();
      const parts = locators.parts(element);

      await expect.element(parts.valueLabel![0]).toHaveClass('font-bold');
    });
  });

  it('should not render the "show more" button when canShowMoreValues is false', async () => {
    mockedFacet = buildFakeRegularFacet({
      state: {
        canShowMoreValues: false,
      },
    });
    const element = await setupElement();

    const showMore = locators.parts(element).showMore;
    await expect.element(showMore!).not.toBeInTheDocument();
  });

  it('should not render the "show less" button when canShowLessValues is false', async () => {
    mockedFacet = buildFakeRegularFacet({
      state: {
        canShowLessValues: false,
      },
    });
    const element = await setupElement();

    const showLess = locators.parts(element).showLess;
    await expect.element(showLess!).not.toBeInTheDocument();
  });

  it('should render 1 idle value', async () => {
    mockedFacet = buildFakeRegularFacet({
      state: {
        values: [
          {
            value: 'Value 1',
            state: 'idle',
            numberOfResults: 10,
            isAutoSelected: false,
            isSuggested: false,
            moreValuesAvailable: false,
          },
        ],
      },
    });
    const element = await setupElement();
    const parts = locators.parts(element);
    const {valueCheckbox, valueCheckboxChecked} = parts;
    await expect(valueCheckbox?.length).toBe(1);
    await expect(valueCheckboxChecked?.length).toBe(0);
  });

  it('should not render the clear button when there are no selected values', async () => {
    mockedFacet = buildFakeRegularFacet({
      state: {
        values: [
          {
            value: 'Value 1',
            state: 'idle',
            numberOfResults: 10,
            isAutoSelected: false,
            isSuggested: false,
            moreValuesAvailable: false,
          },
        ],
      },
    });
    const element = await setupElement();
    const parts = locators.parts(element);
    const clearButton = parts.clearButton;
    await expect.element(clearButton!).not.toBeInTheDocument();
  });

  it('should render the clear button when there are selected values', async () => {
    mockedFacet = buildFakeRegularFacet({
      state: {
        values: [
          {
            value: 'Value 1',
            state: 'selected',
            numberOfResults: 10,
            isAutoSelected: false,
            isSuggested: false,
            moreValuesAvailable: false,
          },
        ],
      },
    });
    const element = await setupElement();
    const parts = locators.parts(element);

    await expect.element(parts.clearButton!).toBeVisible();
    await expect.element(parts.clearButton!).toHaveTextContent('Clear filter');
    await expect.element(parts.clearButtonIcon!).toBeVisible();
  });

  it('should call facet.deselectAll when the clear button is clicked', async () => {
    mockedFacet = buildFakeRegularFacet({
      implementation: {
        deselectAll: vi.fn(),
      },
      state: {
        values: [
          {
            value: 'Value 1',
            state: 'selected',
            numberOfResults: 10,
            isAutoSelected: false,
            isSuggested: false,
            moreValuesAvailable: false,
          },
        ],
      },
    });

    const element = await setupElement();
    const clearButton = locators.parts(element).clearButton!;

    await userEvent.click(clearButton);
    expect(mockedFacet.deselectAll).toHaveBeenCalled();
  });

  it('should call facet.showMoreValues when the "show more" button is clicked', async () => {
    mockedFacet = buildFakeRegularFacet({
      implementation: {
        showMoreValues: vi.fn(),
      },
      state: {
        canShowMoreValues: true,
      },
    });

    const element = await setupElement();
    const showMore = locators.parts(element).showMore!;
    await userEvent.click(showMore);

    expect(mockedFacet.showMoreValues).toHaveBeenCalled();
  });

  it('should call facet.showLessValues when the "show less" button is clicked', async () => {
    mockedFacet = buildFakeRegularFacet({
      implementation: {
        showLessValues: vi.fn(),
      },
      state: {
        canShowLessValues: true,
      },
    });

    const element = await setupElement();
    const showLess = locators.parts(element).showLess!;
    await userEvent.click(showLess);

    expect(mockedFacet.showLessValues).toHaveBeenCalled();
  });

  it('should call facet.facetSearch.search when a search query is updated', async () => {
    const element = await setupElement();

    const searchInput = locators.parts(element).searchInput!;
    await userEvent.type(searchInput, 'test query');

    expect(mockedFacet.facetSearch.updateText).toHaveBeenCalledWith(
      'test query'
    );
    expect(mockedFacet.facetSearch.search).toHaveBeenCalled();
  });

  it('should call facetSearch.showMoreResults when there are more facet search results available and the "more matches for x" button is clicked', async () => {
    mockedFacet = buildFakeRegularFacet({
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
      implementation: {
        facetSearch: {
          clear: vi.fn(),
          updateText: vi.fn(),
          search: vi.fn(),
          select: vi.fn(),
          exclude: vi.fn(),
          singleExclude: vi.fn(),
          singleSelect: vi.fn(),
          showMoreResults: vi.fn(),
        },
      },
    });
    const element = await setupElement();

    await userEvent.click(locators.moreMatches(element));

    expect(mockedFacet.facetSearch.showMoreResults).toHaveBeenCalled();
  });

  it('should render facet search parts when there are facet search results', async () => {
    mockedFacet = buildFakeRegularFacet({
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
    });

    const element = await setupElement();
    const parts = locators.parts(element);

    await expect.element(parts.searchClearButton!).toBeVisible();
    await expect.element(parts.matchesQuery!).toHaveTextContent('test query');
    await expect
      .element(parts.moreMatches!)
      .toHaveTextContent('More matches for test query');
    await expect
      .element(parts.searchHighlight!)
      .toHaveTextContent('test query');
  });

  it('should render "more matches" caption when there are move values available', async () => {
    mockedFacet = buildFakeRegularFacet({
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
    });

    await setupElement();
    await expect
      .element(page.getByText('More matches for test query'))
      .toBeVisible();
  });

  it('should render proper part when there are no facet search results', async () => {
    mockedFacet = buildFakeRegularFacet({
      state: {
        facetSearch: {
          isLoading: false,
          query: 'test query',
          moreValuesAvailable: false,
          values: [],
        },
      },
    });

    const element = await setupElement();

    const parts = locators.parts(element);
    await expect.element(parts.noMatches!).toBeVisible();
    await expect
      .element(parts.noMatches!)
      .toHaveTextContent('No matches found for test query');
  });

  it('does not render the body when isCollapsed is true', async () => {
    const element = await setupElement({isCollapsed: true});
    const parts = locators.parts(element);
    const {values, searchInput, showMore} = parts;

    await expect(values?.length).toBe(0);
    await expect.element(searchInput!).not.toBeInTheDocument();
    await expect.element(showMore!).not.toBeInTheDocument();
  });

  it('should toggle collapse when the header is clicked', async () => {
    const element = await setupElement({isCollapsed: true});
    const labelButton = locators.parts(element).labelButton!;

    await userEvent.click(labelButton);

    expect(element.isCollapsed).toBe(false);
  });

  it('should call facet.toggleSelect when a value is clicked', async () => {
    mockedFacet = buildFakeRegularFacet({
      implementation: {
        toggleSelect: vi.fn(),
      },
      state: {
        values: [
          {
            value: 'Value 1',
            state: 'idle',
            numberOfResults: 10,
            isAutoSelected: false,
            isSuggested: false,
            moreValuesAvailable: false,
          },
        ],
      },
    });

    const element = await setupElement();
    const valueLabel = locators.parts(element).valueLabel!;

    await userEvent.click(valueLabel[0]);

    expect(mockedFacet.toggleSelect).toHaveBeenCalledWith({
      value: 'Value 1',
      state: 'idle',
      numberOfResults: 10,
      isAutoSelected: false,
      isSuggested: false,
      moreValuesAvailable: false,
    });
  });

  describe('#initialize', () => {
    it('should call all initialization methods in the correct order', async () => {
      const element = await setupElement();

      // Spy on the private methods
      // @ts-expect-error: accessing private methods for testing
      const validateFacetSpy = vi.spyOn(element, 'validateFacet');
      // @ts-expect-error: accessing private methods for testing
      const initFocusTargetsSpy = vi.spyOn(element, 'initFocusTargets');
      // @ts-expect-error: accessing private methods for testing
      const ensureSubscribedSpy = vi.spyOn(element, 'ensureSubscribed');
      // @ts-expect-error: accessing private methods for testing
      const initAriaLiveSpy = vi.spyOn(element, 'initAriaLive');

      // Call initialize
      element.initialize();

      // Verify all methods were called
      expect(validateFacetSpy).toHaveBeenCalledOnce();
      expect(initFocusTargetsSpy).toHaveBeenCalledOnce();
      expect(ensureSubscribedSpy).toHaveBeenCalledOnce();
      expect(initAriaLiveSpy).toHaveBeenCalledOnce();
    });

    it('should subscribe to facet controller', async () => {
      const element = await setupElement();
      const subscribeSpy = vi.spyOn(mockedFacet, 'subscribe');

      element.initialize();

      expect(subscribeSpy).toHaveBeenCalled();
    });
  });

  describe('#disconnectedCallback', () => {
    it('should unsubscribe from facet controller when component disconnects', async () => {
      const element = await setupElement();
      const unsubscribeSpy = vi.fn();

      // @ts-expect-error: accessing private properties for testing
      element.unsubscribeFacetController = unsubscribeSpy;

      element.disconnectedCallback();

      expect(unsubscribeSpy).toHaveBeenCalledOnce();
      // @ts-expect-error: accessing private properties for testing
      expect(element.unsubscribeFacetController).toBeUndefined();
    });

    it('should not error when unsubscribeFacetController is undefined', async () => {
      const element = await setupElement();

      // @ts-expect-error: accessing private properties for testing
      element.unsubscribeFacetController = undefined;

      expect(() => element.disconnectedCallback()).not.toThrow();
    });

    it('should call super.disconnectedCallback()', async () => {
      const element = await setupElement();
      const superSpy = vi.spyOn(LitElement.prototype, 'disconnectedCallback');

      element.disconnectedCallback();

      expect(superSpy).toHaveBeenCalledOnce();
    });
  });
});
