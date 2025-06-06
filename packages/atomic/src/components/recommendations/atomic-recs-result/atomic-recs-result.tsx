import {
  InteractiveResult as RecsInteractiveResult,
  Result as RecsResult,
} from '@coveo/headless/recommendation';
import {Component, h, Prop, Element, Listen, Host} from '@stencil/core';
import {parentNodeToString} from '../../../utils/dom-utils';
import {
  InteractiveItemContextEvent,
  ItemContextEvent,
  DisplayConfig,
} from '../../common/item-list/stencil-item-decorators';
import {
  ItemRenderingFunction,
  resultComponentClass,
} from '../../common/item-list/stencil-item-list-common';
import {
  ItemLayout,
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '../../common/layout/display-options';
import {RecsStore} from '../atomic-recs-interface/store';

/**
 * The `atomic-recs-result` component is used internally by the `atomic-recs-list` component.
 */
@Component({
  tag: 'atomic-recs-result',
  styleUrl: 'atomic-recs-result.pcss',
  shadow: true,
})
export class AtomicRecsResult {
  private layout!: ItemLayout;
  private resultRootRef?: HTMLElement;
  private linkContainerRef?: HTMLElement;
  private executedRenderingFunctionOnce = false;
  @Element() host!: HTMLElement;

  /**
   * Whether an atomic-result-link inside atomic-recs-result should stop click event propagation.
   */
  @Prop() stopPropagation?: boolean;

  /**
   * The result link to use when the result is clicked in a grid layout.
   *
   * @default - An `atomic-result-link` without any customization.
   */
  @Prop() linkContent: ParentNode = new DocumentFragment();

  /**
   * The result item.
   */
  @Prop() result!: RecsResult;

  /**
   * The InteractiveResult item.
   * @internal
   */
  @Prop() interactiveResult!: RecsInteractiveResult;

  /**
   * Global Atomic state.
   * @internal
   */
  @Prop() store?: RecsStore;

  /**
   * The result content to display.
   */
  @Prop() content?: ParentNode;

  /**
   * The layout to apply to display results.
   */
  @Prop() display: ItemDisplayLayout = 'list';

  /**
   * The size of the results.
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

  @Listen('atomic/resolveResult')
  public resolveResult(event: ItemContextEvent<RecsResult>) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.result);
  }

  @Listen('atomic/resolveInteractiveResult')
  public resolveInteractiveResult(event: InteractiveItemContextEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.interactiveResult);
  }

  @Listen('atomic/resolveStopPropagation')
  public resolveStopPropagation(event: CustomEvent) {
    event.detail(this.stopPropagation);
  }

  @Listen('atomic/resolveResultDisplayConfig')
  public resolveResultDisplayConfig(event: ItemContextEvent<DisplayConfig>) {
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

  private getContentHTML() {
    return parentNodeToString(this.content!);
  }

  private getLinkHTML() {
    return parentNodeToString(this.linkContent);
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
          <div
            class="link-container"
            ref={(ref) => (this.linkContainerRef = ref)}
          ></div>
        </Host>
      );
    }
    return (
      // deepcode ignore ReactSetInnerHtml: This is not React code
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
