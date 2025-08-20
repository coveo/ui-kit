import type {InteractiveProduct, Product} from '@coveo/headless/commerce';
import {type CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ref} from 'lit/directives/ref.js';
import type {DisplayConfig} from '@/src/components/common/item-list/context/item-display-config-context-controller';
import {
  type ItemRenderingFunction,
  resultComponentClass,
} from '@/src/components/common/item-list/item-list-common';
import {
  type ItemDisplayDensity,
  type ItemDisplayImageSize,
  type ItemDisplayLayout,
  ItemLayout,
} from '@/src/components/common/layout/display-options';
import {booleanConverter} from '@/src/converters/boolean-converter';
import type {
  InteractiveProductContextEvent,
  ProductContextEvent,
} from '@/src/decorators/commerce/product-template-decorators';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {parentNodeToString} from '@/src/utils/dom-utils';
import type {CommerceStore} from '../atomic-commerce-interface/store';
import type {CommerceRecommendationStore} from '../atomic-commerce-recommendation-interface/store';
import styles from './atomic-product.tw.css';

/**
 * The `atomic-product` component is used internally by the `atomic-commerce-product-list` and `atomic-commerce-recommendation-list` components.
 */
@customElement('atomic-product')
@withTailwindStyles
export class AtomicProduct extends ChildrenUpdateCompleteMixin(LitElement) {
  private layout!: ItemLayout;
  private productRootRef?: HTMLElement;
  private linkContainerRef?: HTMLElement;
  private executedRenderingFunctionOnce = false;

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
   * @default - An `atomic-result-link` without any customization.
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
    this.shadowRoot
      ?.querySelector<HTMLAnchorElement>(
        '.link-container > atomic-product-link a:not([slot])'
      )
      ?.click();
  };

  public async connectedCallback() {
    super.connectedCallback();

    if (!this.content) {
      console.warn(
        'AtomicProduct: content property is undefined. Cannot create layout.',
        this
      );
      return;
    }

    this.layout = new ItemLayout(
      this.content.children,
      this.display,
      this.density,
      this.imageSize
    );

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

  private get isCustomRenderFunctionMode() {
    return this.renderingFunction !== undefined;
  }

  private getContentHTML() {
    if (!this.content) {
      console.warn(
        'AtomicProduct: content property is undefined. Cannot get content HTML.',
        this
      );
      return '';
    }
    return parentNodeToString(this.content);
  }

  private getLinkHTML() {
    return parentNodeToString(this.linkContent ?? new HTMLElement());
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
    if (!this.layout) {
      return html`<div class=${resultComponentClass}></div>`;
    }

    return html`
      <div class=${resultComponentClass}>
        <div
          class="result-root ${this.layout
            .getClasses()
            .concat(this.classes)
            .join(' ')}"
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

  private getCombinedClasses(additionalContent?: string): string[] {
    const layoutClasses = this.layout
      ? this.layout.getClasses(additionalContent)
      : [];
    const extraClasses = this.classes.split(/\s+/).filter((c) => c);
    return [...layoutClasses, ...extraClasses];
  }

  private applyClassesToChildren(): void {
    if (!this.layout) {
      return;
    }
    const classes = this.getCombinedClasses();
    const root = this.shadowRoot?.querySelector('.result-root');
    if (!root) {
      return;
    }
    root.querySelectorAll('*').forEach((el) => {
      const tag = el.tagName.toLowerCase();
      if (tag.startsWith('atomic-product-')) {
        (el as HTMLElement).classList.add(...classes);
      }
    });
  }

  public updated(_changedProperties: Map<string, unknown>) {
    if (this.shouldExecuteRenderFunction()) {
      const customRenderOutputAsString = this.renderingFunction!(
        this.product,
        this.productRootRef!,
        this.linkContainerRef
      );

      if (this.layout) {
        const classes = this.getCombinedClasses(customRenderOutputAsString);
        this.productRootRef!.classList.add(...classes);
      }

      this.executedRenderingFunctionOnce = true;
    }

    if (!this.isCustomRenderFunctionMode) {
      this.applyClassesToChildren();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product': AtomicProduct;
  }
  interface HTMLElementEventMap {
    'atomic/resolveResult': ProductContextEvent;
    'atomic/resolveInteractiveResult': InteractiveProductContextEvent;
    'atomic/resolveStopPropagation': CustomEvent;
    'atomic/resolveResultDisplayConfig': ProductContextEvent<DisplayConfig>;
  }
}
