import {Component, h, State} from '@stencil/core';
import {
  BreadcrumbManager,
  buildBreadcrumbManager,
  BreadcrumbManagerState,
  buildQuerySummary,
  QuerySummary,
  QuerySummaryState,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {createRipple} from '../../utils/ripple';
import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';

@Component({
  tag: 'atomic-refine-modal',
  styleUrl: 'atomic-refine-modal.pcss',
  shadow: true,
})
export class AtomicRefineModal implements InitializableComponent {
  private breadcrumbManager!: BreadcrumbManager;
  public querySummary!: QuerySummary;
  @InitializeBindings() public bindings!: Bindings;

  @BindStateToController('querySummary')
  @State()
  private querySummaryState!: QuerySummaryState;
  @BindStateToController('breadcrumbManager')
  @State()
  private breadcrumbManagerState!: BreadcrumbManagerState;
  @State() public error!: Error;

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
    this.querySummary = buildQuerySummary(this.bindings.engine);
  }

  private renderHeader() {
    return (
      <div class="w-full border-neutral border-b p-6 flex justify-between">
        <span class="text-xl truncate">
          {this.bindings.i18n.t('sort-and-filter')}
        </span>
        <button
          part="clear-button-icon"
          class="fill-current w-5 h-5 hover:text-primary focus:text-primary focus:outline-color"
          innerHTML={CloseIcon}
          onClick={() => this.bindings.store.set('refineEnabled', false)}
        ></button>
      </div>
    );
  }

  private renderSort() {
    return [
      <div class="mt-8">
        <div class="text-2xl font-bold truncate">
          {this.bindings.i18n.t('sort')}
        </div>
      </div>,
      // TODO: add sort component with extracted configuration
      <div></div>,
    ];
  }

  private renderFilters() {
    return [
      <div class="w-full flex justify-between mt-8">
        <span class="text-2xl font-bold truncate">
          {this.bindings.i18n.t('filters')}
        </span>
        {this.breadcrumbManagerState.hasBreadcrumbs && (
          <button
            part="breadcrumb-clear-all"
            class="truncate btn-no-outline-primary px-2 py-1"
            onClick={() => this.breadcrumbManager.deselectAll()}
            onMouseDown={(e) => createRipple(e, {color: 'neutral'})}
          >
            <span>{this.bindings.i18n.t('clear')}</span>
          </button>
        )}
      </div>,
      // TODO: add duplicated facet components
      <slot name="facets"></slot>,
    ];
  }

  private renderFooter() {
    return (
      <div class="px-6 py-4 fixed w-full bottom-0 left-0 border-neutral border-t">
        <button
          class="btn-primary p-3 w-full flex text-lg justify-center"
          onClick={() => this.bindings.store.set('refineEnabled', false)}
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
    if (!this.bindings.store.get('refineEnabled')) {
      return;
    }

    return (
      <div
        part="wrapper"
        class="w-screen h-screen fixed bg-background text-on-background left-0 top-0 z-10"
      >
        {this.renderHeader()}
        <div class="px-6">
          {this.renderSort()}
          {this.renderFilters()}
        </div>
        {this.renderFooter()}
      </div>
    );
  }
}
