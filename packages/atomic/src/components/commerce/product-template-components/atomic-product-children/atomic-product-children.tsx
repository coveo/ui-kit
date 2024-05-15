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
  Method,
} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {Carousel} from '../../../common/carousel';
import {CommerceBindings} from '../../atomic-commerce-interface/atomic-commerce-interface';
import {ProductContext} from '../product-template-decorators';

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

  @State() private children: (Product | ChildProduct)[] = [];
  @State() private currentPage = 0;

  public error!: Error;
  private originalParentProduct: Product | null = null;

  // TODO: there's a totalNumberOfRelatedProducts property on the Product that could be used to do server-side pagination. However I'm not sure how to (or even if we can) fetch additional related products with the commerce API
  // TODO: remove this prop; we'll want the carousel to automatically kick in at the proper responsive breakpoint instead.
  @Prop() public childrenPerPage: number = 6;

  /**
   * The non-localized label to display for the product children section.
   */
  @Prop() public label: string = 'available-in';

  @Event({
    eventName: 'atomic/hoverChildProduct',
    bubbles: true,
  })
  public hoverChildProduct!: EventEmitter<{
    hoveredChildProduct: ChildProduct;
    currentParentProductId: string;
    originalParentProduct: Product;
  }>;

  constructor() {
    this.validateProps();
  }

  public connectedCallback(): void {
    this.originalParentProduct = this.isProduct(this.product.children[0])
      ? this.product.children[0]
      : this.product;
    this.children = [
      this.originalParentProduct,
      ...this.originalParentProduct.children,
    ];
  }

  private isProduct(child: Product | ChildProduct): child is Product {
    return 'children' in child;
  }

  private validateProps() {
    new Schema({
      label: new StringValue(),
    }).validate({
      label: this.label,
    });
  }

  private onHoverChild(
    hoveredChildProduct: ChildProduct,
    currentParentProductId: string
  ) {
    this.hoverChildProduct.emit({
      hoveredChildProduct,
      currentParentProductId,
      originalParentProduct: this.originalParentProduct ?? this.product,
    });
  }

  /**
   * Moves to the previous page, when the carousel is activated.
   */
  @Method() public async previousPage() {
    this.currentPage =
      this.currentPage - 1 < 0 ? this.numberOfPages - 1 : this.currentPage - 1;
  }

  /**
   * Moves to the next page, when the carousel is activated.
   */
  @Method() public async nextPage() {
    this.currentPage = (this.currentPage + 1) % this.numberOfPages;
  }

  private get numberOfPages() {
    return Math.ceil(this.children.length / this.childrenPerPage!);
  }

  private get currentIndex() {
    return Math.abs(
      (this.currentPage * this.childrenPerPage) % this.children.length
    );
  }

  private get subsetOfChildren() {
    if (!this.childrenPerPage) {
      return this.children;
    }

    return this.children.slice(
      this.currentIndex,
      this.currentIndex + this.childrenPerPage
    );
  }

  private renderCarousel() {
    return (
      <Carousel
        bindings={this.bindings}
        currentPage={this.currentPage}
        nextPage={() => this.nextPage()}
        previousPage={() => this.previousPage()}
        numberOfPages={this.numberOfPages}
      >
        {this.subsetOfChildren.map((child) => this.renderChild(child))}
      </Carousel>
    );
  }

  // TODO: get rid of most of the inline styles; in most cases we'll use the generic stuff.
  private renderChild(child: ChildProduct) {
    return (
      <div class="inline-block">
        <div
          class={`flex mt-2 mr-3 w-8 h-8 ${this.product.permanentid === child.permanentid ? ' active-child ' : ' '}bg-contain bg-no-repeat cursor-pointer text-xs`}
          title={child.ec_name}
          style={{backgroundImage: `url(${child.ec_images![0]})`}}
          data-src={child.ec_thumbnails![0]}
          onMouseEnter={() =>
            this.onHoverChild(child, this.product.permanentid)
          }
        ></div>
      </div>
    );
  }

  // TODO: use correct semantic element (button? a?) to enable tab navigation.
  public render() {
    if (this.children.length === 0) {
      return null;
    }

    return (
      <div class="w-full mb-2">
        <div class="font-semibold text-neutral-dark ">
          <atomic-commerce-text
            value={this.bindings.i18n.t(this.label)}
          ></atomic-commerce-text>
        </div>
        {this.children.length > this.childrenPerPage
          ? this.renderCarousel()
          : this.children.map((child) => this.renderChild(child))}
      </div>
    );
  }
}
