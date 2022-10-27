import {Component, h, Prop, Element, Listen, Host} from '@stencil/core';
import {applyFocusVisiblePolyfill} from '../../../utils/initialization-utils';
import {AtomicInsightStore} from '../atomic-insight-interface/store';
import {
  DisplayConfig,
  InteractiveResultContextEvent,
  ResultContextEvent,
} from '../../search/result-template-components/result-template-decorators';
import {
  ResultLayout,
  ResultDisplayDensity,
  ResultDisplayImageSize,
} from '../../common/layout/display-options';
import {InsightResult, InsightInteractiveResult} from '..';
import {resultComponentClass} from '../../common/result-list/result-list-common';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-result',
  styleUrl: '../../common/result/result.pcss',
  shadow: true,
})
export class AtomicInsightResult {
  private layout!: ResultLayout;
  @Element() host!: HTMLElement;

  /**
   * Whether an atomic-result-link inside atomic-insight-result should stop click event propagation.
   */
  @Prop() stopPropagation?: boolean;

  /**
   * The result item.
   */
  @Prop() result!: InsightResult;

  /**
   * The InteractiveResult item.
   * TODO: v2 make required
   * @internal
   */
  @Prop() interactiveResult?: InsightInteractiveResult;

  /**
   * Global Atomic state.
   * @internal
   */
  @Prop() store?: AtomicInsightStore;

  /**
   * The result content to display.
   */
  @Prop() content?: ParentNode;

  /**
   * How large or small results should be.
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

  @Listen('atomic/resolveResult')
  public resolveResult(event: ResultContextEvent<InsightResult>) {
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

  public connectedCallback() {
    this.layout = new ResultLayout(
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
}
