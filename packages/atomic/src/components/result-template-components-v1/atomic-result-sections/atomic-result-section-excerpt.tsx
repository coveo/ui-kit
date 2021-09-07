import {Element, Component} from '@stencil/core';
import {containsVisualElement} from '../../../utils/utils';

/**
 * This section contains an informative summary of the item's content.
 *
 * Behavior:
 * * Has a fixed height of one to three lines, depending on the layout and density.
 * * Ellipses overflowing text.
 * * Exposes the `--line-height` CSS variable so child elements can adjust to the current line height.
 * * Has a defined CSS `color` property for text.
 */
@Component({
  tag: 'atomic-result-section-excerpt',
  shadow: false,
})
export class AtomicResultSectionExcerpt {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    this.host.classList.toggle('empty', !containsVisualElement(this.host));
  }
}
