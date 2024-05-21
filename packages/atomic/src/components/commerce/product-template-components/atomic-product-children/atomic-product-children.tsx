import {Schema, StringValue} from '@coveo/bueno';
import {Product, ChildProduct} from '@coveo/headless/commerce';
import {
  Component,
  h,
  Element,
  Prop,
  Event,
  EventEmitter,
  State,
} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {CommerceBindings} from '../../atomic-commerce-interface/atomic-commerce-interface';
import {ProductContext} from '../product-template-decorators';

export interface SelectChildProductEventArgs {
  childPermanentId: string;
  parentPermanentId: string;
}

/**
 * @internal
 * The `atomic-product-children` component renders a section that allows the user to select a nested product (e.g., a color variant of a given product)
 *
 * This component leverages the [product grouping](https://docs.coveo.com/en/l78i2152/) feature.
 */
@Component({
  tag: 'atomic-product-children',
  styleUrl: 'atomic-product-children.pcss',
  shadow: false,
})
export class AtomicProductChildren
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  @ProductContext() private product!: Product;

  @Element() hostElement!: HTMLElement;

  @State() private children: ChildProduct[] = [];
  @State() private activeChildId: string = '';

  public error!: Error;

  // TODO: there's a totalNumberOfRelatedProducts property on the Product that could be used to do server-side pagination. However I'm not sure how to (or even if we can) fetch additional related products with the commerce API

  /**
   * The non-localized label to display for the product children section.
   */
  @Prop() public label: string = 'available-in';

  @Event({
    eventName: 'atomic/selectChildProduct',
    bubbles: true,
  })
  public selectChildProduct!: EventEmitter<SelectChildProductEventArgs>;

  constructor() {
    this.validateProps();
  }

  public connectedCallback(): void {
    this.activeChildId = this.product.permanentid;
    this.children = this.product.children ?? [];
  }

  private validateProps() {
    new Schema({
      label: new StringValue(),
    }).validate({
      label: this.label,
    });
  }

  private onSelectChild(childPermanentId: string, parentPermanentId: string) {
    this.activeChildId = childPermanentId;
    this.selectChildProduct.emit({
      childPermanentId,
      parentPermanentId,
    });
  }

  private renderChild(child: ChildProduct) {
    return (
      <div class="inline-block">
        <button
          class={`w-8 h-8${child.permanentid === this.activeChildId ? ' box-border rounded border border-primary ' : ' '}bg-contain bg-no-repeat`}
          title={child.ec_name}
          style={{backgroundImage: `url(${child.ec_images![0]})`}}
          data-src={child.ec_thumbnails![0]}
          onMouseEnter={() =>
            this.onSelectChild(child.permanentid, this.product.permanentid)
          }
          onClick={() =>
            this.onSelectChild(child.permanentid, this.product.permanentid)
          }
        ></button>
      </div>
    );
  }

  public render() {
    if (this.children.length === 0) {
      return null;
    }

    return (
      <div>
        <div class="font-semibold text-neutral-dark mb-2">
          <atomic-commerce-text
            value={this.bindings.i18n.t(this.label)}
          ></atomic-commerce-text>
        </div>
        {this.children.map((child) => this.renderChild(child))}
      </div>
    );
  }
}
