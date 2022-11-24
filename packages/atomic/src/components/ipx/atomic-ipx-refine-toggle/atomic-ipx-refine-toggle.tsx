import {
  BreadcrumbManager,
  BreadcrumbManagerState,
  buildBreadcrumbManager,
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Component, h, State, Element} from '@stencil/core';
import FilterIcon from '../../../images/filter.svg';
import {
  InitializeBindings,
  BindStateToController,
} from '../../../utils/initialization-utils';
import {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-ipx-refine-toggle',
  styleUrl: 'atomic-ipx-refine-toggle.pcss',
  shadow: true,
})
export class AtomicIPXRefineToggle {
  @InitializeBindings() public bindings!: Bindings;
  @Element() public host!: HTMLElement;

  @State() public error!: Error;

  @BindStateToController('breadcrumbManager')
  @State()
  private breadcrumbManagerState!: BreadcrumbManagerState;

  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;

  public breadcrumbManager!: BreadcrumbManager;
  public searchStatus!: SearchStatus;
  private modalRef?: HTMLAtomicIpxRefineModalElement;
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
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  private enableModal() {
    this.modalRef && (this.modalRef.isOpen = true);
  }

  private loadModal() {
    if (this.modalRef) {
      return;
    }

    this.modalRef = document.createElement('atomic-ipx-refine-modal');
    this.host.parentElement?.insertAdjacentElement(
      'beforebegin',
      this.modalRef
    );
    this.modalRef.openButton = this.buttonRef;
  }

  public render() {
    return (
      <atomic-icon-button
        tooltip={this.bindings.i18n.t('filters')}
        icon={FilterIcon}
        disabled={
          !this.searchStatusState.hasResults && !this.numberOfBreadcrumbs
        }
        labelI18nKey="sort"
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
