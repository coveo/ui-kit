import {
  BreadcrumbManager,
  buildBreadcrumbManager,
  BreadcrumbManagerState,
  QuerySummary,
  QuerySummaryState,
  FacetManagerState,
  Sort,
  buildSort,
  SortState,
  buildQuerySummary,
  buildSearchStatus,
  SearchStatus,
  FacetManager,
  buildFacetManager,
} from '@coveo/headless';
import {
  Component,
  h,
  State,
  Prop,
  Element,
  Watch,
  Fragment,
} from '@stencil/core';
import SortIcon from '../../../images/sort.svg';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {sortByDocumentPosition} from '../../../utils/utils';
import {findSection} from '../../common/atomic-layout-section/sections';
import {Button} from '../../common/button';
import {
  BaseFacetElement,
  sortFacetVisibility,
  triageFacetsByParents,
  collapseFacetsAfter,
} from '../../common/facets/facet-common';
import {isRefineModalFacet} from '../../common/interface/store';
import {RefineModalCommon} from '../../common/refine-modal/refine-modal-common';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';
import {SortDropdownOption} from '../atomic-search-interface/store';
import {popoverClass} from '../facets/atomic-popover/popover-type';

/**
 * The `atomic-refine-modal` is automatically created as a child of the `atomic-search-interface` when the `atomic-refine-toggle` is initialized.
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
 */
@Component({
  tag: 'atomic-refine-modal',
  styleUrl: 'atomic-refine-modal.pcss',
  shadow: true,
})
export class AtomicRefineModal implements InitializableComponent {
  private sort!: Sort;
  private breadcrumbManager!: BreadcrumbManager;
  public querySummary!: QuerySummary;
  public searchStatus!: SearchStatus;
  public facetManager!: FacetManager;
  @InitializeBindings() public bindings!: Bindings;
  @Element() public host!: HTMLElement;

  @BindStateToController('querySummary')
  @State()
  public querySummaryState!: QuerySummaryState;
  @BindStateToController('breadcrumbManager')
  @State()
  private breadcrumbManagerState!: BreadcrumbManagerState;
  @BindStateToController('facetManager')
  @State()
  public facetManagerState!: FacetManagerState;
  @State() @BindStateToController('sort') public sortState!: SortState;
  @State() public error!: Error;

  @Prop({mutable: true}) openButton?: HTMLElement;

