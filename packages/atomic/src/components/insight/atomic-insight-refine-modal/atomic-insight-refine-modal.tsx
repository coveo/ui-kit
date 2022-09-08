import {Component, h, State, Prop, Element, Watch, Host} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';
import {
  InsightFacetManager,
  buildInsightFacetManager,
  InsightQuerySummary,
  InsightQuerySummaryState,
  buildInsightQuerySummary,
  InsightBreadcrumbManager,
  InsightBreadcrumbManagerState,
  buildInsightBreadcrumbManager,
} from '..';
import {
  getClonedFacetElements,
  RefineModalCommon,
} from '../../common/refine-modal/refine-modal-common';
import {Hidden} from '../../common/hidden';
import {Button} from '../../common/button';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-refine-modal',
  styleUrl: 'atomic-insight-refine-modal.pcss',
  shadow: true,
})
export class AtomicInsightRefineModal
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  @Element() public host!: HTMLElement;

  @BindStateToController('querySummary')
  @State()
  public querySummaryState!: InsightQuerySummaryState;

  @BindStateToController('breadcrumbManager')
  @State()
  public breadcrumbManagerState!: InsightBreadcrumbManagerState;

  @State()
  public error!: Error;

  @State()
  public interfaceDimensions?: DOMRect;

  @Prop({mutable: true}) openButton?: HTMLElement;

  @Prop({reflect: true, mutable: true}) isOpen = false;

  private facetManager!: InsightFacetManager;
  private resizeObserver?: ResizeObserver;
  private updateDimensionsOnNextFrame = () =>
    requestAnimationFrame(this.updateDimensions.bind(this));
  public querySummary!: InsightQuerySummary;
  private breadcrumbManager!: InsightBreadcrumbManager;

  @Watch('isOpen')
  watchEnabled(isOpen: boolean) {
    if (isOpen) {
      if (!this.host.querySelector('div[slot="facets"]')) {
        this.host.append(
          getClonedFacetElements(
            this.bindings.store.getFacetElements(),
            this.facetManager
          )
        );
      }
      this.updateDimensionsOnNextFrame();
      if (window.ResizeObserver) {
        if (!this.resizeObserver) {
          this.resizeObserver = new ResizeObserver(() =>
            this.updateDimensionsOnNextFrame()
          );
        }
        this.resizeObserver.observe(document.body);
      }

      document.addEventListener('scroll', this.updateDimensionsOnNextFrame);
    } else {
      this.resizeObserver?.disconnect();
      document.removeEventListener('scroll', this.updateDimensionsOnNextFrame);
    }
  }

  public disconnectedCallback() {
    this.resizeObserver?.disconnect();
    document.removeEventListener('scroll', this.updateDimensionsOnNextFrame);
  }

  public updateDimensions() {
    this.interfaceDimensions =
      this.bindings.interfaceElement.getBoundingClientRect();
  }

  public initialize() {
    this.facetManager = buildInsightFacetManager(this.bindings.engine);
    this.querySummary = buildInsightQuerySummary(this.bindings.engine);
    this.breadcrumbManager = buildInsightBreadcrumbManager(
      this.bindings.engine
    );
  }

  private renderHeader() {
    return (
      <div class="w-full flex justify-between mb-3">
        <h2 class="text-2xl font-bold truncate">
          {this.bindings.i18n.t('filters')}
        </h2>
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
        {this.interfaceDimensions && (
          <style>
            {`atomic-modal::part(backdrop) {
            top: ${this.interfaceDimensions.top}px;
            left: ${this.interfaceDimensions.left}px;
            width: ${this.interfaceDimensions.width}px;
            height: ${this.interfaceDimensions.height}px;
            }`}
          </style>
        )}
        <RefineModalCommon
          bindings={this.bindings}
          host={this.host}
          isOpen={this.isOpen}
          onClose={() => (this.isOpen = false)}
          querySummaryState={this.querySummaryState}
          title={this.bindings.i18n.t('filters')}
          openButton={this.openButton}
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
