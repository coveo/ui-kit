import type {
  ProductTemplate,
  ProductTemplateCondition,
} from '@coveo/headless/commerce';
import {ProductTemplatesHelpers} from '@coveo/headless/commerce';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ProductTemplateController} from '@/src/components/common/product-template/product-template-controller';
import {makeMatchConditions} from '@/src/components/common/template-controller/template-utils';
import {errorGuard} from '@/src/decorators/error-guard';
import type {LitElementWithError} from '@/src/decorators/types';
import {mapProperty} from '@/src/utils/props-utils';
import '../atomic-product/atomic-product';
import {arrayConverter} from '@/src/converters/array-converter';

/**
 * A product template determines the format of the products, depending on the conditions that are defined for each template.
 *
 * @MapProp name: mustMatch;attr: must-match;docs: The field and values that must be matched by a product item for the template to apply. For example, a template with the following attribute only applies to product items whose `filetype` is `lithiummessage` or `YouTubePlaylist`: `must-match-filetype="lithiummessage,YouTubePlaylist"`;type: Record<string, string[]> ;default: {}
 * @MapProp name: mustNotMatch;attr: must-not-match;docs: The field and values that must not be matched by a product item for the template to apply. For example, a template with the following attribute only applies to product items whose `filetype` is not `lithiummessage`: `must-not-match-filetype="lithiummessage";type: Record<string, string[]> ;default: {}
 * @slot default - The default slot where to insert the template element.
 * @slot link - A `template` element that contains a single `atomic-product-link` component.
 */
@customElement('atomic-product-template')
export class AtomicProductTemplate
  extends LitElement
  implements LitElementWithError
{
  private productTemplateController: ProductTemplateController;

  @state() error!: Error;

  /**
   * A function that must return true on products for the product template to apply.
   * Set programmatically before initialization, not via attribute.
   *
   * For example, the following targets a template and sets a condition to make it apply only to products whose `ec_name` contains `singapore`:
   * `document.querySelector('#target-template').conditions = [(product) => /singapore/i.test(product.ec_name)];`
   */
  @property({attribute: false, type: Array, converter: arrayConverter})
  conditions: ProductTemplateCondition[] = [];

  /**
   * The field and values that define which products the condition must be applied to.
   * For example, a template with the following attribute only applies to products whose `ec_brand` is `Barca` or `Acme`:
   * `must-match-ec_brand="Barca,Acme"`
   * @type {Record<string, string[]>}
   * @default {}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-match'})
  mustMatch!: Record<string, string[]>;

  /**
   * The field and values that define which products the condition must not be applied to.
   * For example, a template with the following attribute only applies to products whose `ec_brand` is not `Barca`:
   * `must-not-match-ec_brand="Barca"`
   * @type {Record<string, string[]>}
   * @default {}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-not-match'})
  mustNotMatch!: Record<string, string[]>;

  constructor() {
    super();
    const validParent = [
      'atomic-commerce-product-list',
      'atomic-commerce-recommendation-list',
      'atomic-commerce-search-box-instant-products',
    ];
    const allowEmpty = true;
    this.productTemplateController = new ProductTemplateController(
      this,
      validParent,
      allowEmpty
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.productTemplateController.matchConditions = makeMatchConditions(
      this.mustMatch,
      this.mustNotMatch,
      ProductTemplatesHelpers
    );
  }

  /**
   * Gets the product template to apply based on the evaluated conditions.
   */
  public async getTemplate(): Promise<ProductTemplate<DocumentFragment> | null> {
    return this.productTemplateController.getTemplate(this.conditions);
  }

  @errorGuard()
  render() {
    return html`${nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-template': AtomicProductTemplate;
  }
}
