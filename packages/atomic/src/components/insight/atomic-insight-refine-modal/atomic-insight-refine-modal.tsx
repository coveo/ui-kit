import {Component, h, State, Prop, Element, Watch, Host} from '@stencil/core';
import {debounce} from 'ts-debounce';
import {buildCustomEvent} from '../../../utils/event-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  InsightBindings,
  InsightInterfaceDimensions,
} from '../atomic-insight-interface/atomic-insight-interface';
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
  public loadingDimensions = true;

  @Prop({mutable: true}) openButton?: HTMLElement;

  @Prop({reflect: true, mutable: true}) isOpen = false;

  private interfaceDimensions?: InsightInterfaceDimensions;
  private facetManager!: InsightFacetManager;
  private resizeObserver?: ResizeObserver;
  private debouncedUpdateDimensions = debounce(this.updateDimensions, 500);
  private scrollCallback = () => this.debouncedUpdateDimensions();
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
      this.debouncedUpdateDimensions();
      if (window.ResizeObserver) {
        if (!this.resizeObserver) {
          this.resizeObserver = new ResizeObserver(() =>
            this.debouncedUpdateDimensions()
          );
        }
        this.resizeObserver.observe(document.body);
      }

      document.addEventListener('scroll', this.scrollCallback);
    } else {
      this.loadingDimensions = true;
      this.resizeObserver?.disconnect();
      document.removeEventListener('scroll', this.scrollCallback);
    }
  }

  public disconnectedCallback() {
    this.resizeObserver?.disconnect();
    document.removeEventListener('scroll', this.scrollCallback);
  }

  public updateDimensions() {
    this.loadingDimensions = true;
    this.host.dispatchEvent(
      buildCustomEvent(
        'atomic/insight/getDimensions',
        (dimensions: InsightInterfaceDimensions) => {
          this.interfaceDimensions = dimensions;
          this.loadingDimensions = false;
        }
      )
    );
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
