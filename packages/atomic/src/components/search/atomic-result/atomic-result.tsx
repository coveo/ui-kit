import {Component, h, Prop, Element, Listen, Host} from '@stencil/core';
import {FoldedResult, Result, SearchEngine} from '@coveo/headless';
import {applyFocusVisiblePolyfill} from '../../../utils/initialization-utils';
import {
  DisplayConfig,
  ResultContextEvent,
} from '../result-template-components/result-template-decorators';
import {
  ResultLayout,
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../../common/layout/display-options';
import {
  AtomicCommonStore,
  AtomicCommonStoreData,
} from '../../common/interface/store';
import {ResultRenderingFunction} from '../../common/result-list/result-list-common-interface';
import {resultComponentClass} from '../../common/result-list/result-list-common';

/**
 * The `atomic-result` component is used internally by the `atomic-result-list` component.
 */
@Component({
  tag: 'atomic-result',
  styleUrl: '../../common/result/result.pcss',
  shadow: true,
})
export class AtomicResult {
  private layout!: ResultLayout;

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
   * The headless search engine.
   * @deprecated This property is currently un-used
   */
  @Prop() engine?: SearchEngine;

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
   * How results should be displayed.
   */
  @Prop() display: ResultDisplayLayout = 'list';

  /**
   * How large or small results should be.
   */
  @Prop() density: ResultDisplayDensity = 'normal';

  /**
   * The size of the visual section in result list items.
   *
   * This is overwritten by the image size defined in the result content, if it exists.
   */
  @Prop() imageSize?: ResultDisplayImageSize;

  /**
   * @deprecated use `imageSize` instead.
   */
  @Prop() image: ResultDisplayImageSize = 'icon';

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
  @Prop() renderingFunction: ResultRenderingFunction;

  private resultRootRef?: HTMLElement;
  private executedRenderingFunctionOnce = false;

  @Listen('atomic/resolveResult')
  public resolveResult(event: ResultContextEvent<FoldedResult | Result>) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.result);
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
      this.imageSize ?? this.image
    );
  }

  private get isCustomRenderFunctionMode() {
    return this.renderingFunction !== undefined;
  }

  private getContentHTML() {
    return Array.from(this.content!.children)
      .map((child) => child.outerHTML)
      .join('');
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
