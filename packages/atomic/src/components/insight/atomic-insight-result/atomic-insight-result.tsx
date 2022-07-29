import {Component, h, Prop, Element, Listen} from '@stencil/core';
import {applyFocusVisiblePolyfill} from '../../../utils/initialization-utils';
import {createAtomicInsightStore} from '../atomic-insight-interface/store';
import {
  DisplayConfig,
  ResultContextEvent,
} from '../../search/result-template-components/result-template-decorators';
import {
  ResultLayout,
  ResultDisplayDensity,
  ResultDisplayImageSize,
} from '../../common/layout/display-options';
import {InsightResult, InsightEngine} from '..';

/**
 * The `atomic-insight-result` component is used internally by the `atomic-insight-result-list` component.
 */
@Component({
  tag: 'atomic-insight-result',
  styleUrl: '../../common/atomic-result/atomic-result.pcss',
  shadow: true,
})
export class AtomicInsightResult {
  private layout!: ResultLayout;
  @Element() host!: HTMLElement;

  /**
   * Whether an atomic-result-link inside atomic-result should stop propagation.
   */
  @Prop() stopPropagation?: boolean;

  /**
   * The result item.
   */
  @Prop() result!: InsightResult;

  /**
   * The headless search engine.
   */
  @Prop() engine!: InsightEngine;

  /**
   * Global state for Atomic.
   * @internal
   */
  @Prop() store?: ReturnType<typeof createAtomicInsightStore>;

  /**
   * The result content to display.
   */
  @Prop() content?: ParentNode;

  /**
   * How large or small results should be.
   */
  @Prop() density: ResultDisplayDensity = 'normal';

  /**
   * How large or small the visual section of results should be.
   *
   * This may be overwritten if an image size is defined in the result content.
   */
  @Prop() imageSize: ResultDisplayImageSize = 'icon';

  /**
   * Classes that will be added to the result element.
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
      <div
        class={`result-root ${this.layout
          .getClasses()
          .concat(this.classes)
          .join(' ')}`}
        innerHTML={this.getContentHTML()}
      ></div>
    );
  }

  public componentDidLoad() {
    if (this.loadingFlag && this.store) {
      this.store.unsetLoadingFlag(this.loadingFlag);
    }
    applyFocusVisiblePolyfill(this.host);
  }
}
