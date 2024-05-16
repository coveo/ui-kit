import {Component, Prop, h} from '@stencil/core';
import {Product, ProductTemplatesHelpers} from '@coveo/headless/commerce';
import {ProductContext} from '../product-template-decorators';

/**
 * The `atomic-product-field-condition` component takes a list of conditions that, if fulfilled, apply the template in which it's defined.
 * The condition properties can be based on any top-level product property of the `product` object, not restricted to fields (e.g., `ec_brand`).
 */
@Component({
  tag: 'atomic-product-field-condition',
  shadow: true,
})
export class AtomicProductFieldCondition {
  @ProductContext() private product!: Product;

  /**
   * Verifies whether the specified fields are defined.
   */
  @Prop({reflect: true}) ifDefined?: string;
  /**
   * Verifies whether the specified fields are not defined.
   */
  @Prop({reflect: true}) ifNotDefined?: string;

  private shouldBeRemoved = false;
  private conditions: ((product: Product) => boolean)[] = [];

  public componentWillLoad() {
    if (this.ifDefined) {
      const fieldNames = this.ifDefined.split(',');
      this.conditions.push(
        ProductTemplatesHelpers.fieldsMustBeDefined(fieldNames)
      );
    }

    if (this.ifNotDefined) {
      const fieldNames = this.ifNotDefined.split(',');
      this.conditions.push(
        ProductTemplatesHelpers.fieldsMustNotBeDefined(fieldNames)
      );
    }
  }

  public render() {
    if (!this.conditions.every((condition) => condition(this.product))) {
      this.shouldBeRemoved = true;
      return '';
    }

    return <slot />;
  }

  public componentDidLoad() {
    this.shouldBeRemoved && this.host.remove();
  }
}
