import {Component, h, State, Prop, Element, Watch, Host} from '@stencil/core';
import {
  InsightQuerySummary,
  InsightQuerySummaryState,
  buildInsightQuerySummary,
  InsightBreadcrumbManager,
  InsightBreadcrumbManagerState,
  buildInsightBreadcrumbManager,
} from '..';
import {rectEquals} from '../../../utils/dom-utils';
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
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

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

  public querySummary!: InsightQuerySummary;
  private breadcrumbManager!: InsightBreadcrumbManager;

  @Watch('isOpen')
  watchEnabled(isOpen: boolean) {
    if (isOpen) {
      if (!this.host.querySelector('div[slot="facets"]')) {
        this.host.append(
          getClonedFacetElements(
            this.bindings.store.getFacetElements(),
            0,
            this.bindings.interfaceElement
          )
        );
      }
      this.onAnimationFrame();
    }
  }

  private onAnimationFrame() {
    if (!this.isOpen) {
      return;
    }
    if (this.dimensionChanged()) {
      this.updateDimensions();
    }
    window.requestAnimationFrame(() => this.onAnimationFrame());
  }

  private dimensionChanged() {
    if (!this.interfaceDimensions) {
      return true;
    }

    return !rectEquals(
      this.interfaceDimensions,
      this.bindings.interfaceElement.getBoundingClientRect()
    );
  }

  public updateDimensions() {
    this.interfaceDimensions =
      this.bindings.interfaceElement.getBoundingClientRect();
  }

  public initialize() {
    this.querySummary = buildInsightQuerySummary(this.bindings.engine);
    this.breadcrumbManager = buildInsightBreadcrumbManager(
      this.bindings.engine
    );
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
