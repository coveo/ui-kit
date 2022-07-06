import {Component, h, Prop, Element, Listen} from '@stencil/core';
import {InsightEngine, Result} from '@coveo/headless/insight';
import {applyFocusVisiblePolyfill} from '../../../utils/initialization-utils';
import {createAtomicSvcInsightStore} from '../atomic-insight-interface/store';
import {
  getResultDisplayClasses,
  ResultDisplayDensity,
  ResultDisplayImageSize,
} from '../../search/atomic-result/atomic-result-display-options';
import {
  DisplayConfig,
  ResultContextEvent,
} from '../../search/result-template-components/result-template-decorators';
const resultSectionTags = [
  'atomic-result-section-visual',
  'atomic-result-section-badges',
  'atomic-result-section-actions',
  'atomic-result-section-title',
  'atomic-result-section-title-metadata',
  'atomic-result-section-emphasized',
  'atomic-result-section-excerpt',
  'atomic-result-section-bottom-metadata',
] as const;

/**
 * The `atomic-insight-result` component is used internally by the `atomic-insight-result-list` component.
 */
@Component({
  tag: 'atomic-insight-result',
  styleUrl: '../../search/atomic-result/atomic-result.pcss',
  shadow: true,
})
export class AtomicInsightResult {
  @Element() host!: HTMLElement;

  /**
   * Whether an atomic-result-link inside atomic-result should stop propagation.
   */
  @Prop() stopPropagation?: boolean;

  /**
   * The result item.
   */
  @Prop() result!: Result;

  /**
   * The headless search engine.
   */
  @Prop() engine!: InsightEngine;

  /**
   * Global state for Atomic.
   * @internal
   */
  @Prop() store?: ReturnType<typeof createAtomicSvcInsightStore>;

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
  public resolveResult(event: ResultContextEvent<Result>) {
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

  private containsSections() {
    return Array.from(this.content!.children).some((child) =>
      (resultSectionTags as readonly string[]).includes(
        child.tagName.toLowerCase()
      )
    );
  }

  private getSection(section: typeof resultSectionTags[number]) {
    return Array.from(this.content!.children).find(
      (element) => element.tagName.toLowerCase() === section
    );
  }

  private getImageSizeFromSections() {
    const imageSize = this.getSection(
      'atomic-result-section-visual'
    )?.getAttribute('image-size');
    if (!imageSize) {
      return undefined;
    }
    return imageSize as ResultDisplayImageSize;
  }

  private getClassesFromHTMLContent() {
    const classes = getResultDisplayClasses(
      'list',
      this.density,
      this.getImageSizeFromSections() ?? this.imageSize
    );
    if (this.containsSections()) {
      classes.push('with-sections');
    }
    if (this.classes) {
      classes.push(this.classes);
    }
    return classes;
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
        class={`result-root ${this.getClassesFromHTMLContent().join(' ')}`}
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
