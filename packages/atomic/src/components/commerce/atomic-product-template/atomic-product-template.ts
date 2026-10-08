import {type Product, ProductTemplatesHelpers} from '@coveo/headless/commerce';
import {customElement} from 'lit/decorators.js';
import {CommerceResultTemplateElement} from '@/src/components/commerce/product-list/commerce-result-template-element';
import '../atomic-product/atomic-product';

/**
 * A product template determines the format of the products, depending on the conditions that are defined for each template.
 *
 * @MapProp name: mustMatch;attr: must-match;docs: The field and values that must be matched by a product item for the template to apply. For example, a template with the following attribute only applies to product items whose `filetype` is `lithiummessage` or `YouTubePlaylist`: `must-match-filetype="lithiummessage,YouTubePlaylist"`;type: Record<string, string[]> ;default: {}
 * @MapProp name: mustNotMatch;attr: must-not-match;docs: The field and values that must not be matched by a product item for the template to apply. For example, a template with the following attribute only applies to product items whose `filetype` is not `lithiummessage`: `must-not-match-filetype="lithiummessage";type: Record<string, string[]> ;default: {}
 * @slot default - The default slot where to insert the template element.
 * @slot link - A `template` element that contains a single `atomic-product-link` component.
 */
@customElement('atomic-product-template')
export class AtomicProductTemplate extends CommerceResultTemplateElement<Product> {
  protected readonly templateHelpers = ProductTemplatesHelpers;

  constructor() {
    super([
      'atomic-commerce-product-list',
      'atomic-commerce-recommendation-list',
      'atomic-commerce-search-box-instant-products',
    ]);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-template': AtomicProductTemplate;
  }
}
