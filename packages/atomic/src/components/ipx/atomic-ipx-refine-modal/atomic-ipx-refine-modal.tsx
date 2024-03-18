import {
  BreadcrumbManager,
  BreadcrumbManagerState,
  buildBreadcrumbManager,
  buildQuerySummary,
  QuerySummary,
  QuerySummaryState,
} from '@coveo/headless';
import {Component, h, State, Prop, Element, Watch, Host} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Button} from '../../common/button';
import {Hidden} from '../../common/hidden';
import {
  getClonedFacetElements,
  RefineModalCommon,
} from '../../common/refine-modal/refine-modal-common';
import {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-ipx-refine-modal',
  styleUrl: 'atomic-ipx-refine-modal.pcss',
  shadow: true,
})
export class AtomicIPXRefineModal implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @Element() public host!: HTMLElement;

  @BindStateToController('querySummary')
  @State()
  public querySummaryState!: QuerySummaryState;

  @BindStateToController('breadcrumbManager')
  @State()
  public breadcrumbManagerState!: BreadcrumbManagerState;

  @State()
  public error!: Error;

  @State()
  public interfaceDimensions?: DOMRect;

  @Prop({mutable: true}) openButton?: HTMLElement;

  @Prop({reflect: true, mutable: true}) isOpen = false;

  /**
   * The number of expanded facets inside the refine modal.
   * Remaining facets are automatically collapsed.
   *
   * Using the value `0` collapses all facets.
   */
  @Prop({reflect: true}) public collapseFacetsAfter = 0;

  private breadcrumbManager!: BreadcrumbManager;
  public querySummary!: QuerySummary;

  @Watch('isOpen')
  watchEnabled(isOpen: boolean) {
    if (isOpen) {
      if (!this.host.querySelector('div[slot="facets"]')) {
        this.host.append(
          getClonedFacetElements(
            this.bindings.store.getFacetElements(),
            this.collapseFacetsAfter,
            this.bindings.interfaceElement
          )
        );
      }
    }
  }

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
    this.querySummary = buildQuerySummary(this.bindings.engine);
  }

  private renderHeader() {
    return (
      <div class="w-full flex justify-between mb-3">
        {this.breadcrumbManagerState.hasBreadcrumbs && (
          <Button
            onClick={() => this.breadcrumbManager.deselectAll()}
            style="text-primary"
            text={this.bindings.i18n.t('clear-all-filters')}
            class="px-2 py-1"
          ></Button>
        )}
      </div>
    );
  }

  private renderBody() {
    if (!this.bindings.store.getFacetElements().length) {
      return <Hidden></Hidden>;
    }

    return (
      <aside slot="body" class="flex flex-col w-full adjust-for-scroll-bar">
        {this.renderHeader()}
        <slot name="facets"></slot>
      </aside>
    );
  }

  public render() {
    return (
      <Host>
        <RefineModalCommon
          bindings={this.bindings}
          host={this.host}
          isOpen={this.isOpen}
          onClose={() => (this.isOpen = false)}
          querySummaryState={this.querySummaryState}
          title={this.bindings.i18n.t('filters')}
          openButton={this.openButton}
          boundary="element"
          scope={this.bindings.interfaceElement}
        >
          {this.renderBody()}
        </RefineModalCommon>
      </Host>
    );
  }

  public componentDidLoad() {
    this.host.style.display = '';
  }
}
