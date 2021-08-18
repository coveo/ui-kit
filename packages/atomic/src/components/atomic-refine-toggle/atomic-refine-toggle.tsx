import {Component, h, State} from '@stencil/core';
import {
  buildSearchStatus,
  SearchStatusState,
  SearchStatus,
} from '@coveo/headless';
import {
  InitializeBindings,
  Bindings,
  InitializableComponent,
  BindStateToController,
} from '../../utils/initialization-utils';
import {Button} from '../common/button';

/**
 * The `atomic-refine-toggle` component displays a button that opens a modal containing the facets and the sort components.
 *
 * When this component is added to the `atomic-search-interface`, an `atomic-refine-modal` component is automatically created.
 */
@Component({
  tag: 'atomic-refine-toggle',
  styleUrl: 'atomic-refine-toggle.pcss',
  shadow: true,
})
export class AtomicRefineToggle implements InitializableComponent {
  public searchStatus!: SearchStatus;
  private modalRef?: HTMLAtomicRefineModalElement;

  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;
  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.modalRef = document.createElement('atomic-refine-modal');
    this.bindings.interfaceElement.prepend(this.modalRef);
  }

  private enableModal() {
    this.modalRef?.setAttribute('enabled', 'true');
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
        class="p-3"
        onClick={() => this.enableModal()}
        text={this.bindings.i18n.t('sort-and-filter')}
      ></Button>
    );
  }
}
