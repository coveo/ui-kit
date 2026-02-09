import {
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  buildBreadcrumbManager,
  buildSearchStatus,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless/insight';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {renderIconButton} from '@/src/components/common/icon-button';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import FilterIcon from '@/src/images/filter.svg';
import {refineToggleGuard} from '../../common/refine-modal/guard';
import type {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';
import type {AtomicInsightRefineModal} from '../atomic-insight-refine-modal/atomic-insight-refine-modal';

/**
 * The `atomic-insight-refine-toggle` component displays a button that opens a modal containing the facets and the sort components.
 *
 * When this component is added to the `atomic-insight-interface`, an `atomic-insight-refine-modal` component is automatically created.
 *
 * @part insight-refine-toggle-container - The container for the refine toggle button.
 * @part insight-refine-toggle-button - The refine toggle button.
 * @part insight-refine-toggle-icon - The filter icon.
 * @part insight-refine-toggle-badge - The badge showing the number of active filters.
 * @part placeholder - The placeholder shown while the first request is being executed.
 */
@customElement('atomic-insight-refine-toggle')
@bindings()
@withTailwindStyles
export class AtomicInsightRefineToggle
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state()
  bindings!: InsightBindings;

  @state()
  error!: Error;

  public searchStatus!: SearchStatus;
  public breadcrumbManager!: BreadcrumbManager;

  @bindStateToController('searchStatus')
  @state()
  private searchStatusState!: SearchStatusState;

  @bindStateToController('breadcrumbManager')
  @state()
  private breadcrumbManagerState!: BreadcrumbManagerState;

  private modalRef?: AtomicInsightRefineModal;
  private buttonRef?: HTMLButtonElement;

  private get numberOfBreadcrumbs(): number {
    return [
      ...this.breadcrumbManagerState.facetBreadcrumbs,
      ...this.breadcrumbManagerState.categoryFacetBreadcrumbs,
      ...this.breadcrumbManagerState.numericFacetBreadcrumbs,
      ...this.breadcrumbManagerState.dateFacetBreadcrumbs,
      ...this.breadcrumbManagerState.staticFilterBreadcrumbs,
    ].length;
  }

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
  }

  private loadModal() {
    if (this.modalRef) {
      return;
    }

    this.modalRef = document.createElement('atomic-insight-refine-modal');
    this.insertAdjacentElement('beforebegin', this.modalRef);
    this.modalRef.openButton = this.buttonRef;
  }

  private enableModal() {
    if (this.modalRef) {
      this.modalRef.isOpen = true;
    }
  }

  @errorGuard()
  @bindingGuard()
  render() {
    return html`${refineToggleGuard(
      {
        firstRequestExecuted: this.searchStatusState.firstSearchExecuted,
        hasError: this.searchStatusState.hasError,
        hasItems:
          this.searchStatusState.hasResults || this.numberOfBreadcrumbs > 0,
      },
      () =>
        html`${renderIconButton({
          props: {
            partPrefix: 'insight-refine-toggle',
            style: 'outline-neutral',
            icon: FilterIcon,
            ariaLabel: this.bindings.i18n.t('filters'),
            title: this.bindings.i18n.t('filters'),
            disabled:
              !this.searchStatusState.hasResults &&
              this.numberOfBreadcrumbs === 0,
            onClick: () => this.enableModal(),
            buttonRef: (button) => {
              if (!button) {
                return;
              }
              this.buttonRef = button as HTMLButtonElement;
              this.loadModal();
            },
            badge: this.breadcrumbManagerState.hasBreadcrumbs
              ? html`${this.numberOfBreadcrumbs}`
              : undefined,
          },
        })}`
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-refine-toggle': AtomicInsightRefineToggle;
  }
}
