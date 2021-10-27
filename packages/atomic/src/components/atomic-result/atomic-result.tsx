import {Component, h, Prop, Element, Listen} from '@stencil/core';
import {Result, SearchEngine} from '@coveo/headless';
import {
  ResultDisplayLayout,
  ResultDisplayDensity,
  ResultDisplayImageSize,
  getResultDisplayClasses,
} from './atomic-result-display-options';

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
  @Prop() content!: string;

  /**
   * Whether this result should use `atomic-result-section-*` components.
   */
  @Prop() useSections = true;

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
   */
  @Prop() imageSize?: ResultDisplayImageSize;

  /**
   * @deprecated use `imageSize` instead.
   */
  @Prop() image: ResultDisplayImageSize = 'icon';

  @Listen('atomic/resolveResult')
  public resolveResult(event: CustomEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.result);
  }

  private getClasses() {
    const classes = getResultDisplayClasses(
      this.display,
      this.density,
      this.imageSize ?? this.image
    );
    if (this.useSections) {
      classes.push('with-sections');
    }
    return classes;
  }

  public render() {
    return (
      <div
        class={`result-root ${this.getClasses().join(' ')}`}
        innerHTML={this.content}
      ></div>
    );
  }
}
