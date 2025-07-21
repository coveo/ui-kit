import type {ProductTemplateCondition} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindings} from '@/src/decorators/bindings';
import {createProductContextController} from '@/src/decorators/commerce/product-template-decorators';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {mapProperty} from '@/src/utils/props-utils';
import {
  makeDefinedConditions,
  makeMatchConditions,
} from '../../common/product-template/product-template-common';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-product-field-condition` component takes a list of conditions that, if fulfilled, apply the template in which it's defined.
 * The condition properties can be based on any top-level product property of the `product` object, not restricted to fields (e.g., `ec_name`).
 * @alpha
 */
@customElement('atomic-product-field-condition')
@bindings()
export class AtomicProductFieldCondition
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  createRenderRoot() {
    return this;
  }

  @state() bindings!: CommerceBindings;
  @state() error!: Error;

  private productController = createProductContextController(this);

  /**
   * Verifies whether the specified fields are defined.
   */
  @property({type: String, attribute: 'if-defined'}) ifDefined?: string;

  /**
   * Verifies whether the specified fields are not defined.
   */
  @property({type: String, attribute: 'if-not-defined'}) ifNotDefined?: string;

  /**
   * Verifies whether the specified fields match the specified values.
   * @type {Record<string, string[]>}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-match-'})
  mustMatch: Record<string, string[]> = {};

  /**
   * Verifies whether the specified fields do not match the specified values.
   * @type {Record<string, string[]>}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-not-match-'})
  mustNotMatch: Record<string, string[]> = {};

  shouldBeRemoved = false;

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
