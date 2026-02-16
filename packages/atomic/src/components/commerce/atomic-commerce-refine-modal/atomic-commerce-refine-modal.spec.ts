import {
  type BreadcrumbManager,
  buildProductListing,
  buildSearch,
  type FacetGenerator,
  type FacetGeneratorState,
  type ProductListingSummaryState,
  type SearchSummaryState,
  type Sort,
  SortBy,
  type SortState,
  type Summary,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/breadcrumb-manager-subcontroller';
import {buildFakeFacetGenerator} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/facet-generator-subcontroller';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {buildFakeSort} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/sort-subcontroller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import type {AtomicCommerceRefineModal} from './atomic-commerce-refine-modal';
import './atomic-commerce-refine-modal';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-refine-modal', () => {
  let mockedQuerySummary: Summary<
    SearchSummaryState | ProductListingSummaryState
  >;
  let mockedSort: Sort;
  let mockedFacetGenerator: FacetGenerator;
  let mockedBreadcrumbManager: BreadcrumbManager;

  const parts = (element: AtomicCommerceRefineModal) => {
    const qs = (part: string) =>
      element.shadowRoot?.querySelector(`[part="${part}"]`);
    const qsStar = (part: string) =>
      element.shadowRoot?.querySelector(`[part*="${part}"]`);
    return {
      title: qs('title'),
      closeButton: qs('close-button'),
      closeIcon: qs('close-icon'),
      footerContent: qs('footer-content'),
      footerButton: qs('footer-button'),
      footerButtonText: qs('footer-button-text'),
      footerButtonCount: qs('footer-button-count'),
      content: qs('content'),
      select: qs('select'),
      sortTitle: qsStar('section-sort-title'),
      selectWrapper: qs('select-wrapper'),
      selectIconWrapper: qs('select-icon-wrapper'),
      selectIcon: qs('select-icon'),
      filterSection: qs('filter-section'),
      sectionFiltersTitle: qsStar('section-filters-title'),
      filterClearAll: qs('filter-clear-all'),
      sectionTitle: qsStar('section-title'),
    };
  };

  const renderRefineModal = async (
    options: {
      isOpen?: boolean;
      interfaceType?: 'search' | 'product-listing';
      sortState?: SortState;
      collapseFacetsAfter?: number;
      facetGeneratorState?: FacetGeneratorState;
    } = {}
  ) => {
    const {
      isOpen = true,
      interfaceType = 'product-listing',
      sortState,
      collapseFacetsAfter,
      facetGeneratorState,
    } = options;
    mockedQuerySummary = buildFakeSummary();
    mockedSort = buildFakeSort({state: sortState});
    mockedFacetGenerator = buildFakeFacetGenerator({
      state: facetGeneratorState,
    });
    mockedBreadcrumbManager = buildFakeBreadcrumbManager();

    vi.mocked(buildProductListing).mockReturnValue(
      buildFakeProductListing({
        implementation: {
          summary: () => mockedQuerySummary,
          sort: () => mockedSort,
          facetGenerator: () => mockedFacetGenerator,
          breadcrumbManager: () => mockedBreadcrumbManager,
        },
      })
    );

    vi.mocked(buildSearch).mockReturnValue(
      buildFakeSearch({
        implementation: {
          summary: () => mockedQuerySummary as Summary<SearchSummaryState>,
          sort: () => mockedSort,
          facetGenerator: () => mockedFacetGenerator,
          breadcrumbManager: () => mockedBreadcrumbManager,
        },
      })
    );
    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceRefineModal>({
        template: html`<atomic-commerce-refine-modal
          ?is-open=${isOpen}
          collapse-facets-after=${ifDefined(collapseFacetsAfter)}
        ></atomic-commerce-refine-modal>`,
        selector: 'atomic-commerce-refine-modal',
        bindings: (bindings) => {
          bindings.interfaceElement.type = interfaceType;
          return bindings;
        },
      });

    return {
      element,
      title: element.shadowRoot?.querySelector('[part="title"]'),
      closeButton: element.shadowRoot?.querySelector('[part="close-button"]'),
      closeIcon: element.shadowRoot?.querySelector('[part="close-icon"]'),
      footerContent: element.shadowRoot?.querySelector(
        '[part="footer-content"]'
      ),
      footerButton: element.shadowRoot?.querySelector('[part="footer-button"]'),
      footerButtonText: element.shadowRoot?.querySelector(
        '[part="footer-button-text"]'
      ),
      footerButtonCount: element.shadowRoot?.querySelector(
        '[part="footer-button-count"]'
      ),
      atomicModal: element.shadowRoot?.querySelector('atomic-modal'),
      aside: element.shadowRoot?.querySelector('aside[part="content"]'),
      sortTitle: element.shadowRoot?.querySelector(
        '[part*="section-sort-title"]'
      ),
      selectWrapper: element.shadowRoot?.querySelector(
        '[part="select-wrapper"]'
      ),
      select: element.shadowRoot?.querySelector('select[part="select"]'),
      selectIconWrapper: element.shadowRoot?.querySelector(
        '[part="select-icon-wrapper"]'
      ),
      selectIcon: element.shadowRoot?.querySelector('[part="select-icon"]'),
      filterSection: element.shadowRoot?.querySelector(
        '[part="filter-section"]'
      ),
      sectionFiltersTitle: element.shadowRoot?.querySelector(
        '[part*="section-filters-title"]'
      ),
      facetSlot: element.shadowRoot?.querySelector('slot[name="facets"]'),
      filterClearAllButton: element.shadowRoot?.querySelector(
        '[part="filter-clear-all"]'
      ),
    };
  };

  it('should call buildSearch when the interface type is search', async () => {
    await renderRefineModal({
      interfaceType: 'search',
    });

    expect(buildSearch).toHaveBeenCalled();
    expect(buildProductListing).not.toHaveBeenCalled();
  });

  it('should call buildProductListing when the interface type is product-listing', async () => {
    await renderRefineModal({
      interfaceType: 'product-listing',
    });

    expect(buildProductListing).toHaveBeenCalled();
    expect(buildSearch).not.toHaveBeenCalled();
  });

  it("should set this.summary the search or listing controller's summary", async () => {
    const {element} = await renderRefineModal({
      interfaceType: 'search',
    });

    expect(element.summary).toBe(mockedQuerySummary);
  });

  it("should set this.sort the search or listing controller's sort", async () => {
    const {element} = await renderRefineModal({
      interfaceType: 'search',
    });

    expect(element.sort).toBe(mockedSort);
  });

  it("should set this.facetGenerator the search or listing controller's facet generator", async () => {
    const {element} = await renderRefineModal({
      interfaceType: 'search',
    });

    expect(element.facetGenerator).toBe(mockedFacetGenerator);
  });

  it("should set this.breadcrumbManager the search or listing controller's breadcrumb manager", async () => {
    const {element} = await renderRefineModal({
      interfaceType: 'search',
    });

    expect(element.breadcrumbManager).toBe(mockedBreadcrumbManager);
  });

  it('should append a facet slot when isOpen is true', async () => {
    const {element} = await renderRefineModal({
      isOpen: true,
    });

    const slot = element.querySelector('div[slot="facets"]');
    expect(slot).not.toBeNull();
    expect(slot?.querySelector('atomic-commerce-facets')).not.toBeNull();
  });

  it('should not append a second facet slot when isOpen changes again', async () => {
    const {element} = await renderRefineModal({
      isOpen: true,
    });

    const initialSlot = element.querySelector('div[slot="facets"]');
    expect(initialSlot).not.toBeNull();
    element.isOpen = false;
    element.isOpen = true;
    const newSlot = element.querySelector('div[slot="facets"]');
    expect(newSlot).toBe(initialSlot);
  });

  it('should render the title with the correct text', async () => {
    const {title} = await renderRefineModal();

    expect(title).toHaveTextContent('Sort & Filter');
  });

  it('should render the title with the correct part attribute', async () => {
    const {title} = await renderRefineModal();

    expect(title).toHaveAttribute('part', 'title');
  });

  it('should render the close button with the correct part attribute', async () => {
    const {closeButton} = await renderRefineModal();

    expect(closeButton).toHaveAttribute('part', 'close-button');
  });

  it('should render the close button with the correct aria-label', async () => {
    const {closeButton} = await renderRefineModal();

    expect(closeButton).toHaveAttribute('aria-label', 'Close');
  });

  it('should make isOpen false when the close button is clicked', async () => {
    const {element, closeButton} = await renderRefineModal();

    await userEvent.click(closeButton!);

    expect(element.isOpen).toBe(false);
  });

  it('should render the close icon with the correct part attribute', async () => {
    const {closeIcon} = await renderRefineModal();

    expect(closeIcon).toHaveAttribute('part', 'close-icon');
  });

  it('should render the footer content with the correct part attribute', async () => {
    const {footerContent} = await renderRefineModal();

    expect(footerContent).toHaveAttribute('part', 'footer-content');
  });

  it('should render the footer content with the correct slot attribute', async () => {
    const {footerContent} = await renderRefineModal();

    expect(footerContent).toHaveAttribute('slot', 'footer');
  });

  it('should render the footer button with the correct part attribute', async () => {
    const {footerButton} = await renderRefineModal();

    expect(footerButton).toHaveAttribute('part', 'footer-button');
  });

  it('should render the footer button with the correct text', async () => {
    const {footerButton} = await renderRefineModal();

    expect(footerButton).toHaveTextContent('View products (100)');
  });

  it('should render the footer button text with the correct part attribute', async () => {
    const {footerButtonText} = await renderRefineModal();

    expect(footerButtonText).toHaveAttribute('part', 'footer-button-text');
  });

  it('should render the footer button text with the correct text', async () => {
    const {footerButtonText} = await renderRefineModal();

    expect(footerButtonText).toHaveTextContent('View products');
  });

  it('should make isOpen false when the footer button is clicked', async () => {
    const {element, footerButton} = await renderRefineModal();

    await userEvent.click(footerButton!);

    expect(element.isOpen).toBe(false);
  });

  it('should render the footer button count with the correct part attribute', async () => {
    const {footerButtonCount} = await renderRefineModal();

    expect(footerButtonCount).toHaveAttribute('part', 'footer-button-count');
  });

  it('should render the footer button count with the correct text', async () => {
    const {footerButtonCount} = await renderRefineModal();

    expect(footerButtonCount).toHaveTextContent('(100)');
  });

  it('should render the atomic-modal element with the correct properties and attributes', async () => {
    const {atomicModal} = await renderRefineModal();

    expect(atomicModal).toHaveProperty('fullscreen', true);
    expect(atomicModal).toHaveProperty('isOpen', true);
    expect(atomicModal).toHaveProperty('source', undefined);
    expect(atomicModal).toHaveProperty('container', expect.any(HTMLElement));
    expect(atomicModal).toHaveProperty('boundary', 'page');
    expect(atomicModal).toHaveAttribute(
      'exportparts',
      'backdrop,container,header-wrapper,header,header-ruler,body-wrapper,body,footer-wrapper,footer'
    );
    expect(atomicModal).toHaveProperty(
      'onAnimationEnded',
      expect.any(Function)
    );
  });

  it('should render the aside element with the correct part attribute', async () => {
    const {aside} = await renderRefineModal();

    expect(aside).toHaveAttribute('part', 'content');
  });

  it('should render the aside element with the correct slot attribute', async () => {
    const {aside} = await renderRefineModal();

    expect(aside).toHaveAttribute('slot', 'body');
  });

  it('should render the sort title with the correct part attribute', async () => {
    const {sortTitle} = await renderRefineModal();

    expect(sortTitle).toHaveAttribute(
      'part',
      'section-title section-sort-title'
    );
  });

  it('should render the sort title with the correct text', async () => {
    const {sortTitle} = await renderRefineModal();

    expect(sortTitle).toHaveTextContent('Sort');
  });

  it('should render the select wrapper with the correct part attribute', async () => {
    const {selectWrapper} = await renderRefineModal();

    expect(selectWrapper).toHaveAttribute('part', 'select-wrapper');
  });

  it('should render the select element with the correct part attribute', async () => {
    const {select} = await renderRefineModal();

    expect(select).toHaveAttribute('part', 'select');
  });

  it('should render the select element with the correct aria-label', async () => {
    const {select} = await renderRefineModal();

    expect(select).toHaveAttribute('aria-label', 'Sort by');
  });

  it('should trigger the sort.sortBy method when the select element changes', async () => {
    const {select} = await renderRefineModal({
      sortState: {
        availableSorts: [
          {by: SortBy.Relevance},
          {by: SortBy.Fields, fields: [{name: 'Price (Low to High)'}]},
          {by: SortBy.Fields, fields: [{name: 'Price (High to Low)'}]},
        ],
        appliedSort: {
          by: SortBy.Relevance,
        },
      },
    });

    await userEvent.selectOptions(select!, 'Price (Low to High)');

    expect(mockedSort.sortBy).toHaveBeenCalledWith({
      by: SortBy.Fields,
      fields: [{name: 'Price (Low to High)'}],
    });
  });

  it('should render the select icon wrapper with the correct part attribute', async () => {
    const {selectIconWrapper} = await renderRefineModal();

    expect(selectIconWrapper).toHaveAttribute('part', 'select-icon-wrapper');
  });

  it('should render the select icon with the correct part attribute', async () => {
    const {selectIcon} = await renderRefineModal();

    expect(selectIcon).toHaveAttribute('part', 'select-icon');
  });

  it('should render a sort option for every available sort', async () => {
    const {select} = await renderRefineModal({
      sortState: {
        availableSorts: [
          {by: SortBy.Relevance},
          {by: SortBy.Fields, fields: [{name: 'Price (Low to High)'}]},
          {by: SortBy.Fields, fields: [{name: 'Price (High to Low)'}]},
        ],
        appliedSort: {
          by: SortBy.Relevance,
        },
      },
    });

    const options = select!.querySelectorAll('option');

    expect(options[0]).toHaveTextContent('Relevance');
    expect(options[1]).toHaveTextContent('Price (Low to High)');
    expect(options[2]).toHaveTextContent('Price (High to Low)');
  });

  it('should render each sort option with the correct value', async () => {
    const {select} = await renderRefineModal({
      sortState: {
        availableSorts: [
          {by: SortBy.Relevance},
          {by: SortBy.Fields, fields: [{name: 'Price (Low to High)'}]},
          {by: SortBy.Fields, fields: [{name: 'Price (High to Low)'}]},
        ],
        appliedSort: {
          by: SortBy.Relevance,
        },
      },
    });
    const options = select!.querySelectorAll('option');

    expect(options[0]).toHaveValue('relevance');
    expect(options[1].value).toBe('Price (Low to High)');
    expect(options[2].value).toBe('Price (High to Low)');
  });

  it('should trigger the isSortedBy method when a sort option is selected', async () => {
    const {select} = await renderRefineModal({
      sortState: {
        availableSorts: [
          {by: SortBy.Relevance},
          {by: SortBy.Fields, fields: [{name: 'Price (Low to High)'}]},
          {by: SortBy.Fields, fields: [{name: 'Price (High to Low)'}]},
        ],
        appliedSort: {
          by: SortBy.Relevance,
        },
      },
    });

    const option = select!.querySelector('option[value="Price (Low to High)"]');
    await userEvent.selectOptions(select!, option?.textContent || '');

    expect(mockedSort.isSortedBy).toHaveBeenCalledWith({
      by: SortBy.Fields,
      fields: [{name: 'Price (Low to High)'}],
    });
  });

  it('should render the filters section with the correct part attribute', async () => {
    const {filterSection} = await renderRefineModal();

    expect(filterSection).toHaveAttribute('part', 'filter-section');
  });

  it('should render the filters section title with the correct part attribute', async () => {
    const {sectionFiltersTitle} = await renderRefineModal();

    expect(sectionFiltersTitle).toHaveAttribute(
      'part',
      'section-title section-filters-title'
    );
  });

  it('should render the filters section title with the correct text', async () => {
    const {sectionFiltersTitle} = await renderRefineModal();

    expect(sectionFiltersTitle).toHaveTextContent('Filters');
  });

  it('should render the facet slot', async () => {
    const {facetSlot} = await renderRefineModal();

    expect(facetSlot).toBeInTheDocument();
  });

  it('should reflect the collapseFacesAfter property on the facets element', async () => {
    const {element} = await renderRefineModal({
      collapseFacetsAfter: 2,
    });

    const slot = element.querySelector('div[slot="facets"]');
    expect(slot?.querySelector('atomic-commerce-facets')).toHaveProperty(
      'collapseFacetsAfter',
      2
    );
  });

  it('should not render the filter section when facetGeneratorState.length is 0', async () => {
    const {filterSection} = await renderRefineModal({
      facetGeneratorState: [],
    });

    expect(filterSection).not.toBeInTheDocument();
  });

  it('should render the filter clear all button with the correct part attribute', async () => {
    const {filterClearAllButton} = await renderRefineModal();

    expect(filterClearAllButton).toHaveAttribute('part', 'filter-clear-all');
  });

  it('should render the filter clear all button with the correct text', async () => {
    const {filterClearAllButton} = await renderRefineModal();

    expect(filterClearAllButton).toHaveTextContent('Clear');
  });

  it('should trigger the breadcrumbManager.deselectAll method when the filter clear all button is clicked', async () => {
    const {filterClearAllButton} = await renderRefineModal();

    await userEvent.click(filterClearAllButton!);

    expect(mockedBreadcrumbManager.deselectAll).toHaveBeenCalled();
  });

  it('should render every part', async () => {
    const {element} = await renderRefineModal();

    Object.entries(parts(element)).forEach(([_key, el]) => {
      expect(el).toBeInTheDocument();
    });
  });
});
