import {
  buildBreadcrumbManager as buildInsightBreadcrumbManager,
  buildSearchStatus as buildInsightSearchStatus,
  BreadcrumbManager as InsightBreadcrumbManager,
  BreadcrumbManagerState as InsightBreadcrumbManagerState,
  SearchStatus as InsightSearchStatus,
  SearchStatusState as InsightSearchStatusState,
} from '@coveo/headless/insight';
import {Component, h, State, Element} from '@stencil/core';
import FilterIcon from '../../../images/filter.svg';
import {
  InitializeBindings,
  BindStateToController,
} from '../../../utils/initialization-utils';
import {IconButton} from '../../common/stencil-iconButton';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-refine-toggle',
  styleUrl: 'atomic-insight-refine-toggle.pcss',
  shadow: true,
})
export class AtomicInsightRefineToggle {
  @InitializeBindings() public bindings!: InsightBindings;
  @Element() public host!: HTMLElement;

  @State() public error!: Error;

  @BindStateToController('breadcrumbManager')
  @State()
  private breadcrumbManagerState!: InsightBreadcrumbManagerState;

  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: InsightSearchStatusState;

  public breadcrumbManager!: InsightBreadcrumbManager;
  public searchStatus!: InsightSearchStatus;
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
    this.searchStatus = buildInsightSearchStatus(this.bindings.engine);
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
      <IconButton
        partPrefix="insight-refine-toggle"
        style="outline-neutral"
        title={this.bindings.i18n.t('filters')}
        icon={FilterIcon}
        disabled={
          !this.searchStatusState.hasResults && !this.numberOfBreadcrumbs
        }
        ariaLabel={this.bindings.i18n.t('sort')}
        onClick={() => {
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