  @Prop({reflect: true, mutable: true}) isOpen = false;

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
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
    this.sort = buildSort(this.bindings.engine);
    this.querySummary = buildQuerySummary(this.bindings.engine);
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.facetManager = buildFacetManager(this.bindings.engine);
    this.watchEnabled(this.isOpen);
  }

  private createFacetSlot(): HTMLDivElement {
    const divSlot = document.createElement('div');
    divSlot.setAttribute('slot', 'facets');
    this.addFacetColumnStyling(divSlot);

    const facets = this.bindings.store.getFacetElements() as BaseFacetElement[];
    const atomicSearchInterface = this.host.closest('atomic-search-interface')!;
    const facetsSection = findSection(atomicSearchInterface, 'facets');
    const horizontalFacetsSection = findSection(
      atomicSearchInterface,
      'horizontal-facets'
    );
    const triagedFacets = triageFacetsByParents(
      facets,
      horizontalFacetsSection,
      facetsSection
    );
    const [horizontalFacetsSectionFacets, facetsSectionFacets, orphanedFacets] =
      triagedFacets.map((facetsArray) =>
        facetsArray.sort(sortByDocumentPosition)
      );
    const sortedFacets = [
      ...facetsSectionFacets,
      ...horizontalFacetsSectionFacets,
      ...orphanedFacets,
    ];

    const {visibleFacets, invisibleFacets} = sortFacetVisibility(
      sortedFacets,
      this.bindings.store.getAllFacets()
    );

    const visibleFacetsClone = this.cloneFacets(visibleFacets);
    const invisibleFacetsClone = this.cloneFacets(invisibleFacets);

    collapseFacetsAfter(visibleFacetsClone, this.collapseFacetsAfter);

    divSlot.append(...visibleFacetsClone);
    divSlot.append(...invisibleFacetsClone);

    const generator = this.makeAutomaticFacetGenerator();
    if (generator) {
      generator.updateCollapseFacetsDependingOnFacetsVisibility(
        this.collapseFacetsAfter,
        visibleFacets.length
      );
      divSlot.append(generator);
    }

    return divSlot;
  }

  private cloneFacets(facets: BaseFacetElement[]): BaseFacetElement[] {
    return facets.map((facet, i) => {
      facet.classList.remove(popoverClass);
      facet.setAttribute(isRefineModalFacet, '');
      const clone = facet.cloneNode(true) as BaseFacetElement;
      clone.isCollapsed =
        this.collapseFacetsAfter === -1
          ? false
          : i + 1 > this.collapseFacetsAfter;
      return clone;
    });
  }

  private makeAutomaticFacetGenerator() {
    if (!this.bindings.engine.state.automaticFacetSet?.desiredCount) {
      return;
    }
    const generator = document.createElement(
      'atomic-automatic-facet-generator'
    );

    generator.setAttribute(
      'desired-count',
      `${this.bindings.engine.state.automaticFacetSet?.desiredCount}`
    );
    this.addFacetColumnStyling(generator);

    return generator;
  }

  private addFacetColumnStyling(el: HTMLElement) {
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.gap = 'var(--atomic-refine-modal-facet-margin, 20px)';
  }

  private get options() {
    return this.bindings.store.state.sortOptions;
  }

  private select(e: Event) {
    const select = e.composedPath()[0] as HTMLSelectElement;
    const option = this.options.find(
      (option) => option.expression === select.value
    );
    option && this.sort.sortBy(option.criteria);
  }

  private buildOption({expression, criteria, label}: SortDropdownOption) {
    return (
      <option value={expression} selected={this.sort.isSortedBy(criteria)}>
        {this.bindings.i18n.t(label)}
      </option>
    );
  }

  private renderSort() {
    if (!this.options.length) {
      return;
    }

    return (
      <Fragment>
        <h1
          part="section-title section-sort-title"
          class="text-2xl font-bold truncate mb-3"
        >
          {this.bindings.i18n.t('sort')}
        </h1>
        <div part="select-wrapper" class="relative">
          <select
            class="btn-outline-neutral w-full cursor-pointer text-lg font-bold grow appearance-none rounded-lg px-6 py-5"
            part="select"
            aria-label={this.bindings.i18n.t('sort-by')}
            onChange={(option) => this.select(option)}
          >
            {this.options.map((option) => this.buildOption(option))}
          </select>
          <div
            part="select-icon-wrapper"
            class="absolute pointer-events-none top-0 bottom-0 right-0 flex justify-center items-center pr-6"
          >
            <atomic-icon
              part="select-icon"
              icon={SortIcon}
              class="w-6 h-6"
            ></atomic-icon>
          </div>
        </div>
      </Fragment>
    );
  }

  private renderFilters() {
    const hasFacetElements = this.bindings.store.getFacetElements().length > 0;
    const hasAutomaticFacets =
      this.bindings.engine.state.automaticFacetSet?.set !== undefined;

    if (!hasFacetElements && !hasAutomaticFacets) {
      return;
    }

    return (
      <Fragment>
        <div
          part="filter-section"
          class="w-full flex justify-between mt-8 mb-3"
        >
          <h1
            part="section-title section-filters-title"
            class="text-2xl font-bold truncate"
          >
            {this.bindings.i18n.t('filters')}
          </h1>
          {this.breadcrumbManagerState.hasBreadcrumbs && (
            <Button
              onClick={() => this.breadcrumbManager.deselectAll()}
              style="text-primary"
              text={this.bindings.i18n.t('clear')}
              class="px-2 py-1"
              part="filter-clear-all"
            ></Button>
          )}
        </div>
        <slot name="facets"></slot>
        <slot name="automatic-facets"></slot>
      </Fragment>
    );
  }

  private renderBody() {
    return (
      <aside
        part="content"
        slot="body"
        class="flex flex-col w-full adjust-for-scroll-bar"
      >
        {this.renderSort()}
        {this.renderFilters()}
      </aside>
    );
  }

  public render() {
    return (
      <RefineModalCommon
        bindings={this.bindings}
        host={this.host}
        isOpen={this.isOpen}
        onClose={() => (this.isOpen = false)}
        title={this.bindings.i18n.t('sort-and-filter')}
        querySummaryState={this.querySummaryState}
        openButton={this.openButton}
      >
        {this.renderBody()}
      </RefineModalCommon>
    );
  }

  public componentDidLoad() {
    this.host.style.display = '';
  }
}
