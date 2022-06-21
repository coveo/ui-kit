import {Component, h, State, Element} from '@stencil/core';
import {
  buildSearchStatus,
  SearchStatusState,
  SearchStatus,
} from '@coveo/headless';
import {
  InitializeBindings,
  InitializableComponent,
  BindStateToController,
} from '../../../utils/initialization-utils';
import {Button} from '../../common/button';
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

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  private loadModal() {
    this.modalRef = document.createElement('atomic-refine-modal');
    this.host.insertAdjacentElement('beforebegin', this.modalRef);
    this.modalRef.openButton = this.buttonRef;
  }

  private enableModal() {
    this.modalRef && (this.modalRef.isOpen = true);
  }

  public render() {
    if (this.searchStatusState.hasError) {
      return;
    }

    if (!this.searchStatusState.firstSearchExecuted) {
      return (
        <div
          part="placeholder"
          aria-hidden
          class="rounded w-28 h-8 my-2 bg-neutral animate-pulse"
        ></div>
      );
    }

    if (!this.searchStatusState.hasResults) {
      return;
    }

    return (
      <Button
        style="outline-primary"
        class="p-3 w-full"
        onClick={() => this.enableModal()}
        text={this.bindings.i18n.t('sort-and-filter')}
        ref={(button) => {
          if (!button) {
            return;
          }
          this.buttonRef = button;
          this.loadModal();
        }}
        part="button"
      ></Button>
    );
  }
}
