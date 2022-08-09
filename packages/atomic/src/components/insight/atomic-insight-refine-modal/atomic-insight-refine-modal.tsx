import {Component, h, State, Prop, Element, Watch, Host} from '@stencil/core';
import {debounce} from 'ts-debounce';
import {buildCustomEvent} from '../../../utils/event-utils';
import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Button} from '../../common/button';
import {
  InsightBindings,
  InsightInterfaceDimensions,
} from '../atomic-insight-interface/atomic-insight-interface';
import {
  buildInsightFacetManager,
  buildInsightQuerySummary,
  InsightFacetManager,
  InsightQuerySummary,
  InsightQuerySummaryState,
} from '..';
import {BaseFacetElement} from '../../common/facets/facet-common';

/**
 * The `atomic-refine-modal` is automatically created as a child of the `atomic-search-interface` when the `atomic-refine-toggle` is initialized.
 *
 * When the modal is opened, the class `atomic-modal-opened` is added to the body, allowing further customization.
 *
 * @part container - The modal's outermost container.
 * @part header-wrapper - The wrapper around the header.
 * @part header - The header of the modal, containing the title.
 * @part section-title - The title for each section.
 * @part close-button - The button in the header that closes the modal.
 * @part header-ruler - The horizontal ruler underneath the header.
 * @part body-wrapper - The wrapper around the body.
 * @part body - The body of the modal, between the header and the footer.
 * @part select - The `<select>` element of the drop-down list.
 * @part select-icon - The select dropdown's sort icon.
 * @part filter-clear-all - The button that resets all actively selected facet values.
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
  private querySummaryState!: InsightQuerySummaryState;

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

  private renderHeader() {
    return (
      <div slot="header" class="contents">
        <h1 class="truncate">{this.bindings.i18n.t('filters')}</h1>
        <Button
          style="text-transparent"
          class="grid place-items-center"
          part="close-button"
          onClick={() => (this.isOpen = false)}
          ariaLabel={this.bindings.i18n.t('close')}
        >
          <atomic-icon class="w-5 h-5" icon={CloseIcon}></atomic-icon>
        </Button>
      </div>
    );
  }

  private renderBody() {
    if (!this.bindings.store.getFacetElements().length) {
      return;
    }

    return [
      <aside slot="body" class="flex flex-col w-full adjust-for-scroll-bar">
        <slot name="facets"></slot>
      </aside>,
    ];
  }

  private renderFooter() {
    return (
      <div slot="footer">
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
      </div>
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
        <atomic-modal
          fullscreen
          isOpen={this.isOpen && !this.loadingDimensions}
          source={this.openButton}
          container={this.host}
          close={() => (this.isOpen = false)}
          exportparts="container,header,header-wrapper,header-ruler,body,body-wrapper,footer,footer-wrapper,footer-wrapper"
        >
          {this.renderHeader()}
          {this.renderBody()}
          {this.renderFooter()}
        </atomic-modal>
      </Host>
    );
  }

  public componentDidLoad() {
    this.host.style.display = '';
    const divSlot = document.createElement('div');
    divSlot.setAttribute('slot', 'facets');
    divSlot.style.display = 'flex';
    divSlot.style.flexDirection = 'column';
    divSlot.style.gap = 'var(--atomic-refine-modal-facet-margin, 20px)';

    const facetElementsPayload = this.bindings.store
      .getFacetElements()
      .map((f) => ({facetId: f.getAttribute('facet-id')!, payload: f}));
    const sortedFacetsElements = this.facetManager
      .sort(facetElementsPayload)
      .map((f) => f.payload);

    sortedFacetsElements.forEach((facetElement) => {
      const clone = facetElement.cloneNode(true) as BaseFacetElement;
      clone.isCollapsed = true;
      divSlot.append(clone);
    });

    this.host.append(divSlot);
  }
}
