import {
  buildBreadcrumbManager as buildInsightBreadcrumbManager,
  buildQuerySummary as buildInsightQuerySummary,
  type BreadcrumbManager as InsightBreadcrumbManager,
  type BreadcrumbManagerState as InsightBreadcrumbManagerState,
  type QuerySummary as InsightQuerySummary,
  type QuerySummaryState as InsightQuerySummaryState,
} from '@coveo/headless/insight';
import {html, LitElement, nothing, type PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {renderButton} from '@/src/components/common/button';
import {getClonedFacetElements} from '@/src/components/common/refine-modal/cloned-facet-elements';
import {renderRefineModal} from '@/src/components/common/refine-modal/modal';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {rectEquals} from '@/src/utils/dom-utils';

/**
 * The `atomic-insight-refine-modal` component displays a modal with filters for refining search results.
 *
 * This component should not be used directly. It is internally used by the `atomic-insight-refine-toggle` component to display the refine modal.
 *
 * @part title - The title of the modal.
 * @part close-button - The button in the header that closes the modal.
 * @part close-icon - The icon of the close button.
 * @part content - The wrapper around the content inside the body of the modal.
 * @part section-title - The title for each section.
 * @part section-filters-title - The title for the filters section.
 * @part filter-section - The section containing facets and the "filters" title.
 * @part filter-clear-all - The button that resets all actively selected facet values.
 * @part footer-content - The wrapper around the content inside the footer of the modal, containing the button to view results.
 * @part footer-button - The button in the footer that closes the modal.
 * @part footer-button-text - The text inside the button in the footer that closes the modal.
 * @part footer-button-count - The count inside the button in the footer that closes the modal.
 * @part footer-wrapper - The wrapper with a shadow or background color around the footer.
 * @part footer - The footer of the modal.
 * @part header-ruler - The horizontal ruler underneath the header.
 * @part body-wrapper - The wrapper around the body.
 * @part body - The body of the modal, between the header and the footer.
 * @part header-wrapper - The wrapper around the header.
 * @part header - The header of the modal, containing the title.
 * @part container - The modal's outermost container.
 */
@customElement('atomic-insight-refine-modal')
@bindings()
@withTailwindStyles
export class AtomicInsightRefineModal
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state() public bindings!: InsightBindings;
  @state() public error!: Error;

  @bindStateToController('querySummary')
  @state()
  public querySummaryState!: InsightQuerySummaryState;

  @bindStateToController('breadcrumbManager')
  @state()
  public breadcrumbManagerState!: InsightBreadcrumbManagerState;

  @state()
  public interfaceDimensions?: DOMRect;

  /**
   * The element that opens the modal when clicked.
   */
  @property({attribute: 'open-button', type: Object})
  openButton?: HTMLElement;

  /**
   * Whether the modal is open.
   */
  @property({
    type: Boolean,
    converter: booleanConverter,
    reflect: true,
    attribute: 'is-open',
  })
  isOpen = false;

  public querySummary!: InsightQuerySummary;
  public breadcrumbManager!: InsightBreadcrumbManager;

  private backdropStyleSheet = new CSSStyleSheet();

  public initialize() {
    this.querySummary = buildInsightQuerySummary(this.bindings.engine);
    this.breadcrumbManager = buildInsightBreadcrumbManager(
      this.bindings.engine
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.style.display = '';
    this.shadowRoot?.adoptedStyleSheets.push(this.backdropStyleSheet);
  }

  protected willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('interfaceDimensions')) {
      this.updateBackdropStyles();
    }
  }

  @watch('isOpen')
  watchEnabled() {
    if (this.isOpen) {
      if (!this.querySelector('div[slot="facets"]')) {
        this.appendChild(
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
    this.updateBackdropStyles();
  }

  private updateBackdropStyles() {
    if (this.interfaceDimensions) {
      this.backdropStyleSheet.replaceSync(`
        atomic-modal::part(backdrop) {
          top: ${this.interfaceDimensions.top}px;
          left: ${this.interfaceDimensions.left}px;
          width: ${this.interfaceDimensions.width}px;
          height: ${this.interfaceDimensions.height}px;
        }
      `);
    } else {
      this.backdropStyleSheet.replaceSync('');
    }
  }

  private renderHeader() {
    if (!this.breadcrumbManagerState.hasBreadcrumbs) {
      return nothing;
    }

    return html`
      <div class="mb-3 flex w-full justify-between">
        ${renderButton({
          props: {
            onClick: () => this.breadcrumbManager.deselectAll(),
            style: 'text-primary',
            text: this.bindings.i18n.t('clear-all-filters'),
            class: 'px-2 py-1',
          },
        })(nothing)}
      </div>
    `;
  }

  private renderBody() {
    if (!this.bindings.store.getFacetElements().length) {
      return nothing;
    }

    return html`
      <aside
        slot="body"
        class="flex w-full flex-col"
        aria-label=${this.bindings.i18n.t('refine-modal-content')}
      >
        ${this.renderHeader()}
        <slot name="facets"></slot>
      </aside>
    `;
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`
      ${renderRefineModal({
        props: {
          i18n: this.bindings.i18n,
          i18nFooterButtonTextKey: 'view-results',
          host: this,
          isOpen: this.isOpen,
          onClose: () => {
            this.isOpen = false;
          },
          title: this.bindings.i18n.t('filters'),
          numberOfItems: this.querySummaryState.total,
          openButton: this.openButton,
          scope: this.bindings.interfaceElement,
        },
      })(this.renderBody())}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-refine-modal': AtomicInsightRefineModal;
  }
}
