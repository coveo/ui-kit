import {Component, h, State} from '@stencil/core';
import {
  InitializeBindings,
  Bindings,
  InitializableComponent,
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
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  public render() {
    return (
      <button
        class="btn-outline-primary p-3"
        onMouseDown={(e) => createRipple(e, {color: 'neutral'})}
      >
        <span>{this.bindings.i18n.t('sort-and-filter')}</span>
      </button>
    );
  }
}
