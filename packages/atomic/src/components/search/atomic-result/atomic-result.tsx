import {FoldedResult, InteractiveResult, Result} from '@coveo/headless';
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
  InteractiveResultContextEvent,
  ResultContextEvent,
} from '../result-template-components/result-template-decorators';

/**
 * The `atomic-result` component is used internally by the `atomic-result-list` component.
 */
@Component({
  tag: 'atomic-result',
  styleUrl: 'atomic-result.pcss',
  shadow: true,
})
export class AtomicResult {
  private layout!: ItemLayout;

  @Element() host!: HTMLElement;

  /**
   * Whether an atomic-result-link inside atomic-result should stop click event propagation.
   */
  @Prop() stopPropagation?: boolean;

  /**
   * The result item.
   */
  @Prop() result!: Result | FoldedResult;

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
   * The result link to use when the result is clicked in a grid layout.
   *
   * @default - An `atomic-result-link` without any customization.
   */
  @Prop() linkContent: ParentNode = new DocumentFragment();

  /**
   * How results should be displayed.
   */
  @Prop() display: ItemDisplayLayout = 'list';

  /**
   * How large or small results should be.
   */
  @Prop() density: ItemDisplayDensity = 'normal';

  /**
   * The size of the visual section in result list items.
   *
   * This is overwritten by the image size defined in the result content, if it exists.
   */
  @Prop() imageSize: ItemDisplayImageSize = 'icon';

  /**
   * The classes to add to the result element.
   */
  @Prop() classes = '';

  /**
   * @internal
   */
  @Prop() loadingFlag?: string;

  /**
   * Internal function used by atomic-recs-list in advanced setups, which lets you bypass the standard HTML template system.
   * Particularly useful for Atomic React
   *
   * @internal
   */
  @Prop() renderingFunction: ItemRenderingFunction;

  private resultRootRef?: HTMLElement;
  private linkContainerRef?: HTMLElement;
  private executedRenderingFunctionOnce = false;

  @Listen('atomic/resolveResult')
  public resolveResult(event: ResultContextEvent<FoldedResult | Result>) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.result);
  }

  @Listen('atomic/resolveInteractiveResult')
  public resolveInteractiveResult(event: InteractiveResultContextEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (this.interactiveResult) {
      event.detail(this.interactiveResult);
    }
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

  @Listen('click')
  public handleClick(event: MouseEvent) {
    if (this.stopPropagation) {
      event.stopPropagation();
    }
    this.host
      .shadowRoot!.querySelector<HTMLAnchorElement>(
        '.link-container > atomic-result-link a:not([slot])'
      )
      ?.click();
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
    return parentNodeToString(this.linkContent);
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
        this.result,
        this.resultRootRef!,
        this.linkContainerRef!
      );

      this.resultRootRef!.className += ` ${this.layout
        .getClasses(customRenderOutputAsString)
        .concat(this.classes)
        .join(' ')}`;

      this.executedRenderingFunctionOnce = true;
    }
  }
}
