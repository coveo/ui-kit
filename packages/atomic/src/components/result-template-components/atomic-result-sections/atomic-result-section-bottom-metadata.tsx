import {Element, Component} from '@stencil/core';
import {containsVisualElement} from '../../../utils/utils';

/**
 * The bottom metadata section helps the information seeker see additional
 * descriptive information about the item.
 *
 * Behaviour:
 * * Has a maximum height of two lines.
 *   * It’s recommended to use `atomic-result-fields-list` to ensure fields don’t overflow from this section.
 * * Exposes the `--line-height` CSS variable so child elements can adjust to the current line height.
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
