import {Element, Component} from '@stencil/core';
import {containsVisualElement} from '../../../utils/utils';

/**
 * The title metadata section helps the information seeker understand some
 * fields that are in direct relationship with the item name. E.g.: in
 * commerce the rating of an item is closely tied to what the product is,
 * rather than a descriptive of the product.
 *
 * Behaviour:
 * * Has a very small font size
 * * Is the closest element underneath the title section
 */
@Component({
  tag: 'atomic-result-section-title-metadata',
  shadow: false,
})
export class AtomicResultSectionTitleMetadata {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    this.host.classList.toggle('empty', !containsVisualElement(this.host));
  }
}
