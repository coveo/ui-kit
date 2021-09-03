import {Element, Component} from '@stencil/core';
import {containsVisualElement} from '../../../utils/utils';

/**
 * The emphasized section allows the information seeker to quickly see the
 * field that is important for its search criteria, in cases such as in
 * commerce, the cost of a product is often an important information, often
 * more than the title itself.
 *
 * Behaviour:
 * * Has a very large font size
 * * Is the second closest element underneath the title section
 */
@Component({
  tag: 'atomic-result-section-emphasized',
  shadow: false,
})
export class AtomicResultSectionEmphasized {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    this.host.classList.toggle('empty', !containsVisualElement(this.host));
  }
}
