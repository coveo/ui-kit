import {Component, h, State, Prop, Element, Watch, Host} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';
import {
  buildInsightFacetManager,
  InsightFacetManager,
  InsightQuerySummary,
  InsightQuerySummaryState,
  buildInsightQuerySummary,
} from '..';
import {
  getClonedFacetElements,
  RefineModalCommon,
} from '../../common/refine-modal/refine-modal-common';
import {Hidden} from '../../common/hidden';

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

  @State()
  public error!: Error;

  @State()
  public interfaceDimensions?: DOMRect;

  @Prop({mutable: true}) openButton?: HTMLElement;

  @Prop({reflect: true, mutable: true}) isOpen = false;
  private facetManager!: InsightFacetManager;
  private resizeObserver?: ResizeObserver;
  private scrollCallback = () => this.updateDimensions();
  public querySummary!: InsightQuerySummary;

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
      this.updateDimensions();
      if (window.ResizeObserver) {
        if (!this.resizeObserver) {
          this.resizeObserver = new ResizeObserver(() =>
            this.updateDimensions()
          );
        }
        this.resizeObserver.observe(document.body);
      }

      document.addEventListener('scroll', this.scrollCallback);
    } else {
      this.resizeObserver?.disconnect();
      document.removeEventListener('scroll', this.scrollCallback);
    }
  }

  public updateDimensions() {
    this.interfaceDimensions =
      this.bindings.interfaceElement.getBoundingClientRect();
  }

  public disconnectedCallback() {
    this.resizeObserver?.disconnect();
    document.removeEventListener('scroll', this.scrollCallback);
  }

  public initialize() {
    this.facetManager = buildInsightFacetManager(this.bindings.engine);
    this.querySummary = buildInsightQuerySummary(this.bindings.engine);
  }

  private renderBody() {
    if (!this.bindings.store.getFacetElements().length) {
      return <Hidden></Hidden>;
    }

    return (
      <aside slot="body" class="flex flex-col w-full adjust-for-scroll-bar">
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
