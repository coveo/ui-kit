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
import {createRipple} from '../../utils/ripple';

/**
 * The `atomic-refine-toggle` component displays a button that opens a modal containing the facets and the sort components.
 */
@Component({
  tag: 'atomic-refine-toggle',
  styleUrl: 'atomic-refine-toggle.pcss',
  shadow: true,
})
export class AtomicRefineToggle implements InitializableComponent {
  public searchStatus!: SearchStatus;

  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;
  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
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
      <button
        class="btn-outline-primary p-3"
        onClick={() => this.bindings.store.set('refineEnabled', true)}
        onMouseDown={(e) => createRipple(e, {color: 'neutral'})}
      >
        <span>{this.bindings.i18n.t('sort-and-filter')}</span>
      </button>
    );
  }
}
