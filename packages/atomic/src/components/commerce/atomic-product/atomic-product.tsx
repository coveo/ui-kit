import {Product, InteractiveProduct} from '@coveo/headless/commerce';
import {Component, h, Prop, Element, Listen, Host} from '@stencil/core';
import {parentNodeToString} from '../../../utils/dom-utils';
import {applyFocusVisiblePolyfill} from '../../../utils/initialization-utils';
import {
  AtomicCommonStore,
  AtomicCommonStoreData,
} from '../../common/interface/store';
import {DisplayConfig} from '../../common/item-list/item-decorators';
import {
  ItemRenderingFunction,
  resultComponentClass,
} from '../../common/item-list/item-list-common';
import {
  ItemLayout,
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '../../common/layout/display-options';
import {
  InteractiveProductContextEvent,
  ProductContextEvent,
} from '../product-template-components/product-template-decorators';

/**
 * The `atomic-product` component is used internally by the `atomic-commerce-product-list` component.
 * @alpha
 */
@Component({
  tag: 'atomic-product',
  styleUrl: 'atomic-product.pcss',
  shadow: true,
})
export class AtomicProduct {
  private layout!: ItemLayout;

  @Element() host!: HTMLElement;

  /**
   * Whether an atomic-product-link inside atomic-product should stop click event propagation.
   */
  @Prop() stopPropagation?: boolean;

  /**
   * The product item.
   */
  @Prop() product!: Product;

  /**
   * The InteractiveProduct item.
   * @alpha
   */
  @Prop() interactiveProduct!: InteractiveProduct;

  /**
   * Global Atomic state.
   * @alpha
   */
  @Prop() store?: AtomicCommonStore<AtomicCommonStoreData>;

  /**
   * The product content to display.
   */
  @Prop() content?: ParentNode;

  /**
   * The product link to use when the product is clicked in a grid layout.
   *
   * @default - An `atomic-result-link` without any customization.
   */
  @Prop() linkContent: ParentNode = new DocumentFragment();

  /**
   * How products should be displayed.
   */
  @Prop() display: ItemDisplayLayout = 'list';

  /**
   * How large or small products should be.
   */
  @Prop() density: ItemDisplayDensity = 'normal';

  /**
   * The size of the visual section in product list items.
   *
   * This is overwritten by the image size defined in the product content, if it exists.
   */
  @Prop() imageSize: ItemDisplayImageSize = 'icon';

  /**
   * The classes to add to the product element.
   */
  @Prop() classes = '';

  /**
   * @alpha
   */
  @Prop() loadingFlag?: string;

  /**
   * Internal function used in advanced setups, which lets you bypass the standard HTML template system.
   * Particularly useful for Atomic React
   *
   * @alpha
   */
  @Prop() renderingFunction: ItemRenderingFunction;

  private productRootRef?: HTMLElement;
  private linkContainerRef?: HTMLElement;
  private executedRenderingFunctionOnce = false;

  @Listen('atomic/resolveResult')
  public resolveProduct(event: ProductContextEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.product);
  }

  @Listen('atomic/resolveInteractiveResult')
  public resolveInteractiveProduct(event: InteractiveProductContextEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (this.interactiveProduct) {
      event.detail(this.interactiveProduct);
    }
  }

  @Listen('atomic/resolveStopPropagation')
  public resolveStopPropagation(event: CustomEvent) {
    event.detail(this.stopPropagation);
  }

  @Listen('atomic/resolveResultDisplayConfig')
  public resolveProductDisplayConfig(
    event: ProductContextEvent<DisplayConfig>
  ) {
    event.preventDefault();
    event.stopPropagation();
    event.detail({
      density: this.density,
      imageSize: this.imageSize!,
    });
  }

  public connectedCallback() {
    this.layout = new ItemLayout(
      this.content!.children,
      this.display,
      this.density,
      this.imageSize
    );
  }

  private get isCustomRenderFunctionMode() {
    return this.renderingFunction !== undefined;
  }

  private getContentHTML() {
    return parentNodeToString(this.content!);
  }

  private getLinkHTML() {
    return parentNodeToString(this.linkContent ?? new HTMLElement());
  }

  @Listen('click')
  public handleClick(event: MouseEvent) {
    if (this.stopPropagation) {
      event.stopPropagation();
    }
    this.host
      .shadowRoot!.querySelector<HTMLAnchorElement>(
        '.link-container > atomic-product-link a:not([slot])'
      )
      ?.click();
  }

  private shouldExecuteRenderFunction() {
    return (
      this.isCustomRenderFunctionMode &&
      this.productRootRef &&
      !this.executedRenderingFunctionOnce
    );
  }

  public render() {
    if (this.isCustomRenderFunctionMode) {
      return (
        <Host class={resultComponentClass}>
          <div
            class="result-root"
            ref={(ref) => (this.productRootRef = ref)}
          ></div>
          <div
            class="link-container"
            ref={(ref) => (this.linkContainerRef = ref)}
          ></div>
        </Host>
      );
    }
    return (
      <Host class={resultComponentClass}>
        <div
          class={`result-root ${this.layout
            .getClasses()
            .concat(this.classes)
            .join(' ')}`}
          innerHTML={this.getContentHTML()}
        ></div>
        <div class="link-container" innerHTML={this.getLinkHTML()}></div>
      </Host>
    );
  }

  public componentDidLoad() {
    if (this.loadingFlag && this.store) {
      this.store.unsetLoadingFlag(this.loadingFlag);
    }
    applyFocusVisiblePolyfill(this.host);
  }

  public componentDidRender() {
    if (this.shouldExecuteRenderFunction()) {
      const customRenderOutputAsString = this.renderingFunction!(
        this.product,
        this.productRootRef!,
        this.linkContainerRef!
      );

      this.productRootRef!.className += ` ${this.layout
        .getClasses(customRenderOutputAsString)
        .concat(this.classes)
        .join(' ')}`;

      this.executedRenderingFunctionOnce = true;
    }
  }
}
