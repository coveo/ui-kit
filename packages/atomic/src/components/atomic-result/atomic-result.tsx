import {Component, h, Prop, Element, Listen} from '@stencil/core';
import {Result, SearchEngine} from '@coveo/headless';
import {
  ResultDisplayLayout,
  ResultDisplayDensity,
  ResultDisplayImageSize,
  getResultDisplayClasses,
} from './atomic-result-display-options';
import {applyFocusVisiblePolyfill} from '../../utils/initialization-utils';
import {ResultContextEvent} from '../result-template-components/result-template-decorators';

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
 * The `atomic-result` component is used internally by the `atomic-result-list` component.
 */
@Component({
  tag: 'atomic-result',
  styleUrl: 'atomic-result.pcss',
  shadow: true,
})
export class AtomicResult {
  @Element() host!: HTMLElement;

  /**
   * The result item.
   */
  @Prop() result!: Result;

  /**
   * The headless search engine.
   */
  @Prop() engine!: SearchEngine;

  /**
   * The result content to display.
   */
  @Prop() content!: ParentNode;

  /**
   * How results should be displayed.
   */
  @Prop() display: ResultDisplayLayout = 'list';

  /**
   * How large or small results should be.
   */
  @Prop() density: ResultDisplayDensity = 'normal';

  /**
   * How large or small the visual section of results should be.
   *
   * This may be overwritten if an image size is defined in the result content.
   */
  @Prop() imageSize?: ResultDisplayImageSize;

  /**
   * @deprecated use `imageSize` instead.
   */
  @Prop() image: ResultDisplayImageSize = 'icon';

  @Listen('atomic/resolveResult')
  public resolveResult(event: ResultContextEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.result);
  }

  private containsSections() {
    return Array.from(this.content.children).some((child) =>
      (resultSectionTags as readonly string[]).includes(
        child.tagName.toLowerCase()
      )
    );
  }

  private getSection(section: typeof resultSectionTags[number]) {
    return Array.from(this.content.children).find(
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

  private getClasses() {
    const classes = getResultDisplayClasses(
      this.display,
      this.density,
      this.getImageSizeFromSections() ?? this.imageSize ?? this.image
    );
    if (this.containsSections()) {
      classes.push('with-sections');
    }
    return classes;
  }

  private getContentHTML() {
    return Array.from(this.content.children)
      .map((child) => child.outerHTML)
      .join('');
  }

  public render() {
    return (
      <div
        class={`result-root ${this.getClasses().join(' ')}`}
        innerHTML={this.getContentHTML()}
      ></div>
    );
  }

  public componentDidLoad() {
    applyFocusVisiblePolyfill(this.host);
  }
}
