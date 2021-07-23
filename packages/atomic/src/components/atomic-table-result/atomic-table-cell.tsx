import {Component, h, Listen, Prop} from '@stencil/core';
import {Result} from '@coveo/headless';

/**
 * The `atomic-table-cell` component is used internally by the `atomic-result-list` component.
 */
@Component({
  tag: 'atomic-table-cell',
  shadow: true,
})
export class AtomicResultSectionTitle {
  /**
   * The result item.
   */
  @Prop() result!: Result;

  /**
   * The result content to display.
   */
  @Prop() content!: string;

  @Listen('atomic/resolveResult')
  public resolveResult(event: CustomEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.result);
  }

  public render() {
    return <div innerHTML={this.content}></div>;
  }
}
