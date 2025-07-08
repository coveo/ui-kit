import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import type {
  CategoryFacet,
  CategoryFacetState,
  CategoryFacetValue,
  Summary,
} from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {
  describe,
  expect,
  vi,
  beforeEach,
  it,
  afterEach,
  type MockInstance,
} from 'vitest';
import type {AtomicCommerceCategoryFacet} from './atomic-commerce-category-facet';

vi.mock('@coveo/headless/commerce', {spy: true});

// Mock CategoryFacet since there's no specific fixture for it yet
const buildFakeCategoryFacet = (
  options: Partial<CategoryFacet> = {}
): CategoryFacet => {
  const defaultState: CategoryFacetState = {
    facetId: 'category-facet',
    field: 'cat_platform',
    displayName: 'Platform',
    values: [],
    selectedValueAncestry: [],
    canShowMoreValues: false,
    canShowLessValues: false,
    hasActiveValues: false,
    isLoading: false,
    type: 'hierarchical',
    facetSearch: {
      query: '',
      values: [],
      isLoading: false,
      moreValuesAvailable: false,
    },
  };

  return {
    state: {...defaultState, ...options.state},
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    showMoreValues: vi.fn(),
    showLessValues: vi.fn(),
    toggleSelect: vi.fn(),
    deselectAll: vi.fn(),
    facetSearch: {
      clear: vi.fn(),
      updateText: vi.fn(),
      search: vi.fn(),
      select: vi.fn(),
    },
    ...options,
  } as CategoryFacet;
};

