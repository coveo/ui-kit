import {
  buildSearchStatus,
  SearchStatusState,
  SearchStatus,
} from '@coveo/headless';
import {Component, h, Prop, State, Element} from '@stencil/core';
import {
  InitializeBindings,
  InitializableComponent,
  BindStateToController,
} from '../../../utils/initialization-utils';
import {RefineToggleButton} from '../../common/refine-modal/button';
import {RefineToggleGuard} from '../../common/refine-modal/guard';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-refine-toggle` component displays a button that opens a modal containing the facets and the sort components.
 *
 * When this component is added to the `atomic-search-interface`, an `atomic-refine-modal` component is automatically created.
 * @part button - The refine toggle button.
 */
@Component({
  tag: 'atomic-refine-toggle',
  styleUrl: 'atomic-refine-toggle.pcss',
  shadow: true,
})
export class AtomicRefineToggle implements InitializableComponent {
  @Element() public host!: HTMLElement;
  public searchStatus!: SearchStatus;
  private modalRef?: HTMLAtomicRefineModalElement;
  private buttonRef?: HTMLButtonElement;

  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;
  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;

  /**
   * The number of expanded facets inside the refine modal.
   * Remaining facets are automatically collapsed.
   *
   * Using the value `0` collapses all facets.
   */
  @Prop({reflect: true}) public collapseFacetsAfter = 0;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  private loadModal() {
    if (this.modalRef) {
      return;
    }

    this.modalRef = document.createElement('atomic-refine-modal');
    this.host.insertAdjacentElement('beforebegin', this.modalRef);
    this.modalRef.openButton = this.buttonRef;
    this.modalRef.collapseFacetsAfter = this.collapseFacetsAfter;
  }

  private enableModal() {
    this.modalRef && (this.modalRef.isOpen = true);
  }

  public render() {
    return (
      <RefineToggleGuard
        firstRequestExecuted={this.searchStatusState.firstSearchExecuted}
        hasError={this.searchStatusState.hasError}
        hasItems={this.searchStatusState.hasResults}
      >
        <RefineToggleButton
          i18n={this.bindings.i18n}
          onClick={() => this.enableModal()}
          setRef={(button) => {
            if (!button) {
              return;
            }
            this.buttonRef = button;
            this.loadModal();
          }}
        />
      </RefineToggleGuard>
    );
  }
}
