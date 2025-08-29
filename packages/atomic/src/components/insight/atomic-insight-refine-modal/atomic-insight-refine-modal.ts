import {
  buildBreadcrumbManager as buildInsightBreadcrumbManager,
  buildQuerySummary as buildInsightQuerySummary,
  type BreadcrumbManager as InsightBreadcrumbManager,
  type BreadcrumbManagerState as InsightBreadcrumbManagerState,
  type QuerySummary as InsightQuerySummary,
  type QuerySummaryState as InsightQuerySummaryState,
} from '@coveo/headless/insight';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {rectEquals} from '../../../utils/dom-utils';
import {renderButton} from '../../common/button';
import {renderRefineModalBody} from '../../common/refine-modal/body';
import {getClonedFacetElements} from '../../common/refine-modal/cloned-facet-elements';
import {renderRefineModal} from '../../common/refine-modal/modal';
import type {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@customElement('atomic-insight-refine-modal')
@bindings()
@withTailwindStyles
export class AtomicInsightRefineModal
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state()
  bindings!: InsightBindings;

  @bindStateToController('querySummary')
  @state()
  public querySummaryState!: InsightQuerySummaryState;

  @bindStateToController('breadcrumbManager')
  @state()
  public breadcrumbManagerState!: InsightBreadcrumbManagerState;

  @state()
  public error!: Error;

  @state()
  public interfaceDimensions?: DOMRect;

  @property({type: Object}) openButton?: HTMLElement;

  @property({type: Boolean, reflect: true}) isOpen = false;

  public querySummary!: InsightQuerySummary;
  public breadcrumbManager!: InsightBreadcrumbManager;

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('isOpen')) {
      this.watchEnabled(this.isOpen);
    }
  }

  watchEnabled(isOpen: boolean) {
    if (isOpen) {
      if (!this.querySelector('div[slot="facets"]')) {
        this.append(
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
    return html`
      <div class="flex justify-between w-full mb-3">
        ${
          this.breadcrumbManagerState.hasBreadcrumbs
            ? renderButton({
                props: {
                  onClick: () => this.breadcrumbManager.deselectAll(),
                  style: 'text-primary',
                  text: this.bindings.i18n.t('clear-all-filters'),
                  class: 'px-2 py-1',
                },
              })(nothing)
            : nothing
        }
      </div>
    `;
  }

  private renderBody() {
    if (!this.bindings.store.getFacetElements().length) {
      return nothing;
    }

    return renderRefineModalBody()(html`
      ${this.renderHeader()}
      <slot name="facets"></slot>
    `);
  }

  public render() {
    return html`
      ${
        this.interfaceDimensions
          ? html`<style>
            atomic-modal::part(backdrop) {
              top: ${this.interfaceDimensions.top}px;
              left: ${this.interfaceDimensions.left}px;
              width: ${this.interfaceDimensions.width}px;
              height: ${this.interfaceDimensions.height}px;
            }
          </style>`
          : nothing
      }
      ${renderRefineModal({
        props: {
          i18n: this.bindings.i18n,
          host: this,
          isOpen: this.isOpen,
          onClose: () => {
            this.isOpen = false;
          },
          numberOfItems: this.querySummaryState.total,
          title: this.bindings.i18n.t('filters'),
          openButton: this.openButton,
          scope: this.bindings.interfaceElement,
        },
      })(this.renderBody())}
    `;
  }

  firstUpdated() {
    this.style.display = '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-refine-modal': AtomicInsightRefineModal;
  }
}
