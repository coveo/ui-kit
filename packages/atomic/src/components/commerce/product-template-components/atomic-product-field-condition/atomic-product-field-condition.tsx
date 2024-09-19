import {Product, ProductTemplateCondition} from '@coveo/headless/commerce';
import {Component, Prop, h, Element} from '@stencil/core';
import {MapProp} from '../../../../utils/props-utils';
import {
  makeDefinedConditions,
  makeMatchConditions,
} from '../../product-template/product-template-common';
import {ProductContext} from '../product-template-decorators';

/**
 * The `atomic-product-field-condition` component takes a list of conditions that, if fulfilled, apply the template in which it's defined.
 * The condition properties can be based on any top-level product property of the `product` object, not restricted to fields (e.g., `ec_name`).
 * @alpha
 */
@Component({
  tag: 'atomic-product-field-condition',
  shadow: false,
})
export class AtomicProductFieldCondition {
  @Element() host!: HTMLElement;

  /**
   * Verifies whether the specified fields are defined.
   */
  @Prop({reflect: true}) ifDefined?: string;
  /**
   * Verifies whether the specified fields are not defined.
   */
  @Prop({reflect: true}) ifNotDefined?: string;

  @MapProp({splitValues: true}) mustMatch: Record<string, string[]> = {};

  @MapProp({splitValues: true}) mustNotMatch: Record<string, string[]> = {};

  private conditions: ProductTemplateCondition[] = [];
  private shouldBeRemoved = false;

  @ProductContext() private product!: Product;

  public componentWillLoad() {
    this.conditions = makeDefinedConditions(this.ifDefined, this.ifNotDefined);
    this.conditions.push(
      ...makeMatchConditions(this.mustMatch, this.mustNotMatch)
    );
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
