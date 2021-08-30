import {Component, h, State, Prop, Element, Watch} from '@stencil/core';
import {
  BreadcrumbManager,
  buildBreadcrumbManager,
  BreadcrumbManagerState,
  buildQuerySummary,
  QuerySummary,
  QuerySummaryState,
  FacetManager,
  FacetManagerState,
  buildFacetManager,
  Sort,
  buildSort,
  SortState,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';
import {getFacetElements, SortDropdownOption} from '../../utils/store';
import SortIcon from '../../images/sort.svg';
import {Button} from '../common/button';

/**
 * The `atomic-refine-modal` is automatically created as a child of the `atomic-search-interface` when the `atomic-refine-toggle` is initialized.
 *
 * When the modal is opened, the class `atomic-modal-open` is added to the body, allowing further customization.
 *
 * @part container - The container of the modal's content.
 * @part header - The header of the modal, containing the title.
 * @part close-button - The button in the header that closes the modal.
 * @part section-title - The title for each section.
 * @part select - The `<select>` element of the drop-down list.
 * @part filter-clear-all - The button that resets all actively selected facet values.
 * @part footer-button - The button in the footer that closes the modal.
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
  private facetManager!: FacetManager;
  @InitializeBindings() public bindings!: Bindings;
  @Element() public host!: HTMLElement;

  @BindStateToController('querySummary')
  @State()
  private querySummaryState!: QuerySummaryState;
  @BindStateToController('breadcrumbManager')
  @State()
  private breadcrumbManagerState!: BreadcrumbManagerState;
  @BindStateToController('facetManager')
  @State()
  public facetManagerState!: FacetManagerState;
  @State() @BindStateToController('sort') public sortState!: SortState;
  @State() public error!: Error;

  @Prop({reflect: true, mutable: true}) enabled!: boolean;
  @Watch('enabled')
  watchEnabled(enabled: boolean) {
    const modalOpenedClass = 'atomic-modal-opened';

    if (enabled) {
      document.body.classList.add(modalOpenedClass);
      this.duplicateFacetElements();
      return;
    }

    document.body.classList.remove(modalOpenedClass);
    this.flushFacetElements();
  }

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
    this.querySummary = buildQuerySummary(this.bindings.engine);
    this.facetManager = buildFacetManager(this.bindings.engine);
    this.sort = buildSort(this.bindings.engine);
  }

  private duplicateFacetElements() {
    const divSlot = document.createElement('div');
    divSlot.setAttribute('slot', 'facets');

    const facetElementsPayload = getFacetElements(this.bindings.store).map(
      (f) => ({facetId: f.getAttribute('facet-id')!, payload: f})
    );
    const sortedFacetsElements = this.facetManager
      .sort(facetElementsPayload)
      .map((f) => f.payload);

    sortedFacetsElements.forEach((facetElement) => {
      const clone = facetElement.cloneNode(false) as HTMLElement;
      clone.style.marginBottom =
        'var(--atomic-refine-modal-facet-margin, 20px)';
      clone.setAttribute('is-collapsed', 'true');
      divSlot.append(clone);
    });

    this.host.append(divSlot);
  }

  private flushFacetElements() {
    this.host.querySelector('div[slot="facets"]')?.remove();
  }

  private renderHeader() {
    return (
      <div
        part="header"
        class="w-full border-neutral border-b flex justify-between text-xl"
      >
        <span class="truncate p-6">
          {this.bindings.i18n.t('sort-and-filter')}
        </span>
        <Button
          style="text-transparent"
          class="p-6 grid place-items-center"
          part="close-button"
          onClick={() => (this.enabled = false)}
        >
          <atomic-icon class="w-5 h-5" icon={CloseIcon}></atomic-icon>
        </Button>
      </div>
    );
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

  private buildOption({expression, criteria, caption}: SortDropdownOption) {
    return (
      <option value={expression} selected={this.sort.isSortedBy(criteria)}>
        {this.bindings.i18n.t(caption)}
      </option>
    );
  }

  private renderSort() {
    if (!this.options.length) {
      return;
    }

    return [
      <div part="section-title" class="text-2xl font-bold truncate mb-3 mt-8">
        {this.bindings.i18n.t('sort')}
      </div>,
      <div class="relative">
        <select
          class="btn-outline-neutral w-full cursor-pointer text-lg font-bold flex-grow appearance-none rounded-lg px-6 py-5"
          part="select"
          aria-label={this.bindings.i18n.t('sort-by')}
          onChange={(option) => this.select(option)}
        >
          {this.options.map((option) => this.buildOption(option))}
        </select>
        <div class="absolute pointer-events-none top-0 bottom-0 right-0 flex justify-center items-center pr-6">
          <atomic-icon icon={SortIcon}></atomic-icon>
        </div>
      </div>,
    ];
  }

  private renderFilters() {
    if (!getFacetElements(this.bindings.store).length) {
      return;
    }

    return [
      <div class="w-full flex justify-between mt-8 mb-3">
        <span part="section-title" class="text-2xl font-bold truncate">
          {this.bindings.i18n.t('filters')}
        </span>
        {this.breadcrumbManagerState.hasBreadcrumbs && (
          <Button
            onClick={() => this.breadcrumbManager.deselectAll()}
            style="text-primary"
            text={this.bindings.i18n.t('clear')}
            class="px-2 py-1"
            part="filter-clear-all"
          ></Button>
        )}
      </div>,
      <slot name="facets"></slot>,
    ];
  }

  private renderFooter() {
    return (
      <div class="px-6 py-4 w-full border-neutral border-t bg-background z-10 shadow-lg">
        <Button
          style="primary"
          part="footer-button"
          class="p-3 w-full flex text-lg justify-center"
          onClick={() => (this.enabled = false)}
        >
          <span class="truncate mr-1">
            {this.bindings.i18n.t('view-results')}
          </span>
          <span class="with-parentheses">
            {this.querySummaryState.total.toLocaleString(
              this.bindings.i18n.language
            )}
          </span>
        </Button>
      </div>
    );
  }

  public render() {
    if (!this.enabled) {
      return;
    }

    return (
      <div
        part="container"
        class="w-screen h-screen fixed flex flex-col justify-between bg-background text-on-background left-0 top-0 z-10"
      >
        {this.renderHeader()}
        <div class="overflow-auto px-6 flex-grow">
          {this.renderSort()}
          {this.renderFilters()}
        </div>
        {this.renderFooter()}
      </div>
    );
  }
}
