import type {InteractiveProduct, Product} from '@coveo/headless/commerce';
import {type CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ref} from 'lit/directives/ref.js';
import type {CommerceStore} from '@/src/components/commerce/atomic-commerce-interface/store';
import type {CommerceRecommendationStore} from '@/src/components/commerce/atomic-commerce-recommendation-interface/store';
import type {
  InteractiveProductContextEvent,
  ProductContextEvent,
} from '@/src/components/commerce/product-template-component-utils/context/product-context-controller';
import type {DisplayConfig} from '@/src/components/common/item-list/context/item-display-config-context-controller';
import {
  type ItemRenderingFunction,
  resultComponentClass,
} from '@/src/components/common/item-list/item-list-common';
import {CustomRenderController} from '@/src/components/common/layout/custom-render-controller';
import {ItemLayoutController} from '@/src/components/common/layout/item-layout-controller';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '@/src/components/common/layout/item-layout-utils';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {parentNodeToString} from '@/src/utils/dom-utils';
import styles from './atomic-product.tw.css';
import '../atomic-product-text/atomic-product-text';
import '../atomic-product-link/atomic-product-link';
import '../atomic-product-image/atomic-product-image';

/**
 * The `atomic-product` component is used internally by the `atomic-commerce-product-list` and `atomic-commerce-recommendation-list` components.
 */
@customElement('atomic-product')
@withTailwindStyles
export class AtomicProduct extends ChildrenUpdateCompleteMixin(LitElement) {
  private productRootRef?: HTMLElement;
  private linkContainerRef?: HTMLElement;
  private itemLayoutController!: ItemLayoutController;

  static styles: CSSResultGroup = styles;

  /**
   * Whether `atomic-product-link` components nested in the `atomic-product` should stop click event propagation.
   */
  @property({
    attribute: 'stop-propagation',
    type: Boolean,
    converter: booleanConverter,
    reflect: true,
  })
  stopPropagation?: boolean;

  /**
   * The product item.
   */
  @property({type: Object}) product!: Product;

  /**
   * The InteractiveProduct item.
   */
  @property({type: Object, attribute: 'interactive-product'})
  interactiveProduct!: InteractiveProduct;

  /**
   * Global Atomic state.
   */
  @property({type: Object}) store?: CommerceStore | CommerceRecommendationStore;

  /**
   * The product content to display.
   */
  @property({type: Object}) content?: ParentNode;

  /**
   * The product link to use when the product is clicked in a grid layout.
   *
   * @default - An `atomic-product-link` without any customization.
   */
  @property({type: Object, attribute: 'link-content'}) linkContent: ParentNode =
    new DocumentFragment();

  /**
   * How products should be displayed.
   */
  @property({reflect: true, type: String}) display: ItemDisplayLayout = 'list';

  /**
   * How large or small products should be.
   */
  @property({reflect: true, type: String}) density: ItemDisplayDensity =
    'normal';

  /**
   * The size of the visual section in product list items.
   *
   * This is overwritten by the image size defined in the product content, if it exists.
   */
  @property({reflect: true, type: String, attribute: 'image-size'})
  imageSize: ItemDisplayImageSize = 'icon';

  /**
   * The classes to add to the product element.
   */
  @property({type: String}) classes = '';

  /**
   * A unique identifier for tracking the loading state of this product component.
   * When set, this flag is added to the global loading flags array and automatically
   * removed when the component finishes its initial render. This allows the framework
   * to determine when all components have finished loading.
   *
   * @internal
   */
  @property({type: String, attribute: 'loading-flag'}) loadingFlag?: string;

  /**
   * Internal function used in advanced setups, which lets you bypass the standard HTML template system.
   * Particularly useful for Atomic React.
   *
   * @internal
   */
  @property({type: Object, attribute: 'rendering-function'})
  renderingFunction: ItemRenderingFunction;

