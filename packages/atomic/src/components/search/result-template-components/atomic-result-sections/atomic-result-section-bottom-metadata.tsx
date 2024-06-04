import {Element, Component} from '@stencil/core';
import {hideEmptySection} from '../../../../utils/item-section-utils';

/**
 * This section displays additional descriptive information about the item.
 *
 * Behavior:
 * * Has a maximum height of two lines.
 * ** We recommend that you use `atomic-result-fields-list` to ensure that the fields in this section don’t overflow.
 * * Exposes the `--line-height` variable so child elements can adjust to the current line height.
 * * Has a defined CSS `color` property for text.
 * * Has a font weight.
 */
@Component({
  tag: 'atomic-result-section-bottom-metadata',
  shadow: false,
})
export class AtomicResultSectionBottomMetadata {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    hideEmptySection(this.host);
  }
}
