import {
  buildContext,
  buildProductListing,
  buildSearch,
  type CategoryFacet,
  type Context,
  type DateFacet,
  type FacetGenerator,
  type NumericFacet,
  type ProductListing,
  type ProductListingSummaryState,
  type RegularFacet,
  type Search,
  type SearchSummaryState,
  type Summary,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import {createAppLoadedListener} from '@/src/components/common/interface/store';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeCategoryFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/category-facet-controller';
import {buildFakeContext} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/context-controller';
import {buildFakeDateFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/date-facet-subcontroller';
import type {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeRegularFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/facet-controller';
import {buildFakeFacetGenerator} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/facet-generator-subcontroller';
import {buildFakeNumericFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/numeric-facet-controller';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import type {AtomicCommerceFacets} from './atomic-commerce-facets';
import './atomic-commerce-facets';

vi.mock('@/src/components/common/interface/store', {spy: true});
vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-facets', () => {
  let mockedFacetGenerator: FacetGenerator;
  let mockedSummary: Summary<SearchSummaryState | ProductListingSummaryState>;
  let mockedContext: Context;
  let mockedRegularFacet: RegularFacet;
  let mockedNumericFacet: NumericFacet;
  let mockedCategoryFacet: CategoryFacet;
  let mockedDateFacet: DateFacet;
  let mockedProductListing: ProductListing;
  let mockedSearch: Search;
  let mockedAppLoaded: MockInstance<typeof createAppLoadedListener>;
  let appLoadedCallback: (isAppLoaded: boolean) => void;
  let mockedLogger: MockInstance<
    ReturnType<typeof buildFakeCommerceEngine>['logger']['warn']
  >;

  beforeEach(() => {
    mockedLogger = vi.fn();
    mockedRegularFacet = buildFakeRegularFacet({
      state: {displayName: 'Regular Facet'},
    });
    mockedNumericFacet = buildFakeNumericFacet({
      state: {displayName: 'Numeric Facet'},
    });
    mockedCategoryFacet = buildFakeCategoryFacet({
      state: {displayName: 'Category Facet'},
    });
    mockedDateFacet = buildFakeDateFacet({
      state: {displayName: 'Date Facet'},
    });
    mockedContext = buildFakeContext({});
    mockedSummary = buildFakeSummary({
      state: {
        hasError: false,
        firstRequestExecuted: true,
        isLoading: false,
        hasProducts: true,
      },
    });
    mockedProductListing = buildFakeProductListing({
      implementation: {
        facetGenerator: () => mockedFacetGenerator,
        summary: () => mockedSummary as Summary<ProductListingSummaryState>,
      },
    });
    mockedSearch = buildFakeSearch({
      implementation: {
        facetGenerator: () => mockedFacetGenerator,
        summary: () => mockedSummary as Summary<SearchSummaryState>,
      },
    });
    mockedFacetGenerator = buildFakeFacetGenerator({
      state: [
        mockedRegularFacet,
        mockedNumericFacet,
        mockedCategoryFacet,
        mockedDateFacet,
      ].map((facet) => facet.state.facetId),
      implementation: {
        facets: [
          mockedRegularFacet,
          mockedNumericFacet,
          mockedCategoryFacet,
          mockedDateFacet,
        ],
      },
    });
    mockedAppLoaded = vi.mocked(createAppLoadedListener);
    mockedAppLoaded.mockImplementation((_store, cb) => {
      appLoadedCallback = cb;
    });
  });

  const renderCommerceFacets = async (
    options: {
      interfaceType?: 'product-listing' | 'search';
      collapseFacetsAfter?: number;
      isAppLoaded?: boolean;
    } = {}
  ) => {
    const {
      interfaceType = 'product-listing',
      collapseFacetsAfter = 4,
      isAppLoaded = true,
    } = options;

    vi.mocked(buildProductListing).mockReturnValue(mockedProductListing);
    vi.mocked(buildSearch).mockReturnValue(mockedSearch);
    vi.mocked(buildContext).mockReturnValue(mockedContext);

    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceFacets>({
        template: html`<atomic-commerce-facets
          collapse-facets-after="${collapseFacetsAfter}"
        ></atomic-commerce-facets>`,
        selector: 'atomic-commerce-facets',
        bindings: (bindings) => {
          bindings.interfaceElement.type = interfaceType;
          // @ts-expect-error - testing logger override
          bindings.engine.logger = {warn: mockedLogger};
          return bindings;
        },
      });

    appLoadedCallback(isAppLoaded);

    return {
      element,
      get placeholders() {
        return element.querySelectorAll('atomic-facet-placeholder')!;
      },
      get regularFacet() {
        return element.querySelector('atomic-commerce-facet')!;
      },
      get numericFacet() {
        return element.querySelector('atomic-commerce-numeric-facet')!;
      },
      get categoryFacet() {
        return element.querySelector('atomic-commerce-category-facet')!;
      },
      get timeframeFacet() {
        return element.querySelector('atomic-commerce-timeframe-facet')!;
      },
      header(facet: string) {
        return page.getByLabelText(
          new RegExp(`(Expand|Collapse) the ${facet} facet`),
          {exact: true}
        );
      },
    };
  };

  it('should render with default props', async () => {
    const {element} = await renderCommerceFacets();
    await expect.element(element).toBeDefined();
  });

  it('should call #buildProductListing when interface type is product-listing', async () => {
    await renderCommerceFacets({interfaceType: 'product-listing'});
    expect(buildProductListing).toHaveBeenCalled();
    expect(buildSearch).not.toHaveBeenCalled();
  });

  it('should call #buildSearch when interface type is search', async () => {
    await renderCommerceFacets({interfaceType: 'search'});
    expect(buildSearch).toHaveBeenCalled();
    expect(buildProductListing).not.toHaveBeenCalled();
  });

  it('should not call console.warn when facets are valid', async () => {
    await renderCommerceFacets();
    expect(mockedLogger).not.toHaveBeenCalledWith('Unexpected facet type.');
  });

  describe('when app is not loaded', () => {
    it('should display placeholder facets', async () => {
      const {placeholders} = await renderCommerceFacets({
        isAppLoaded: false,
        collapseFacetsAfter: 3,
      });

      expect(placeholders).toHaveLength(3);
    });

    it('should display correct number of placeholders based on collapseFacetsAfter prop', async () => {
      const {placeholders} = await renderCommerceFacets({
        isAppLoaded: false,
        collapseFacetsAfter: 5,
      });

      expect(placeholders).toHaveLength(5);
    });
  });

  describe('when app is loaded', () => {
    it('should render facets instead of placeholders', async () => {
      const {
        placeholders,
        regularFacet: regularFacets,
        numericFacet: numericFacets,
        categoryFacet: categoryFacets,
        timeframeFacet: timeframeFacets,
      } = await renderCommerceFacets({isAppLoaded: true});

      expect(placeholders).toHaveLength(0);
      expect(regularFacets).toBeInTheDocument();
      expect(numericFacets).toBeInTheDocument();
      expect(categoryFacets).toBeInTheDocument();
      expect(timeframeFacets).toBeInTheDocument();
    });

    it('should not render a facet with empty values', async () => {
      mockedRegularFacet.state.values = [];
      const {regularFacet: regularFacets} = await renderCommerceFacets({
        isAppLoaded: true,
      });
      expect(regularFacets).not.toBeInTheDocument();
    });
  });

  describe('#collapseFacetsAfter', () => {
    it('should throw an error when collapseFacetsAfter is not a number', async () => {
      const mockedConsoleError = vi.spyOn(console, 'error');

      await renderCommerceFacets({
        isAppLoaded: false,
        // @ts-expect-error - testing invalid prop type
        collapseFacetsAfter: 'invalid',
      });

      expect(mockedConsoleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(
            'collapseFacetsAfter: value is not a number.'
          ),
        }),
        expect.anything()
      );
    });

    it('should collapse facets after the specified number when collapseFacetsAfter is positive', async () => {
      const {header} = await renderCommerceFacets({
        collapseFacetsAfter: 2,
        isAppLoaded: true,
      });

      await expect
        .element(header('Regular Facet'))
        .toHaveAttribute('aria-expanded', 'true');
      await expect
        .element(header('Numeric Facet'))
        .toHaveAttribute('aria-expanded', 'true');
      await expect
        .element(header('Category Facet'))
        .toHaveAttribute('aria-expanded', 'false');
      await expect
        .element(header('Date Facet'))
        .toHaveAttribute('aria-expanded', 'false');
    });

    it('should not collapse any facets when collapseFacetsAfter is -1', async () => {
      const {header} = await renderCommerceFacets({
        collapseFacetsAfter: -1,
      });

      await expect
        .element(header('Regular Facet'))
        .toHaveAttribute('aria-expanded', 'true');
      await expect
        .element(header('Numeric Facet'))
        .toHaveAttribute('aria-expanded', 'true');
      await expect
        .element(header('Category Facet'))
        .toHaveAttribute('aria-expanded', 'true');
      await expect
        .element(header('Date Facet'))
        .toHaveAttribute('aria-expanded', 'true');
    });

    it('should collapse all facets when collapseFacetsAfter is 0', async () => {
      const {header} = await renderCommerceFacets({
        collapseFacetsAfter: 0,
      });

      await expect
        .element(header('Regular Facet'))
        .toHaveAttribute('aria-expanded', 'false');
      await expect
        .element(header('Numeric Facet'))
        .toHaveAttribute('aria-expanded', 'false');
      await expect
        .element(header('Category Facet'))
        .toHaveAttribute('aria-expanded', 'false');
      await expect
        .element(header('Date Facet'))
        .toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('#initialize', () => {
    it('should build appropriate product-listing controller based on interface type', async () => {
      await renderCommerceFacets({interfaceType: 'product-listing'});
      expect(buildProductListing).toHaveBeenCalled();
    });

    it('should build appropriate search controller based on interface type', async () => {
      await renderCommerceFacets({interfaceType: 'search'});
      expect(buildSearch).toHaveBeenCalled();
    });

    it('should subscribe to facet generator state changes', async () => {
      await renderCommerceFacets();
      expect(createAppLoadedListener).toHaveBeenCalled();
    });
  });

  it('should warn when handling unknown facet types', async () => {
    const unknownFacet = {
      state: {
        facetId: 'unknown',
        field: 'unknown_field',
        type: 'unknown-type',
        values: [{value: 'test', state: 'idle', numberOfResults: 1}],
        displayName: 'Unknown Facet',
      },
    };

    mockedFacetGenerator = buildFakeFacetGenerator({
      state: ['unknown'],
      implementation: {
        // @ts-expect-error - testing unknown facet type
        facets: [unknownFacet],
      },
    });

    await renderCommerceFacets();

    expect(mockedLogger).toHaveBeenCalledWith('Unexpected facet type.');
  });

  it('should render nothing when facet generator has no facets', async () => {
    mockedFacetGenerator = buildFakeFacetGenerator({
      state: [],
      implementation: {
        facets: [],
      },
    });

    const {regularFacet, numericFacet, categoryFacet, timeframeFacet} =
      await renderCommerceFacets();

    expect(regularFacet).not.toBeInTheDocument();
    expect(numericFacet).not.toBeInTheDocument();
    expect(categoryFacet).not.toBeInTheDocument();
    expect(timeframeFacet).not.toBeInTheDocument();
  });

  describe('#shouldCollapseFacet', () => {
    it('should not collapse facets with active values even when exceeding collapseFacetsAfter', async () => {
      mockedRegularFacet = buildFakeRegularFacet({
        state: {
          displayName: 'Regular Facet',
          hasActiveValues: true,
        },
      });
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          displayName: 'Numeric Facet',
          hasActiveValues: false,
        },
      });
      mockedCategoryFacet = buildFakeCategoryFacet({
        state: {
          displayName: 'Category Facet',
          hasActiveValues: true,
        },
      });
      mockedDateFacet = buildFakeDateFacet({
        state: {
          displayName: 'Date Facet',
          hasActiveValues: false,
        },
      });

      mockedFacetGenerator = buildFakeFacetGenerator({
        state: [
          mockedRegularFacet,
          mockedNumericFacet,
          mockedCategoryFacet,
          mockedDateFacet,
        ].map((facet) => facet.state.facetId),
        implementation: {
          facets: [
            mockedRegularFacet,
            mockedNumericFacet,
            mockedCategoryFacet,
            mockedDateFacet,
          ],
        },
      });

      const {header} = await renderCommerceFacets({
        collapseFacetsAfter: 2,
        isAppLoaded: true,
      });

      // First facet has active values, should stay expanded
      await expect
        .element(header('Regular Facet'))
        .toHaveAttribute('aria-expanded', 'true');
      // Second facet has no active values, should stay expanded (within limit)
      await expect
        .element(header('Numeric Facet'))
        .toHaveAttribute('aria-expanded', 'true');
      // Third facet has active values, should stay expanded even though it exceeds the limit
      await expect
        .element(header('Category Facet'))
        .toHaveAttribute('aria-expanded', 'true');
      // Fourth facet has no active values and exceeds limit, should collapse
      await expect
        .element(header('Date Facet'))
        .toHaveAttribute('aria-expanded', 'false');
    });

    it('should keep all facets with active values expanded when collapseFacetsAfter is 0', async () => {
      mockedRegularFacet = buildFakeRegularFacet({
        state: {
          displayName: 'Regular Facet',
          hasActiveValues: true,
        },
      });
      mockedNumericFacet = buildFakeNumericFacet({
        state: {
          displayName: 'Numeric Facet',
          hasActiveValues: false,
        },
      });

      mockedFacetGenerator = buildFakeFacetGenerator({
        state: [mockedRegularFacet, mockedNumericFacet].map(
          (facet) => facet.state.facetId
        ),
        implementation: {
          facets: [mockedRegularFacet, mockedNumericFacet],
        },
      });

      const {header} = await renderCommerceFacets({
        collapseFacetsAfter: 0,
        isAppLoaded: true,
      });

      // Facet with active values should stay expanded even when collapseFacetsAfter is 0
      await expect
        .element(header('Regular Facet'))
        .toHaveAttribute('aria-expanded', 'true');
      // Facet without active values should collapse
      await expect
        .element(header('Numeric Facet'))
        .toHaveAttribute('aria-expanded', 'false');
    });
  });
});
