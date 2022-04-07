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
 * @part container - The modal's outermost container with the outline and background.
 * @part header - The header of the modal, containing the title.
 * @part section-title - The title for each section.
 * @part close-button - The button in the header that closes the modal.
 * @part header-ruler - The horizontal ruler underneath the header.
 * @part body - The body of the modal, between the header and the footer.
 * @part select - The `<select>` element of the drop-down list.
 * @part filter-clear-all - The button that resets all actively selected facet values.
 * @part footer - The footer of the modal, containing the clear all button.
 * @part footer-button - The button in the footer that closes the modal.
 * @part footer-wrapper - The wrapper with a shadow around the footer.
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

  @Prop({mutable: true}) openButton?: HTMLElement;

  @Prop({reflect: true, mutable: true}) isOpen = false;
  @Watch('isOpen')
  watchEnabled(isOpen: boolean) {
    if (isOpen) {
      this.duplicateFacetElements();
    }
  }

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
    this.querySummary = buildQuerySummary(this.bindings.engine);
    this.facetManager = buildFacetManager(this.bindings.engine);
    this.sort = buildSort(this.bindings.engine);
  }

  private duplicateFacetElements() {
    if (this.host.querySelector('div[slot="facets"]')) {
      return;
    }

    const divSlot = document.createElement('div');
    divSlot.setAttribute('slot', 'facets');

    const facetElementsPayload = getFacetElements(this.bindings.store).map(
      (f) => ({facetId: f.getAttribute('facet-id')!, payload: f})
    );
    const sortedFacetsElements = this.facetManager
      .sort(facetElementsPayload)
      .map((f) => f.payload);

    sortedFacetsElements.forEach((facetElement) => {
      const clone = facetElement.cloneNode(true) as HTMLElement;
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

  private onAnimationEnded() {
    if (!this.isOpen) {
      this.flushFacetElements();
    }
  }

  private renderTitle() {
    return <h1 class="truncate">{this.bindings.i18n.t('sort-and-filter')}</h1>;
  }

  private renderCloseButton() {
    return (
      <Button
        style="text-transparent"
        class="grid place-items-center"
        part="close-button"
        onClick={() => (this.isOpen = false)}
      >
        <atomic-icon class="w-5 h-5" icon={CloseIcon}></atomic-icon>
      </Button>
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

    return [
      <h1 part="section-title" class="text-2xl font-bold truncate mb-3 mt-8">
        {this.bindings.i18n.t('sort')}
      </h1>,
      <div class="relative">
        <select
          class="btn-outline-neutral w-full cursor-pointer text-lg font-bold grow appearance-none rounded-lg px-6 py-5"
          part="select"
          aria-label={this.bindings.i18n.t('sort-by')}
          onChange={(option) => this.select(option)}
        >
          {this.options.map((option) => this.buildOption(option))}
        </select>
        <div class="absolute pointer-events-none top-0 bottom-0 right-0 flex justify-center items-center pr-6">
          <atomic-icon icon={SortIcon} class="w-6 h-6"></atomic-icon>
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
        <h1 part="section-title" class="text-2xl font-bold truncate">
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
      </div>,
      <slot name="facets"></slot>,
    ];
  }

  private renderViewResultsButton() {
    return (
      <Button
        style="primary"
        part="footer-button"
        class="w-full p-3 flex text-lg justify-center"
        onClick={() => (this.isOpen = false)}
      >
        <span class="truncate mr-1">
          {this.bindings.i18n.t('view-results')}
        </span>
        <span>
          {this.bindings.i18n.t('between-parentheses', {
            text: this.querySummaryState.total.toLocaleString(
              this.bindings.i18n.language
            ),
          })}
        </span>
      </Button>
    );
  }

  public render() {
    return (
      <atomic-modal
        isOpen={this.isOpen}
        source={this.openButton}
        onAnimationEnded={() => this.onAnimationEnded()}
        exportparts="container,header,header-ruler,body,footer,footer-wrapper"
      >
        <div slot="header" class="contents">
          {this.renderTitle()}
          {this.renderCloseButton()}
        </div>
        <aside slot="body" class="w-full adjust-for-scroll-bar">
          {this.renderSort()}
          {this.renderFilters()}
        </aside>
        <div slot="footer">{this.renderViewResultsButton()}</div>
      </atomic-modal>
    );
  }
}
