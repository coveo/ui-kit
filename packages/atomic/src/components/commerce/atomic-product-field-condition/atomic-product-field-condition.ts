import type {ProductTemplateCondition} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createProductContextController} from '@/src/components/commerce/product-template-component-utils/product-template-controllers';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {mapProperty} from '@/src/utils/props-utils';
import {
  makeDefinedConditions,
  makeMatchConditions,
} from '../../common/product-template/product-template-common';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-product-field-condition` component renders its children only when all of the conditions specified through its props are satisfied.
 * The condition properties can be based on any top-level product property of the `product` object, not restricted to fields (e.g., `ec_name`).
 *
 * @slot default - The content to render if the conditions are met.
 */
@customElement('atomic-product-field-condition')
@bindings()
export class AtomicProductFieldCondition
  extends LightDomMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  @state() bindings!: CommerceBindings;
  @state() error!: Error;

  private productController = createProductContextController(this);

  /**
   * A condition that is satisfied when the specified field is defined on a product (e.g., `if-defined="cat_gender"` is satisfied when a product has the `cat_gender` field).
   */
  @property({type: String, attribute: 'if-defined'}) ifDefined?: string;

  /**
   * A condition that is satisfied when the specified field is not defined on a product (e.g., `if-not-defined="cat_gender"` is satisfied when a product does not have the `cat_gender` field).
   */
  @property({type: String, attribute: 'if-not-defined'}) ifNotDefined?: string;

  /**
   * A condition that is satisfied when the specified field matches one of the specified values on a product (e.g., `must-match-ec_color="Pink,Purple"` is satisfied when a product is either pink or purple).
   * @type {Record<string, string[]>}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-match'})
  mustMatch!: Record<string, string[]>;

  /**
   * A condition that is satisfied when the specified field does not match any of the specified values on a product (e.g., `must-not-match-ec_color="Green,Black"` is satisfied when a product is neither green nor black).
   * @type {Record<string, string[]>}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-not-match'})
  mustNotMatch!: Record<string, string[]>;

  initialize() {}

  private get conditions(): ProductTemplateCondition[] {
    return [
      ...makeDefinedConditions(this.ifDefined, this.ifNotDefined),
      ...makeMatchConditions(this.mustMatch, this.mustNotMatch),
    ];
  }

  @errorGuard()
  render() {
    const product = this.productController.item;

    if (!product || !this.conditions.every((condition) => condition(product))) {
      this.remove();
    }

    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-field-condition': AtomicProductFieldCondition;
  }
}
