import {Element, Component, State} from '@stencil/core';
import {
  InitializableComponent,
  Bindings,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {containsVisualElement} from '../../../utils/utils';

/**
 * The `atomic-result-section-emphasized` element, when added to a result template,
 * changes the style and position of its content to match specifications
 * from the result list element.
 */
@Component({
  tag: 'atomic-result-section-emphasized',
  shadow: false,
})
export class AtomicResultSectionEmphasized implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    this.host.style.display = containsVisualElement(this.host) ? '' : 'none';
  }
}