  public resolveProduct = (event: ProductContextEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.product);
  };

  public resolveInteractiveProduct = (
    event: InteractiveProductContextEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (this.interactiveProduct) {
      event.detail(this.interactiveProduct);
    }
  };

  public resolveStopPropagation = (event: CustomEvent) => {
    event.detail(this.stopPropagation);
  };

  public resolveProductDisplayConfig = (
    event: ProductContextEvent<DisplayConfig>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    event.detail({
      density: this.density,
      imageSize: this.imageSize!,
    });
  };

  public handleClick = (event: MouseEvent) => {
    if (this.stopPropagation) {
      event.stopPropagation();
    }
    if (this.display === 'grid') {
      this.clickLinkContainer();
    }
  };

  public clickLinkContainer = () => {
    this.shadowRoot
      ?.querySelector<HTMLAnchorElement>(
        '.link-container > atomic-product-link a:not([slot])'
      )
      ?.click();
  };

  public async connectedCallback() {
    super.connectedCallback();

    new CustomRenderController(this, {
      renderingFunction: () => this.renderingFunction,
      itemData: () => this.product,
      rootElementRef: () => this.productRootRef,
      linkContainerRef: () => this.linkContainerRef,
      onRenderComplete: (element, output) => {
        this.itemLayoutController.applyLayoutClassesToElement(element, output);
      },
    });

    this.itemLayoutController = new ItemLayoutController(this, {
      elementPrefix: 'atomic-product',
      renderingFunction: () => this.renderingFunction,
      content: () => this.content,
      layoutConfig: () => ({
        display: this.display,
        density: this.density,
        imageSize: this.imageSize,
      }),
      itemClasses: () => this.classes,
    });

    this.addEventListener(
      'atomic/resolveResult',
      this.resolveProduct as EventListener
    );
    this.addEventListener(
      'atomic/resolveInteractiveResult',
      this.resolveInteractiveProduct as EventListener
    );
    this.addEventListener(
      'atomic/resolveStopPropagation',
      this.resolveStopPropagation as EventListener
    );
    this.addEventListener(
      'atomic/resolveResultDisplayConfig',
      this.resolveProductDisplayConfig as EventListener
    );
    this.addEventListener('click', this.handleClick);

    await this.getUpdateComplete();
    this.classList.add('hydrated');
  }

  public disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener(
      'atomic/resolveResult',
      this.resolveProduct as EventListener
    );
    this.removeEventListener(
      'atomic/resolveInteractiveResult',
      this.resolveInteractiveProduct as EventListener
    );
    this.removeEventListener(
      'atomic/resolveStopPropagation',
      this.resolveStopPropagation as EventListener
    );
    this.removeEventListener(
      'atomic/resolveResultDisplayConfig',
      this.resolveProductDisplayConfig as EventListener
    );
    this.removeEventListener('click', this.handleClick);
  }

  private getContentHTML() {
    if (!this.content) {
      console.warn(
        'atomic-product: content property is undefined. Cannot get content HTML.',
        this
      );
      return '';
    }
    return parentNodeToString(this.content);
  }

  private getLinkHTML() {
    return parentNodeToString(this.linkContent ?? new HTMLElement());
  }

  public render() {
    if (this.renderingFunction !== undefined) {
      return html`
        <div class=${resultComponentClass}>
          <div
            class="result-root"
            ${ref((el) => {
              this.productRootRef = el as HTMLElement;
            })}
          ></div>
          <div
            class="link-container"
            ${ref((el) => {
              this.linkContainerRef = el as HTMLElement;
            })}
          ></div>
        </div>
      `;
    }
    // Handle case where content is undefined and layout was not created
    if (!this.itemLayoutController.getLayout()) {
      return html`<div class=${resultComponentClass}></div>`;
    }

    return html`
      <div class=${resultComponentClass}>
        <div
          class="result-root ${this.itemLayoutController.getCombinedClasses().join(' ')}"
          .innerHTML=${this.getContentHTML()}
        ></div>
        <div class="link-container" .innerHTML=${this.getLinkHTML()}></div>
      </div>
    `;
  }

  public firstUpdated(_changedProperties: Map<string, unknown>) {
    if (this.loadingFlag && this.store) {
      this.store.unsetLoadingFlag(this.loadingFlag);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product': AtomicProduct;
  }
}
