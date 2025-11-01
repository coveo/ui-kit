import type {CategoryFacet, Summary} from '@coveo/headless/commerce';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeCategoryFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/category-facet-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import type {AtomicCommerceCategoryFacet} from './atomic-commerce-category-facet';
import './atomic-commerce-category-facet';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-category-facet', () => {
  let mockedSummary: Summary;
  let mockedFacet: CategoryFacet;
  let mockedConsoleError: MockInstance;

  beforeEach(() => {
    mockedConsoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockedSummary = buildFakeSummary({});
    mockedFacet = buildFakeCategoryFacet({
      implementation: {
        toggleSelect: vi.fn(),
        deselectAll: vi.fn(),
        showMoreValues: vi.fn(),
        showLessValues: vi.fn(),
        facetSearch: {
          clear: vi.fn(),
          updateText: vi.fn(),
          search: vi.fn(),
          select: vi.fn(),
          showMoreResults: vi.fn(),
        },
      },
    });
  });

  const setupElement = async (
    props?: Partial<{isCollapsed: boolean; field: string}>
  ) => {
    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceCategoryFacet>({
        template: html`<atomic-commerce-category-facet
          .facet=${mockedFacet}
          .summary=${mockedSummary}
          field="cat_platform"
          ?is-collapsed=${props?.isCollapsed || false}
        ></atomic-commerce-category-facet>`,
        selector: 'atomic-commerce-category-facet',
        bindings: (bindings) => {
          bindings.store.getUniqueIDFromEngine = vi.fn().mockReturnValue('123');
          return bindings;
        },
      });

    return {
      element,
      get title() {
        return page.getByText('some-category-display-name', {exact: true});
      },
      get noLabelTitle() {
        return page.getByText('No label', {exact: true});
      },
      getFacetValueByPosition(valuePosition: number) {
        return page.getByRole('listitem').nth(valuePosition);
      },
      getFacetValueByLabel(value: string | RegExp) {
        return page.getByRole('listitem').filter({hasText: value});
      },
      getFacetValueButtonByLabel(value: string | RegExp) {
        return page.getByLabelText(`Inclusion filter on ${value}`);
      },
      get showMoreButton() {
        return page.getByRole('button', {name: /show more/i});
      },
      get showLessButton() {
        return page.getByRole('button', {name: /show less/i});
      },
      get componentError() {
        return page.getByText(
          'Look at the developer console for more information'
        );
      },
      get allCategoryButton() {
        return element.shadowRoot!.querySelector(
          '[part=all-categories-button]'
        )! as HTMLButtonElement;
      },
      get facet() {
        return element.shadowRoot!.querySelector('[part=facet]')!;
      },
      get clearButton() {
        return element.shadowRoot!.querySelector('[part=clear-button]')!;
      },
      get searchWrapper() {
        return element.shadowRoot!.querySelector('[part=search-wrapper]')!;
      },
      get searchClearButton() {
        return element.shadowRoot!.querySelector('[part=search-clear-button]')!;
      },
      get searchHighlight() {
        return element.shadowRoot!.querySelector('[part=search-highlight]')!;
      },
      get searchIcon() {
        return element.shadowRoot!.querySelector('[part=search-icon]')!;
      },
      get searchResult() {
        return element.shadowRoot!.querySelector('[part=search-result]')!;
      },
      get searchResultPath() {
        return element.shadowRoot!.querySelector('[part=search-result-path]')!;
      },
      get searchResults() {
        return element.shadowRoot!.querySelector('[part=search-results]')!;
      },
      get searchInput() {
        return element.shadowRoot!.querySelector(
          '[part=search-input]'
        )! as HTMLInputElement;
      },
      get matchesQuery() {
        return element.shadowRoot!.querySelector('[part=matches-query]')!;
      },
      get moreMatches() {
        return element.shadowRoot!.querySelector('[part=more-matches]')!;
      },
      get noMatches() {
        return element.shadowRoot!.querySelector('[part=no-matches]')!;
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
      get valueLinks() {
        return element.shadowRoot!.querySelectorAll('[part~=value-link]');
      },
      get showMore() {
        return element.shadowRoot!.querySelector('[part=show-more]')!;
      },
      get showLess() {
        return element.shadowRoot!.querySelector('[part=show-less]')!;
      },
      get activeParent() {
        return element.shadowRoot!.querySelector('[part~=active-parent]')!;
      },
      get backArrow() {
        return element.shadowRoot!.querySelector('[part=back-arrow]')!;
      },
      get leafValue() {
        return element.shadowRoot!.querySelector('[part=leaf-value]')!;
      },
      get parents() {
        return element.shadowRoot!.querySelector('[part=parents]')!;
      },
      get subParents() {
        return element.shadowRoot!.querySelector('[part=sub-parents]')!;
      },
    };
  };

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

  it('should render value links', async () => {
    const {valueLinks} = await setupElement();
    await expect.element(valueLinks[0]).toBeInTheDocument();
  });

  it('should render the first facet value label', async () => {
    const {getFacetValueByLabel} = await setupElement();
    const facetValueLabel = getFacetValueByLabel('Electronics');
    await expect.element(facetValueLabel).toBeVisible();
  });

  it('should render the first facet value button label', async () => {
    const {getFacetValueButtonByLabel} = await setupElement();
    const facetValueButtonLabel = getFacetValueButtonByLabel('Electronics');
    await expect.element(facetValueButtonLabel).toBeVisible();
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

  it('should render search parts when there are search results', async () => {
    mockedFacet = buildFakeCategoryFacet({
      state: {
        facetSearch: {
          isLoading: false,
          query: 'ele',
          moreValuesAvailable: true,
          values: [
            {
              displayValue: 'Electronics',
              rawValue: 'electronics',
              path: ['Electronics'],
              count: 100,
            },
          ],
        },
      },
    });
    const {
      searchClearButton,
      searchIcon,
      searchHighlight,
      searchResult,
      searchResultPath,
      searchResults,
      matchesQuery,
      moreMatches,
    } = await setupElement();

    await expect.element(searchClearButton).toBeInTheDocument();
    await expect.element(searchHighlight).toBeInTheDocument();
    await expect.element(searchResult).toBeInTheDocument();
    await expect.element(searchResultPath).toBeInTheDocument();
    await expect.element(searchResults).toBeInTheDocument();
    await expect.element(searchIcon).toBeInTheDocument();
    await expect.element(searchIcon).toBeInTheDocument();
    await expect.element(matchesQuery).toBeInTheDocument();
    await expect.element(moreMatches).toBeInTheDocument();
  });

  it('should render noMatches when there are no search results', async () => {
    mockedFacet = buildFakeCategoryFacet({
      state: {
        facetSearch: {
          isLoading: false,
          query: 'ele',
          moreValuesAvailable: false,
          values: [],
        },
      },
    });
    const {noMatches} = await setupElement();
    await expect.element(noMatches).toBeInTheDocument();
  });

  it('should not render facet when there are no values', async () => {
    mockedFacet = buildFakeCategoryFacet({
      state: {
        values: [],
      },
    });

    const {facet} = await setupElement();

    expect(facet).not.toBeInTheDocument();
  });

  it('should not render values when collapsed', async () => {
    const {values} = await setupElement({
      isCollapsed: true,
    });

    await expect.element(values).not.toBeInTheDocument();
  });

  it('should not render facet when summary has error', async () => {
    mockedSummary = buildFakeSummary({
      state: {
        hasError: true,
      },
    });
    const {facet} = await setupElement();

    await expect.element(facet).not.toBeInTheDocument();
  });

  it('should not render facet when first request not executed', async () => {
    mockedSummary = buildFakeSummary({
      state: {
        firstRequestExecuted: false,
      },
    });
    const {facet} = await setupElement();
    await expect.element(facet).not.toBeInTheDocument();
  });

  it('should not render show more button when canShowMoreValues is false', async () => {
    mockedFacet = buildFakeCategoryFacet({
      state: {
        canShowMoreValues: false,
      },
    });

    const {showMore} = await setupElement();
    expect(showMore).not.toBeInTheDocument();
  });

  it('should not render show less button when canShowLessValues is false', async () => {
    mockedFacet = buildFakeCategoryFacet({
      state: {
        canShowLessValues: false,
      },
    });

    const {showLess} = await setupElement();
    expect(showLess).not.toBeInTheDocument();
  });

  it('should render no-label when facet has no display name', async () => {
    mockedFacet = buildFakeCategoryFacet({
      state: {
        displayName: '',
      },
    });
    const {noLabelTitle} = await setupElement();
    await expect.element(noLabelTitle).toBeInTheDocument();
  });

  it('should throw error when facet property is missing', async () => {
    // @ts-expect-error: mocking facet to be undefined
    mockedFacet = undefined;
    const {componentError} = await setupElement();

    expect(componentError).toBeVisible();
    expect(mockedConsoleError).toHaveBeenCalledWith(
      new Error(
        'The "facet" property is required for <atomic-commerce-category-facet>.'
      ),
      expect.anything()
    );
  });

  it('should #toggleSelect when facet value is clicked', async () => {
    const {getFacetValueButtonByLabel} = await setupElement();
    const facetValueButton = getFacetValueButtonByLabel('Electronics');

    await facetValueButton.click();
    expect(mockedFacet.toggleSelect).toHaveBeenCalled();
  });

  it('should #showMoreValues when show more button is clicked', async () => {
    const {showMoreButton} = await setupElement();

    await showMoreButton.click();
    expect(mockedFacet.showMoreValues).toHaveBeenCalled();
  });

  it('should #showLessValues when show less button is clicked', async () => {
    const {showLessButton} = await setupElement();

    await showLessButton.click();
    expect(mockedFacet.showLessValues).toHaveBeenCalled();
  });

  it('should toggle collapse state when label button is clicked', async () => {
    const {labelButton, values} = await setupElement();

    await expect.element(values).toBeInTheDocument();
    await userEvent.click(labelButton);

    await expect.element(values).not.toBeInTheDocument();
  });

  it('should call facet search methods when search functionality is used', async () => {
    const {searchInput} = await setupElement();

    // Simulate typing in search input
    await userEvent.type(searchInput, 'test search');

    expect(mockedFacet.facetSearch.updateText).toHaveBeenCalledWith(
      'test search'
    );
    expect(mockedFacet.facetSearch.search).toHaveBeenCalled();
  });

  it('should call facetSearch.showMoreResults when there are more results available and the "more matches for x" button is clicked', async () => {
    mockedFacet = buildFakeCategoryFacet({
      state: {
        facetSearch: {
          moreValuesAvailable: true,
          isLoading: false,
          query: 'ele',
          values: [
            {
              displayValue: 'sd',
              rawValue: 'sd',
              path: ['sd'],
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
          showMoreResults: vi.fn(),
        },
      },
    });

    const {moreMatches} = await setupElement();

    await userEvent.click(moreMatches);
    expect(mockedFacet.facetSearch.showMoreResults).toHaveBeenCalled();
  });

  it('should #facetSearch.clear when search is cleared', async () => {
    const {searchInput} = await setupElement();

    await userEvent.type(searchInput, 'foo');
    await userEvent.type(searchInput, '{backspace}{backspace}{backspace}');

    expect(mockedFacet.facetSearch.clear).toHaveBeenCalled();
  });

  describe('when there are selected value ancestry', () => {
    const mockedDeselectAll = vi.fn();

    beforeEach(() => {
      mockedFacet = buildFakeCategoryFacet({
        implementation: {
          deselectAll: mockedDeselectAll,
          toggleSelect: vi.fn(),
        },
        state: {
          hasActiveValues: true,
          selectedValueAncestry: [
            {
              value: 'Electronics',
              numberOfResults: 25,
              moreValuesAvailable: true,
              state: 'selected',
              path: ['Electronics'],
              children: [
                {
                  value: 'Laptops',
                  numberOfResults: 10,
                  moreValuesAvailable: false,
                  state: 'idle',
                  path: ['Electronics', 'Laptops'],
                  children: [],
                  isLeafValue: true,
                  isAutoSelected: false,
                  isSuggested: false,
                },
              ],
              isLeafValue: false,
              isAutoSelected: false,
              isSuggested: false,
            },
          ],
        },
      });
    });

    it('should render the hierarchical tree with correct parts', async () => {
      const {activeParent, allCategoryButton, backArrow, parents, subParents} =
        await setupElement();
      await expect.element(activeParent).toBeInTheDocument();
      await expect.element(backArrow).toBeInTheDocument();
      await expect.element(allCategoryButton).toBeInTheDocument();
      await expect.element(parents).toBeInTheDocument();
      await expect.element(subParents).toBeInTheDocument();
    });

    it('should #deselectAll when all categories button is clicked', async () => {
      const {allCategoryButton} = await setupElement();

      await userEvent.click(allCategoryButton);

      expect(mockedDeselectAll).toHaveBeenCalled();
    });
  });
});
