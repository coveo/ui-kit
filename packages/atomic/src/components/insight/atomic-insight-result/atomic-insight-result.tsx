import {
  Result as InsightResult,
  InteractiveResult as InsightInteractiveResult,
  FoldedResult as InsightFoldedResult,
} from '@coveo/headless/insight';
import {Component, h, Prop, Element, Listen, Host} from '@stencil/core';
import {
  DisplayConfig,
  InteractiveItemContextEvent,
  ItemContextEvent,
} from '../../common/item-list/stencil-item-decorators';
import {resultComponentClass} from '../../common/item-list/stencil-item-list-common';
import {
  ItemLayout,
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '../../common/layout/display-options';
import {InsightStore} from '../atomic-insight-interface/store';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-result',
  styleUrl: 'atomic-insight-result.pcss',
  shadow: true,
})
export class AtomicInsightResult {
  private layout!: ItemLayout;
  @Element() host!: HTMLElement;

  /**
   * Whether an atomic-result-link inside atomic-insight-result should stop click event propagation.
   */
  @Prop() stopPropagation?: boolean;

  /**
   * The result item.
   */
  @Prop() result!: InsightResult | InsightFoldedResult;

  /**
   * The InteractiveResult item.
   * @internal
   */
  @Prop() interactiveResult!: InsightInteractiveResult;

  /**
   * Global Atomic state.
   * @internal
   */
  @Prop() store?: InsightStore;

  /**
   * The result content to display.
   */
  @Prop() content?: ParentNode;

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

  @Listen('atomic/resolveResult')
  public resolveResult(
    event: ItemContextEvent<InsightFoldedResult | InsightResult>
  ) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.result);
  }

  @Listen('atomic/resolveInteractiveResult')
  public resolveInteractiveResult(event: InteractiveItemContextEvent) {
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
      'list',
      this.density,
      this.imageSize
    );
  }

  private getContentHTML() {
    return Array.from(this.content!.children)
      .map((child) => child.outerHTML)
      .join('');
  }

  public render() {
    return (
      <Host class={resultComponentClass}>
        {/* deepcode ignore ReactSetInnerHtml: This is not React code */}
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
  }
}
