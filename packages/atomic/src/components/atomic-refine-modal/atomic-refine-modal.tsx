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
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {createRipple} from '../../utils/ripple';
import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';
import {getFacetElements} from '../../utils/store';

@Component({
  tag: 'atomic-refine-modal',
  styleUrl: 'atomic-refine-modal.pcss',
  shadow: true,
})
export class AtomicRefineModal implements InitializableComponent {
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
  }

  private duplicateFacetElements() {
    const divSlot = document.createElement('div');
    divSlot.setAttribute('slot', 'facets');

    const facetElementsPayload = getFacetElements(
      this.bindings.store
    ).map((f) => ({facetId: f.getAttribute('facet-id')!, payload: f}));
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
        class="w-full border-neutral border-b p-6 flex justify-between"
      >
        <span class="text-xl truncate">
          {this.bindings.i18n.t('sort-and-filter')}
        </span>
        <button
          part="clear-button-icon"
          class="fill-current w-5 h-5 hover:text-primary focus:text-primary focus:outline-color"
          innerHTML={CloseIcon}
          onClick={() => (this.enabled = false)}
        ></button>
      </div>
    );
  }

  private renderSort() {
    if (!this.bindings.store.state.sortOptions.length) {
      return;
    }

    return (
      <div class="mt-8">
        <div class="text-2xl font-bold truncate">
          {this.bindings.i18n.t('sort')}
        </div>
      </div>
    );
  }

  private renderFilters() {
    if (!getFacetElements(this.bindings.store).length) {
      return;
    }

    return [
      <div class="w-full flex justify-between mt-8 mb-3">
        <span class="text-2xl font-bold truncate">
          {this.bindings.i18n.t('filters')}
        </span>
        {this.breadcrumbManagerState.hasBreadcrumbs && (
          <button
            part="filter-clear-all"
            class="truncate btn-no-outline-primary px-2 py-1"
            onClick={() => this.breadcrumbManager.deselectAll()}
            onMouseDown={(e) => createRipple(e, {color: 'neutral'})}
          >
            <span>{this.bindings.i18n.t('clear')}</span>
          </button>
        )}
      </div>,
      <slot name="facets"></slot>,
    ];
  }

  private renderFooter() {
    return (
      <div
        part="footer"
        class="px-6 py-4 w-full border-neutral border-t bg-background z-10 shadow-lg"
      >
        <button
          class="btn-primary p-3 w-full flex text-lg justify-center"
          onClick={() => (this.enabled = false)}
          onMouseDown={(e) => createRipple(e, {color: 'primary'})}
        >
          <span class="truncate mr-1">
            {this.bindings.i18n.t('view-results')}
          </span>
          <span class="with-parentheses">
            {this.querySummaryState.total.toLocaleString(
              this.bindings.i18n.language
            )}
          </span>
        </button>
      </div>
    );
  }

  public render() {
    if (!this.enabled) {
      return;
    }

    return (
      <div
        part="wrapper"
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
