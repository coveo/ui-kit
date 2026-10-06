import type {InteractiveProduct, InteractiveSpotlightContent} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import {ref} from 'lit/directives/ref.js';
import type {CommerceStore} from '@/src/components/commerce/atomic-commerce-interface/store';
import type {CommerceRecommendationStore} from '@/src/components/commerce/atomic-commerce-recommendation-interface/store';
import type {ProductContextEvent} from '@/src/components/commerce/product-template-component-utils/context/product-context-controller';
import type {CommerceResult} from '@/src/components/commerce/product-template-component-utils/product-utils';
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
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {parentNodeToString} from '@/src/utils/dom-utils';

type InteractiveCommerceResult = InteractiveProduct | InteractiveSpotlightContent;

/**
 * Shared implementation of the elements that render a commerce result (`atomic-product` and
 * `atomic-spotlight-content`) with a template, and provide it to the template components they contain.
 */
export abstract class CommerceResultElement extends ChildrenUpdateCompleteMixin(LitElement) {
  /**
   * Whether `atomic-product-link` components nested in the element should stop click event propagation.
   */
  @property({
    attribute: 'stop-propagation',
    type: Boolean,
    converter: booleanConverter,
    reflect: true,
  })
  stopPropagation?: boolean;

  /**
   * Global Atomic state.
   */
  @property({type: Object}) store?: CommerceStore | CommerceRecommendationStore;

  /**
   * The template content to display.
   */
  @property({type: Object}) content?: ParentNode;

  /**
   * The link to use when the element is clicked in a grid layout.
   *
   * @default - An `atomic-product-link` without any customization.
   */
  @property({type: Object, attribute: 'link-content'}) linkContent: ParentNode =
    new DocumentFragment();

  /**
   * How the element should be displayed.
   */
  @property({reflect: true, type: String}) display: ItemDisplayLayout = 'list';

  /**
   * How large or small the element should be.
   */
  @property({reflect: true, type: String}) density: ItemDisplayDensity = 'normal';

  /**
   * The size of the visual section.
   *
   * This is overwritten by the image size defined in the template content, if it exists.
   */
  @property({reflect: true, type: String, attribute: 'image-size'})
  imageSize: ItemDisplayImageSize = 'icon';

  /**
   * The classes to add to the element.
   */
  @property({type: String}) classes = '';

  /**
   * A unique identifier for tracking the loading state of this component.
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

  private rootRef?: HTMLElement;
  private linkContainerRef?: HTMLElement;
  private itemLayoutController!: ItemLayoutController;

  protected abstract readonly elementPrefix: string;
  protected abstract get result(): CommerceResult | undefined;
  protected abstract get interactiveResult(): InteractiveCommerceResult | undefined;

  public resolveResult = (event: ProductContextEvent<CommerceResult | undefined>) => {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.result);
  };

  public resolveInteractiveResult = (event: ProductContextEvent<InteractiveCommerceResult>) => {
    event.preventDefault();
    event.stopPropagation();
    if (this.interactiveResult) {
      event.detail(this.interactiveResult);
    }
  };

  public resolveStopPropagation = (event: CustomEvent) => {
    event.detail(this.stopPropagation);
  };

  public resolveDisplayConfig = (event: ProductContextEvent<DisplayConfig>) => {
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
      ?.querySelector<HTMLAnchorElement>('.link-container > atomic-product-link a:not([slot])')
      ?.click();
  };

  public async connectedCallback() {
    super.connectedCallback();

    new CustomRenderController(this, {
      renderingFunction: () => this.renderingFunction,
      itemData: () => this.result,
      rootElementRef: () => this.rootRef,
      linkContainerRef: () => this.linkContainerRef,
      onRenderComplete: (element, output) => {
        this.itemLayoutController.applyLayoutClassesToElement(element, output);
      },
    });

    this.itemLayoutController = new ItemLayoutController(this, {
      elementPrefix: this.elementPrefix,
      renderingFunction: () => this.renderingFunction,
      content: () => this.content,
      layoutConfig: () => ({
        display: this.display,
        density: this.density,
        imageSize: this.imageSize,
      }),
      itemClasses: () => this.classes,
    });

    this.addEventListener('atomic/resolveResult', this.resolveResult as EventListener);
    this.addEventListener(
      'atomic/resolveInteractiveResult',
      this.resolveInteractiveResult as EventListener
    );
    this.addEventListener(
      'atomic/resolveStopPropagation',
      this.resolveStopPropagation as EventListener
    );
    this.addEventListener(
      'atomic/resolveResultDisplayConfig',
      this.resolveDisplayConfig as EventListener
    );
    this.addEventListener('click', this.handleClick);

    await this.getUpdateComplete();
    this.classList.add('hydrated');
  }

  public disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('atomic/resolveResult', this.resolveResult as EventListener);
    this.removeEventListener(
      'atomic/resolveInteractiveResult',
      this.resolveInteractiveResult as EventListener
    );
    this.removeEventListener(
      'atomic/resolveStopPropagation',
      this.resolveStopPropagation as EventListener
    );
    this.removeEventListener(
      'atomic/resolveResultDisplayConfig',
      this.resolveDisplayConfig as EventListener
    );
    this.removeEventListener('click', this.handleClick);
  }

  public render() {
    if (this.renderingFunction !== undefined) {
      return html`
        <div class=${resultComponentClass}>
          <div
            class="result-root"
            ${ref((el) => {
              this.rootRef = el as HTMLElement;
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

  private getContentHTML() {
    if (!this.content) {
      console.warn(
        `${this.elementPrefix}: content property is undefined. Cannot get content HTML.`,
        this
      );
      return '';
    }
    return parentNodeToString(this.content);
  }

  private getLinkHTML() {
    return parentNodeToString(this.linkContent ?? new HTMLElement());
  }
}
