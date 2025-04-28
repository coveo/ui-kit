import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeRegularFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/facet-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-controller';
import {RegularFacet, Summary} from '@coveo/headless/commerce';
import {userEvent} from '@storybook/test';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {expect, vi} from 'vitest';
// import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {AtomicCommerceFacet} from './atomic-commerce-facet';
import './atomic-commerce-facet';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('AtomicCommerceFacet', () => {
  let mockedSummary: Summary;
  let mockedFacet: RegularFacet;
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
    parts: (element: Element) => {
      const qs = (part: string) =>
        element.shadowRoot?.querySelector(`[part~="${part}"]`);
      const qsa = (part: string) =>
        element.shadowRoot?.querySelectorAll(`[part~="${part}"]`);
      return {
        facet: qs('facet'),
        placeholder: qs('placeholder'),
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
        valueLink: qsa('value-link'),
        valueLinkSelected: qsa('value-link-selected'),
        valueBox: qsa('value-box'),
        valueBoxSelected: qsa('value-box-selected'),
        valueExcludeButton: qsa('value-exclude-button'),
        showMore: qs('show-more'),
        showLess: qs('show-less'),
        showMoreLessIcon: qs('show-more-less-icon'),
      };
    },
  };

  beforeEach(() => {
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
        },
      },
    });
  });

  const setupElement = async () => {
    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceFacet>({
        template: html`<atomic-commerce-facet
          .facet=${mockedFacet}
          .summary=${mockedSummary}
          ?isCollapsed=${false}
          field="testField"
        ></atomic-commerce-facet>`,
        selector: 'atomic-commerce-facet',
        bindings: (bindings) => {
          bindings.store.getUniqueIDFromEngine = vi.fn().mockReturnValue('123');
          return bindings;
        },
      });
    element.initialize();
    return element;
  };

  it('renders correctly facet elements', async () => {
    await setupElement();

    const title = locators.title;
    const facetValue = locators.getFacetValueByPosition(0);
    const facetValueButton = locators.getFacetValueButtonByPosition(0);
    const facetValueLabel = locators.getFacetValueByLabel('value-1');
    const facetValueButtonLabel =
      locators.getFacetValueButtonByLabel('value-1');
    // const clearFilter = locators.clearFilter; TODO: test when a facet value is selected

    await expect.element(title).toBeVisible();
    await expect.element(facetValue).toBeVisible();
    await expect.element(facetValueButton).toBeVisible();
    await expect.element(facetValueLabel).toBeVisible();
    await expect.element(facetValueButtonLabel).toBeVisible();
    // await expect.element(clearFilter).toBeInTheDocument();
  });

  it('renders parts in the documents', async () => {
    const element = await setupElement();

    const parts = locators.parts(element);

    // TODO: add test for other locators
    // await expect.element(parts.facet!).toBeInTheDocument();
    // await expect.element(parts.placeholder!).toBeInTheDocument();
    await expect.element(parts.labelButton!).toBeInTheDocument();
    await expect.element(parts.labelButtonIcon!).toBeInTheDocument();
    await expect.element(parts.searchWrapper!).toBeInTheDocument();
    await expect.element(parts.searchInput!).toBeInTheDocument();
    await expect.element(parts.searchIcon!).toBeInTheDocument();
    await expect.element(parts.values![0]).toBeInTheDocument();
    await expect.element(parts.valueLabel![0]).toBeInTheDocument();
    await expect.element(parts.valueCount![0]).toBeInTheDocument();
    await expect.element(parts.valueCheckbox![0]).toBeInTheDocument();
    await expect.element(parts.valueCheckboxLabel![0]).toBeInTheDocument();
    await expect.element(parts.valueCheckboxIcon![0]).toBeInTheDocument();
    // await expect.element(parts.valueLink!).toBeInTheDocument();
    // await expect.element(parts.valueLinkSelected!).toBeInTheDocument();
    // await expect.element(parts.valueBox!).toBeInTheDocument();
    // await expect.element(parts.valueBoxSelected!).toBeInTheDocument();
    // await expect.element(parts.valueExcludeButton!).toBeInTheDocument();

    await expect.element(parts.showMore!).toBeInTheDocument();
    await expect.element(parts.showLess!).toBeInTheDocument();
    await expect.element(parts.showMoreLessIcon!).toBeInTheDocument();
  }, 4e60);

  it('renders nothing when facet is undefined', async () => {
    // @ts-expect-error: mocking facet to be undefined
    mockedFacet = undefined;
    const element = await setupElement();

    expect(element.shadowRoot?.textContent).toBe('');
  });

  it('renders the header with the correct label', async () => {
    const element = await setupElement();
    const labelButton = locators.parts(element).labelButton;

    await expect.element(labelButton!).toHaveTextContent('some-display-name');
  });

  it('renders facet values when available', async () => {
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

  it('does not render the "show more" button when canShowMoreValues is false', async () => {
    mockedFacet = buildFakeRegularFacet({
      state: {
        canShowMoreValues: false,
      },
    });
    const element = await setupElement();

    const showMore = locators.parts(element).showMore;
    await expect.element(showMore!).not.toBeInTheDocument();
  }, 3e60); // TODO: remove timeout

  it('does not render the "show less" button when canShowLessValues is false', async () => {
    mockedFacet = buildFakeRegularFacet({
      state: {
        canShowLessValues: false,
      },
    });
    const element = await setupElement();

    const showLess = locators.parts(element).showLess;
    await expect.element(showLess!).not.toBeInTheDocument();
  }, 3e60); // TODO: remove timeout

  it('calls facet.toggleSelect when a value is clicked', async () => {
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

  it('should not render the clear button when there are no selected values', async () => {
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
  }, 4e60); // TODO: remove timeout

  it('should render the checkbox as selected', async () => {
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

    expect(parts.valueCheckboxChecked?.length).toBe(1);
  }, 4e60); // TODO: remove timeout

  it('calls facet.deselectAll when the clear button is clicked', async () => {
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

  it('calls facet.showMoreValues when the "show more" button is clicked', async () => {
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

  it('calls facet.showLessValues when the "show less" button is clicked', async () => {
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

  it('calls facet.facetSearch.search when a search query is updated', async () => {
    const element = await setupElement();

    const searchInput = locators.parts(element).searchInput!;
    await userEvent.type(searchInput, 'test query');

    expect(mockedFacet.facetSearch.updateText).toHaveBeenCalledWith(
      'test query'
    );
    expect(mockedFacet.facetSearch.search).toHaveBeenCalled();
  });

  it('renders facet search parts when there are search results', async () => {
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

  it('renders "more matches" caption when there are move values available', async () => {
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

  it('renders proper part when there are no search results', async () => {
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
  }, 1e60); // TODO: remove timeout
});