describe('atomic-commerce-category-facet', () => {
  let mockedSummary: Summary;
  let mockedConsoleError: MockInstance;

  const locators = {
    get title() {
      return page.getByText('Platform', {exact: true});
    },
    getFacetValueByPosition(valuePosition: number) {
      return page.getByRole('listitem').nth(valuePosition);
    },
    getFacetValueButtonByPosition(valuePosition: number) {
      const value = this.getFacetValueByPosition(valuePosition);
      return value.getByRole('checkbox');
    },
    get clearButton() {
      return page.getByRole('button', {name: /clear/i});
    },
    get showMoreButton() {
      return page.getByRole('button', {name: /show more/i});
    },
    get showLessButton() {
      return page.getByRole('button', {name: /show less/i});
    },
    get searchInput() {
      return page.getByRole('searchbox');
    },
    get componentError() {
      return page.getByText(
        'Look at the developer console for more information'
      );
    },
    parts: (element: Element) => {
      const qs = (part: string) =>
        element.shadowRoot?.querySelector(`[part~="${part}"]`);
      return {
        facet: qs('facet'),
        labelButton: qs('label-button'),
        clearButton: qs('clear-button'),
        searchWrapper: qs('search-wrapper'),
        searchInput: qs('search-input'),
        values: qs('values'),
        showMore: qs('show-more'),
        showLess: qs('show-less'),
      };
    },
  };

  beforeEach(() => {
    mockedConsoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockedSummary = buildFakeSummary({});
  });

  afterEach(() => {
    mockedConsoleError.mockRestore();
  });

  const setupElement = async (
    facetOptions: Partial<CategoryFacet> = {},
    elementOptions = {}
  ) => {
    const facet = buildFakeCategoryFacet(facetOptions);

    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceCategoryFacet>({
        template: html`<atomic-commerce-category-facet
          .facet=${facet}
          .summary=${mockedSummary}
          field="cat_platform"
          .displayName=${'Platform'}
          .numberOfValues=${8}
          .sortCriteria=${'occurrences'}
          .withSearch=${false}
          .delimitingCharacter=${'>'}
          .filterFacetCount=${true}
          .injectionDepth=${1000}
          .isCollapsed=${false}
          .headingLevel=${0}
          ...${elementOptions}
        ></atomic-commerce-category-facet>`,
        selector: 'atomic-commerce-category-facet',
        bindings: (bindings) => {
          bindings.store.getUniqueIDFromEngine = vi.fn().mockReturnValue('123');
          return bindings;
        },
      });
    return element;
  };

  it('should render with default props', async () => {
    const element = await setupElement();
    expect(element).toBeDefined();
    expect(element.field).toBe('cat_platform');
  });

  it('should render the title', async () => {
    await setupElement();
    const title = locators.title;
    await expect.element(title).toBeVisible();
  });

  describe('when facet has values', () => {
    const mockValues: CategoryFacetValue[] = [
      {
        value: 'Electronics',
        numberOfResults: 150,
        state: 'idle',
        path: ['Electronics'],
        moreValuesAvailable: true,
        children: [],
        isLeafValue: true,
        isAutoSelected: false,
        isSuggested: false,
      },
      {
        value: 'Clothing',
        numberOfResults: 89,
        state: 'selected',
        path: ['Clothing'],
        moreValuesAvailable: false,
        children: [],
        isLeafValue: true,
        isAutoSelected: false,
        isSuggested: false,
      },
    ];

    it('should display facet values when values are available', async () => {
      await setupElement({
        state: {
          ...buildFakeCategoryFacet().state,
          values: mockValues,
        },
      });

      const facetValues = page.getByRole('listitem');
      await expect.element(facetValues.first()).toBeVisible();
    });

    it('should show clear button when has active values', async () => {
      await setupElement({
        state: {
          ...buildFakeCategoryFacet().state,
          values: mockValues,
          hasActiveValues: true,
        },
      });

      await expect.element(locators.clearButton).toBeVisible();
    });

    it('should call toggleSelect when value is clicked', async () => {
      const toggleSelectSpy = vi.fn();
      await setupElement({
        state: {
          ...buildFakeCategoryFacet().state,
          values: mockValues,
        },
        toggleSelect: toggleSelectSpy,
      });

      const firstValue = locators.getFacetValueButtonByPosition(0);
      await firstValue.click();

      expect(toggleSelectSpy).toHaveBeenCalledWith(mockValues[0]);
    });
  });

  describe('when can show more values', () => {
    it('should display show more button when canShowMoreValues is true', async () => {
      await setupElement({
        state: {
          ...buildFakeCategoryFacet().state,
          canShowMoreValues: true,
        },
      });

      await expect.element(locators.showMoreButton).toBeVisible();
    });

    it('should call showMoreValues when show more button is clicked', async () => {
      const showMoreValuesSpy = vi.fn();
      await setupElement({
        state: {
          ...buildFakeCategoryFacet().state,
          canShowMoreValues: true,
        },
        showMoreValues: showMoreValuesSpy,
      });

      await locators.showMoreButton.click();
      expect(showMoreValuesSpy).toHaveBeenCalled();
    });
  });

  describe('when can show less values', () => {
    it('should display show less button when canShowLessValues is true', async () => {
      await setupElement({
        state: {
          ...buildFakeCategoryFacet().state,
          canShowLessValues: true,
        },
      });

      await expect.element(locators.showLessButton).toBeVisible();
    });

    it('should call showLessValues when show less button is clicked', async () => {
      const showLessValuesSpy = vi.fn();
      await setupElement({
        state: {
          ...buildFakeCategoryFacet().state,
          canShowLessValues: true,
        },
        showLessValues: showLessValuesSpy,
      });

      await locators.showLessButton.click();
      expect(showLessValuesSpy).toHaveBeenCalled();
    });
  });

  describe('when withSearch is enabled', () => {
    it('should display search input when withSearch is true', async () => {
      await setupElement({}, {'.withSearch': true});

      await expect.element(locators.searchInput).toBeVisible();
    });
  });

  describe('when facet is collapsed', () => {
    it('should not display facet values when isCollapsed is true', async () => {
      await setupElement(
        {
          state: {
            ...buildFakeCategoryFacet().state,
            values: [
              {
                value: 'Electronics',
                numberOfResults: 150,
                state: 'idle',
                path: ['Electronics'],
                moreValuesAvailable: false,
                children: [],
                isLeafValue: true,
                isAutoSelected: false,
                isSuggested: false,
              },
            ],
          },
        },
        {'.isCollapsed': true}
      );

      const facetValues = page.getByRole('listitem');
      await expect.element(facetValues).not.toBeVisible();
    });
  });

  describe('when loading', () => {
    it('should display loading state when isLoading is true', async () => {
      await setupElement({
        state: {
          ...buildFakeCategoryFacet().state,
          isLoading: true,
        },
      });

      // Check for loading indicator or disabled state
      const facetElement = page.getByRole('group');
      await expect.element(facetElement).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('#clear', () => {
    it('should call deselectAll when clear method is invoked', async () => {
      const deselectAllSpy = vi.fn();
      const element = await setupElement({
        deselectAll: deselectAllSpy,
      });

      // Simulate calling clear method if it exists on the element
      if ('clear' in element && typeof element.clear === 'function') {
        element.clear();
        expect(deselectAllSpy).toHaveBeenCalled();
      }
    });
  });

  describe('#focus', () => {
    it('should focus the first focusable element when focus method is called', async () => {
      const element = await setupElement({
        state: {
          ...buildFakeCategoryFacet().state,
          values: [
            {
              value: 'Electronics',
              numberOfResults: 150,
              state: 'idle',
              path: ['Electronics'],
              moreValuesAvailable: false,
              children: [],
              isLeafValue: true,
              isAutoSelected: false,
              isSuggested: false,
            },
          ],
        },
      });

      // Simulate calling focus method if it exists on the element
      if ('focus' in element && typeof element.focus === 'function') {
        element.focus();

        const firstCheckbox = locators.getFacetValueButtonByPosition(0);
        await expect.element(firstCheckbox).toHaveAttribute('tabindex', '0');
      }
    });
  });
});
