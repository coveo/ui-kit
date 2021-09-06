import {Element, Component} from '@stencil/core';
import {containsVisualElement} from '../../../utils/utils';

/**
 * This section identifies the item by its name, and its main use is to make the result list scannable.
 * This is usually the page title.
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
