import {Component, h, Prop, Element, Listen} from '@stencil/core';
import {Result, SearchEngine} from '@coveo/headless';
import {bindLogDocumentOpenOnResult} from '../../utils/result-utils';

export type ResultDisplayLayout = 'list' | 'grid' | 'table';
export type ResultDisplayDensity = 'comfortable' | 'normal' | 'compact';
export type ResultDisplayImageSize = 'large' | 'small' | 'icon' | 'none';

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

  private getDisplayClass() {
    switch (this.display) {
      case 'grid':
        return 'display-grid';
      case 'list':
      default:
        return 'display-list';
      case 'table':
        return 'display-table';
    }
  }

  private getDensityClass() {
    switch (this.density) {
      case 'comfortable':
        return 'density-comfortable';
      case 'normal':
      default:
        return 'density-normal';
      case 'compact':
        return 'density-compact';
    }
  }

  private getImageClass() {
    switch (this.image) {
      case 'large':
        return 'image-large';
      case 'small':
        return 'image-small';
      case 'icon':
      default:
        return 'image-icon';
      case 'none':
        return 'image-none';
    }
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
        class={`result-root ${this.getDisplayClass()} ${this.getDensityClass()} ${this.getImageClass()}`}
        innerHTML={this.content}
      ></div>
    );
  }
}
