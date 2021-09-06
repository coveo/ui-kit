import {Element, Component} from '@stencil/core';
import {containsVisualElement} from '../../../utils/utils';

/**
 * This section displays additional descriptive information about the item.
 *
 * Behaviour:
 * * Has a maximum height of two lines.
 * ** We recommend that you use `atomic-result-fields-list` to ensure that the fields in this section don’t overflow.
 * * Exposes the `--line-height` variable so child elements can adjust to the current line height.
 * * Has a text color.
 * * Has a font weight.
 */
@Component({
  tag: 'atomic-result-section-bottom-metadata',
  shadow: false,
})
export class AtomicResultSectionBottomMetadata {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    this.host.classList.toggle('empty', !containsVisualElement(this.host));
  }
}
