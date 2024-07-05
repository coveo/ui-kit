import {
  Summary,
  SearchSummaryState,
  ProductListingSummaryState,
  buildSearch,
  buildProductListing,
  Sort,
  SortState,
  FacetGenerator,
  FacetGeneratorState,
  BreadcrumbManager,
  BreadcrumbManagerState,
} from '@coveo/headless/commerce';
import {Component, State, Prop, Element, Watch, h} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {RefineModalBody} from '../../common/refine-modal/body';
import {
  RefineModalFiltersClearButton,
  RefineModalFiltersSection,
} from '../../common/refine-modal/filters';
import {RefineModal} from '../../common/refine-modal/modal';
import {RefineModalSortSection} from '../../common/refine-modal/sort';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {CommerceSortOption, getSortByLabel} from '../sort/option';

/**
 * The `atomic-commerce-refine-modal` is automatically created as a child of the `atomic-commerce-search-interface` when the `atomic-commerce-refine-toggle` is initialized.
 *
 * When the modal is opened, the class `atomic-modal-opened` is added to the interface element and the body, allowing further customization.
 *
 * @part container - The modal's outermost container.
 * @part header-wrapper - The wrapper around the header.
 * @part header - The header of the modal, containing the title.
 * @part title - The title of the modal.
 * @part close-button - The button in the header that closes the modal.
 * @part close-icon - The icon of the close button.
 * @part header-ruler - The horizontal ruler underneath the header.
 * @part body-wrapper - The wrapper around the body.
 * @part body - The body of the modal, between the header and the footer.
 * @part content - The wrapper around the content inside the body of the modal.
 * @part section-title - The title for each section.
 * @part section-sort-title - The title for the sort section.
 * @part section-filters-title - The title for the filters section.
 * @part select-wrapper - The wrapper around the select element, used to position the icon.
 * @part select - The `<select>` element of the dropdown list.
 * @part select-icon-wrapper - The wrapper around the sort icon that's used to align it.
 * @part select-icon - The select dropdown's sort icon.
 * @part filter-section - The section containing facets and the "filters" title.
 * @part filter-clear-all - The button that resets all actively selected facet values.
 * @part footer-wrapper - The wrapper with a shadow or background color around the footer.
 * @part footer - The footer of the modal.
 * @part footer-content - The wrapper around the content inside the footer of the modal, containing the button to view results.
 * @part footer-button - The button in the footer that closes the modal.
 * @part footer-button-text - The text inside the button in the footer that closes the modal.
 * @part footer-button-count - The count inside the button in the footer that closes the modal.
 *
 * @alpha
 */
@Component({
  tag: 'atomic-commerce-refine-modal',
  styleUrl: 'atomic-commerce-refine-modal.pcss',
  shadow: true,
})
export class AtomicCommerceRefineModal
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  @Element() public host!: HTMLElement;
  @State() public error!: Error;
  @Prop({mutable: true}) openButton?: HTMLElement;
  @Prop({reflect: true, mutable: true}) isOpen = false;

  public summary!: Summary;
  @BindStateToController('summary')
  @State()
  public summaryState!: SearchSummaryState | ProductListingSummaryState;

  public sort!: Sort;
  @BindStateToController('sort')
  @State()
  public sortState!: SortState;

  public facetGenerator!: FacetGenerator;
  @BindStateToController('facetGenerator')
  @State()
  public facetGeneratorState!: FacetGeneratorState;

  public breadcrumbManager!: BreadcrumbManager;
  @BindStateToController('breadcrumbManager')
  @State()
  public breadcrumbManagerState!: BreadcrumbManagerState;

  /**
   * The number of expanded facets inside the refine modal.
   * Remaining facets are automatically collapsed.
   *
   * Using the value `0` collapses all facets.
   */
  @Prop({reflect: true}) public collapseFacetsAfter = 0;

  @Watch('isOpen')
  watchEnabled(isOpen: boolean) {
    if (isOpen) {
      if (this.host.querySelector('div[slot="facets"]')) {
        return;
      }

      this.host.append(this.createFacetSlot());
    }
  }

  public initialize() {
    const searchOrListing =
      this.bindings.interfaceElement.type === 'search'
        ? buildSearch(this.bindings.engine)
        : buildProductListing(this.bindings.engine);
    this.summary = searchOrListing.summary();
    this.sort = searchOrListing.sort();
    this.facetGenerator = searchOrListing.facetGenerator();
    this.breadcrumbManager = searchOrListing.breadcrumbManager();
    this.watchEnabled(this.isOpen);
  }

  private createFacetSlot(): HTMLDivElement {
    const divSlot = document.createElement('div');
    divSlot.setAttribute('slot', 'facets');

    const facets = document.createElement('atomic-commerce-facets');
    facets.style.display = 'flex';
    facets.style.flexDirection = 'column';
    facets.style.gap = 'var(--atomic-refine-modal-facet-margin, 20px)';
    facets.collapseFacetsAfter = this.collapseFacetsAfter;
    divSlot.append(facets);
    return divSlot;
  }

  private onSelectSortOption(e: Event) {
    const select = e.composedPath()[0] as HTMLSelectElement;
    this.sort.sortBy(
      getSortByLabel(select.value, this.sortState.availableSorts)
    );
  }

  private renderSort() {
    return (
      <RefineModalSortSection
        i18n={this.bindings.i18n}
        onSelect={(option) => this.onSelectSortOption(option)}
      >
        {this.sortState.availableSorts.map((sort) => (
          <CommerceSortOption
            i18n={this.bindings.i18n}
            selected={this.sort.isSortedBy(sort)}
            sort={sort}
          />
        ))}
      </RefineModalSortSection>
    );
  }

  private renderFilters() {
    if (this.facetGeneratorState.length === 0) {
      return;
    }

    const {i18n} = this.bindings;

    return (
      <RefineModalFiltersSection
        i18n={i18n}
        withFacets={true}
        withAutomaticFacets={false}
      >
        {this.breadcrumbManagerState.hasBreadcrumbs && (
          <RefineModalFiltersClearButton
            i18n={i18n}
            onClick={() => this.breadcrumbManager.deselectAll()}
          />
        )}
      </RefineModalFiltersSection>
    );
  }

  public render() {
    return (
      <RefineModal
        i18n={this.bindings.i18n}
        host={this.host}
        isOpen={this.isOpen}
        onClose={() => (this.isOpen = false)}
        title={this.bindings.i18n.t('sort-and-filter')}
        numberOfItems={this.summaryState.totalNumberOfProducts}
        openButton={this.openButton}
      >
        <RefineModalBody>
          {this.renderSort()}
          {this.renderFilters()}
        </RefineModalBody>
      </RefineModal>
    );
  }

  public componentDidLoad() {
    this.host.style.display = '';
  }
}
