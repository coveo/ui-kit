import {
  buildBreadcrumbManager as buildInsightBreadcrumbManager,
  buildQuerySummary as buildInsightQuerySummary,
  type BreadcrumbManager as InsightBreadcrumbManager,
  type BreadcrumbManagerState as InsightBreadcrumbManagerState,
  type QuerySummary as InsightQuerySummary,
  type QuerySummaryState as InsightQuerySummaryState,
} from '@coveo/headless/insight';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {getClonedFacetElements} from '@/src/components/common/refine-modal/cloned-facet-elements';
import {
  renderRefineModalFiltersClearButton,
  renderRefineModalFiltersSection,
} from '@/src/components/common/refine-modal/filters';
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
 * @internal
 */
@customElement('atomic-insight-refine-modal')
@bindings()
@withTailwindStyles
export class AtomicInsightRefineModal
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  static styles = css``;

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
  private breadcrumbManager!: InsightBreadcrumbManager;

  public initialize() {
    this.querySummary = buildInsightQuerySummary(this.bindings.engine);
    this.breadcrumbManager = buildInsightBreadcrumbManager(
      this.bindings.engine
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.style.display = '';
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
  }

  private renderFilters() {
    if (!this.bindings.store.getFacetElements().length) {
      return nothing;
    }

    const {i18n} = this.bindings;

    return renderRefineModalFiltersSection({
      props: {
        i18n,
        withFacets: true,
        withAutomaticFacets: false,
      },
    })(
      this.breadcrumbManagerState.hasBreadcrumbs
        ? renderRefineModalFiltersClearButton({
            props: {
              i18n,
              onClick: () => this.breadcrumbManager.deselectAll(),
            },
          })
        : nothing
    );
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const scopeStyles = this.interfaceDimensions
      ? html`
          <style>
            atomic-modal::part(backdrop) {
              top: ${this.interfaceDimensions.top}px;
              left: ${this.interfaceDimensions.left}px;
              width: ${this.interfaceDimensions.width}px;
              height: ${this.interfaceDimensions.height}px;
            }
          </style>
        `
      : nothing;

    return html`
      ${scopeStyles}
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
      })(html` ${this.renderFilters()} `)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-refine-modal': AtomicInsightRefineModal;
  }
}
