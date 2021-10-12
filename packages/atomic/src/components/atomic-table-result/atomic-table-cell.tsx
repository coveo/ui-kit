import {Component, h, Listen, Prop} from '@stencil/core';
import {Result} from '@coveo/headless';
import {
  getResultDisplayClasses,
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../atomic-result/atomic-result-display-options';

/**
 * The `atomic-table-cell` component is used internally by the `atomic-result-list` component.
 */
@Component({
  tag: 'atomic-table-cell',
  styleUrl: 'atomic-result-cell.pcss',
  shadow: true,
})
export class AtomicTableCell {
  /**
   * The result item.
   */
  @Prop() result!: Result;

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
      this.image
    );
    if (this.useSections) {
      classes.push('with-sections');
    }
    return classes;
  }

  public render() {
    return (
      <div
        class={`cell-root ${this.getClasses().join(' ')}`}
        innerHTML={this.content}
      ></div>
    );
  }
}
