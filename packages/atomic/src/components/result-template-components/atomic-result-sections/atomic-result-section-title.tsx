import {Element, Component} from '@stencil/core';
import {containsVisualElement} from '../../../utils/utils';

/**
 * The title section allows the information seeker to recognize the item by its
 * name. Most of the time this would be the page title and it is the go-to for
 * scanning the results.
 *
 * Behaviour:
 * * Has a fixed height of two lines on grid layouts.
 * * Exposes the `--line-height` CSS variable so child elements can adjust to the current line height.
 * * Has a text color.
 */
@Component({
  tag: 'atomic-result-section-title',
  shadow: false,
})
export class AtomicResultSectionTitle {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    this.host.classList.toggle('empty', !containsVisualElement(this.host));
  }
}
