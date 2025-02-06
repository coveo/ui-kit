import {Schema, StringValue} from '@coveo/bueno';
import {
  Product,
  ChildProduct,
  ProductTemplatesHelpers,
} from '@coveo/headless/commerce';
import {
  Component,
  h,
  Element,
  Prop,
  Event,
  EventEmitter,
  State,
  Host,
} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {filterProtocol} from '../../../../utils/xss-utils';
import {Button} from '../../../common/stencil-button';
import {CommerceBindings} from '../../atomic-commerce-interface/atomic-commerce-interface';
import {ProductContext} from '../product-template-decorators';

export interface SelectChildProductEventArgs {
  child: ChildProduct;
}

/**
 * @alpha
 * The `atomic-product-children` component renders a section that allows the user to select a nested product (e.g., a color variant of a given product).
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

  /**
   * The non-localized label to display for the product children section.
   *
   * Set this to an empty string if you do not want to render the label at all.
   */
  @Prop() public label: string = 'available-in';

  /**
   * The child product field to use to render product children images. Fields in the `additionalFields` property of the child products are supported.
   *
   * This field should be defined on each child product, and its value should be an image URL (or an array of image URLs, in which case the component will use the first one in the array).
   */
  @Prop({reflect: true}) field: string = 'ec_thumbnails';

  /**
   * A fallback image URL to use when the specified `field` is not defined on a given child product, or when its value is invalid.
   */
  @Prop({reflect: true}) fallback: string =
    // eslint-disable-next-line @cspell/spellchecker
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Crect width="50" height="50" fill="none" stroke="gray"%3E%3C/rect%3E%3C/svg%3E';

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
      field: new StringValue(),
      fallback: new StringValue(),
    }).validate({
      label: this.label,
      field: this.field,
      fallback: this.fallback,
    });
  }

  private onSelectChild(child: ChildProduct) {
    this.activeChildId = child.permanentid;
    this.selectChildProduct.emit({
      child,
    });
  }

  private getImageUrl(child: ChildProduct) {
    const value = ProductTemplatesHelpers.getProductProperty(child, this.field);

    if (typeof value === 'string') {
      return filterProtocol(value);
    }

    if (Array.isArray(value) && typeof value[0] === 'string') {
      return filterProtocol(value[0]);
    }

    return filterProtocol(this.fallback);
  }

  private get activeChildClasses() {
    return ' box-border rounded border border-primary ';
  }

  // TODO: We could leverage the totalNumberOfRelatedProducts property on the Product to show the number of available children (e.g., ...and 3 more). This would require some UX design however.
  private renderChild(child: ChildProduct) {
    return (
      <button
        class={`product-child${child.permanentid === this.activeChildId ? this.activeChildClasses : ' '}`}
        title={child.ec_name || undefined}
        onKeyPress={(event) =>
          event.key === 'Enter' && this.onSelectChild(child)
        }
        onMouseEnter={() => this.onSelectChild(child)}
        onTouchStart={(event) => {
          event.stopPropagation();
          event.preventDefault();
          this.onSelectChild(child);
        }}
      >
        <img
          class="aspect-square p-1"
          src={this.getImageUrl(child)}
          alt={child.ec_name || undefined}
          loading="lazy"
        />
      </button>
    );
  }

  private renderLabel() {
    return (
      <div class="text-neutral-dark my-2 font-semibold">
        <atomic-commerce-text
          value={this.bindings.i18n.t(this.label)}
        ></atomic-commerce-text>
      </div>
    );
  }

  public render() {
    if (this.children.length === 0) {
      return null;
    }

    return (
      <Host>
        {this.label.trim() !== '' && this.renderLabel()}
        <div class="children-container">
          {this.children.map((child) => this.renderChild(child))}
          <Button style="text-primary" class="product-child plus-button">
            +{this.children.length - 5}
          </Button>
        </div>
      </Host>
    );
  }
}
