import {Component, h, Prop, Element, Listen} from '@stencil/core';
import {Result, SearchEngine} from '@coveo/headless';
import {bindLogDocumentOpenOnResult} from '../../utils/result-utils';
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
  tag: 'atomic-result-v1',
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
  @Prop() image: ResultDisplayImageSize = 'icon';

  @Listen('atomic/resolveResult')
  public resolveResult(event: CustomEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.result);
  }

  private unbindLogDocumentOpen = () => {};

  private getClasses() {
    return getResultDisplayClasses(this.display, this.density, this.image);
  }

  public componentDidRender() {
    this.unbindLogDocumentOpen = bindLogDocumentOpenOnResult(
      this.engine,
      this.result,
      this.host.shadowRoot!
    );
  }

  public disconnectedCallback() {
    this.unbindLogDocumentOpen();
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
