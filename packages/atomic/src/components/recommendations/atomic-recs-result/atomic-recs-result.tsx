import {Component, h, Prop, Element, Listen, Host} from '@stencil/core';
import {RecsInteractiveResult, RecsResult} from '..';
import {applyFocusVisiblePolyfill} from '../../../utils/initialization-utils';
import {
  InteractiveItemContextEvent,
  ItemContextEvent,
  DisplayConfig,
} from '../../common/item-list/item-decorators';
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
import {AtomicRecsStore} from '../atomic-recs-interface/store';

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
  private executedRenderingFunctionOnce = false;
  @Element() host!: HTMLElement;

  /**
   * Whether an atomic-result-link inside atomic-recs-result should stop click event propagation.
   */
  @Prop() stopPropagation?: boolean;

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
  @Prop() store?: AtomicRecsStore;

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
      // deepcode ignore ReactSetInnerHtml: This is not React code
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
