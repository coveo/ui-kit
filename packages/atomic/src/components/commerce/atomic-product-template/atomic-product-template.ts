import type {
  ProductTemplate,
  ProductTemplateCondition,
} from '@coveo/headless/commerce';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {LitElementWithError} from '@/src/decorators/types';
import {mapProperty} from '@/src/utils/props-utils';
import {makeMatchConditions} from '../../common/product-template/product-template-common';
import {ProductTemplateController} from '../../common/product-template/product-template-controller';
import '../atomic-commerce-text/atomic-commerce-text';
import '../atomic-product-text/atomic-product-text';
import '../atomic-product-link/atomic-product-link';
import '../atomic-product/atomic-product';
import '../atomic-product-excerpt/atomic-product-excerpt';
import '../atomic-product-children/atomic-product-children';
import '../atomic-product-price/atomic-product-price';
import '../atomic-product-numeric-field-value/atomic-product-numeric-field-value';

/**
 * * A product template determines the format of the query results, depending on the conditions that are defined for each template.
 *
 * A `template` element must be the child of an `atomic-product-template`. Furthermore, an `atomic-commerce-product-list`, `atomic-commerce-recommendation-list`, or `atomic-commerce-search-box-instant-products` must be the parent of each `atomic-product-template`.
 *
 * **Note:** Any `<script>` tags that are defined inside a `<template>` element will not be executed when the products are being rendered.
 * @MapProp name: mustMatch;attr: must-match;docs: The field and values that must be matched by a product item for the template to apply. For example, a template with the following attribute only applies to product items whose `filetype` is `lithiummessage` or `YouTubePlaylist`: `must-match-filetype="lithiummessage,YouTubePlaylist"`;type: Record<string, string[]> ;default: {}
 * @MapProp name: mustNotMatch;attr: must-not-match;docs: The field and values that must not be matched by a product item for the template to apply. For example, a template with the following attribute only applies to product items whose `filetype` is not `lithiummessage`: `must-not-match-filetype="lithiummessage";type: Record<string, string[]> ;default: {}
 * @slot default - The default slot where to insert the template element.
 * @slot link - A `template` element that contains a single `atomic-product-link` component.
 *
 * @alpha
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
  @property({type: Array})
  conditions: ProductTemplateCondition[] = [];

  /**
   * The field and values that define which result items the condition must be applied to.
   * For example, a template with the following attribute only applies to result items whose `filetype` is `lithiummessage` or `YouTubePlaylist`:
   * `must-match-filetype="lithiummessage,YouTubePlaylist"`
   * @type {Record<string, string[]>}
   * @default {}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-match'})
  mustMatch!: Record<string, string[]>;

  /**
   * The field and values that define which result items the condition must not be applied to.
   * For example, a template with the following attribute only applies to result items whose `filetype` is not `lithiummessage`:
   * `must-not-match-filetype="lithiummessage"`
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
      this.mustNotMatch
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
