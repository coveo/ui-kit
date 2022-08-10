import {Component, h, State, Element} from '@stencil/core';
import {
  buildInsightBreadcrumbManager,
  InsightBreadcrumbManager,
  InsightBreadcrumbManagerState,
} from '..';
import FilterIcon from '../../../images/filter.svg';
import {
  InitializeBindings,
  BindStateToController,
} from '../../../utils/initialization-utils';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 */
@Component({
  tag: 'atomic-insight-refine-toggle',
  shadow: true,
})
export class AtomicInsightRefineToggle {
  @InitializeBindings() public bindings!: InsightBindings;
  @Element() public host!: HTMLElement;

  @State() public error!: Error;

  @BindStateToController('breadcrumbManager')
  @State()
  private breadcrumbManagerState!: InsightBreadcrumbManagerState;

  public breadcrumbManager!: InsightBreadcrumbManager;
  private modalRef?: HTMLAtomicInsightRefineModalElement;
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
    this.breadcrumbManager = buildInsightBreadcrumbManager(
      this.bindings.engine
    );
  }

  private enableModal() {
    this.modalRef && (this.modalRef.isOpen = true);
  }

  private loadModal() {
    if (this.modalRef) {
      return;
    }

    this.modalRef = document.createElement('atomic-insight-refine-modal');
    this.host.parentElement?.insertAdjacentElement(
      'beforebegin',
      this.modalRef
    );
    this.modalRef.openButton = this.buttonRef;
  }

  public render() {
    return (
      <atomic-icon-button
        icon={FilterIcon}
        labelI18nKey="insight-history"
        clickCallback={() => {
          this.bindings.store.waitUntilAppLoaded(() => {
            this.enableModal();
          });
        }}
        buttonRef={(button?: HTMLButtonElement) => {
          if (!button) {
            return;
          }
          this.buttonRef = button;
          this.loadModal();
        }}
        badge={
          this.breadcrumbManagerState.hasBreadcrumbs ? (
            <slot>{this.numberOfBreadcrumbs.toString()}</slot>
          ) : undefined
        }
      />
    );
  }
}
