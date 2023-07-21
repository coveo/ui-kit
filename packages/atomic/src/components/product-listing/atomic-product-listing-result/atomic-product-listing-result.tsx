import {
  ProductRecommendation,
  InteractiveResult,
} from '@coveo/headless/product-listing';
import {Component, h, Prop, Element, Listen, Host} from '@stencil/core';
import {applyFocusVisiblePolyfill} from '../../../utils/initialization-utils';
import {
  AtomicCommonStore,
  AtomicCommonStoreData,
} from '../../common/interface/store';
import {
  ResultLayout,
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../../common/layout/display-options';
import {resultComponentClass} from '../../common/result-list/result-list-common';
import {ProductRecommendationRenderingFunction} from '../../common/result-list/result-list-common-interface';
import {
  DisplayConfig,
  InteractiveResultContextEvent,
  ResultContextEvent,
} from '../../search/result-template-components/result-template-decorators';

/**
 * The `atomic-product-listing-result` component is used internally by the `atomic-product-listing` component.
 *
 * @internal
 */
@Component({
  tag: 'atomic-product-listing-result',
  styleUrl: '../../common/result/result.pcss',
  shadow: true,
})
export class AtomicProductListingResult {
  private layout!: ResultLayout;
  private resultRootRef?: HTMLElement;
  private executedRenderingFunctionOnce = false;
  @Element() host!: HTMLElement;

  /**
   * Whether an atomic-result-link inside atomic-product-listing should stop click event propagation.
   */
  @Prop() stopPropagation?: boolean;

  /**
   * The result item.
   */
  @Prop() result!: ProductRecommendation;

  /**
   * The InteractiveResult item.
   * @internal
   */
  @Prop() interactiveResult!: InteractiveResult;

  /**
   * Global Atomic state.
   * @internal
   */
  @Prop() store?: AtomicCommonStore<AtomicCommonStoreData>;

  /**
   * The result content to display.
   */
  @Prop() content?: ParentNode;

  /**
   * The layout to apply to display results.
   */
  @Prop() display: ResultDisplayLayout = 'list';

  /**
   * The size of the results.
   */
  @Prop() density: ResultDisplayDensity = 'normal';

  /**
   * The size of the visual section in result list items.
   *
   * This is overwritten by the image size defined in the result content, if it exists.
   */
  @Prop() imageSize: ResultDisplayImageSize = 'icon';

  /**
   * The classes to add to the result element.
   */
  @Prop() classes = '';

  /**
   * @internal
   */
  @Prop() loadingFlag?: string;

  /**
   * Internal function used by atomic-product-listing in advanced setups, which lets you bypass the standard HTML template system.
   * Particularly useful for Atomic React
   *
   * @internal
   */
  @Prop() renderingFunction: ProductRecommendationRenderingFunction;

  @Listen('atomic/resolveResult')
  public resolveResult(event: ResultContextEvent<ProductRecommendation>) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.result);
  }

  @Listen('atomic/resolveInteractiveResult')
  public resolveInteractiveResult(event: InteractiveResultContextEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.interactiveResult);
  }

  @Listen('atomic/resolveStopPropagation')
  public resolveStopPropagation(event: CustomEvent) {
    event.detail(this.stopPropagation);
  }

  @Listen('atomic/resolveResultDisplayConfig')
  public resolveResultDisplayConfig(event: ResultContextEvent<DisplayConfig>) {
    event.preventDefault();
    event.stopPropagation();
    event.detail({
      density: this.density,
      imageSize: this.imageSize!,
    });
  }

  public connectedCallback() {
    this.layout = new ResultLayout(
      this.content!.children,
      this.display,
      this.density,
      this.imageSize
    );
  }

  private getContentHTML() {
    return Array.from(this.content!.children)
      .map((child) => child.outerHTML)
      .join('');
  }

  private get isCustomRenderFunctionMode() {
    return this.renderingFunction !== undefined;
  }

  private shouldExecuteRenderFunction() {
    return (
      this.isCustomRenderFunctionMode &&
      this.resultRootRef &&
      !this.executedRenderingFunctionOnce
    );
  }

  public render() {
    if (this.isCustomRenderFunctionMode) {
      return (
        <Host class={resultComponentClass}>
          <div
            class="result-root"
            ref={(ref) => (this.resultRootRef = ref)}
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
        this.result,
        this.resultRootRef!
      );

      this.resultRootRef!.className += ` ${this.layout
        .getClasses(customRenderOutputAsString)
        .concat(this.classes)
        .join(' ')}`;

      this.executedRenderingFunctionOnce = true;
    }
  }
}
