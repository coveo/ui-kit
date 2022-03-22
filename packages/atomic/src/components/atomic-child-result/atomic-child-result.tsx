import {Result} from '@coveo/headless';
import {Component, h, Prop, Listen} from '@stencil/core';
import {ResultContextEvent} from '../result-template-components/result-template-decorators';

@Component({
  tag: 'atomic-child-result',
  shadow: true,
})
export class AtomicChildResult {
  @Prop() result!: Result;

  /**
   * The result content to display.
   */
  @Prop() content!: ParentNode;

  @Listen('atomic/resolveResult')
  public resolveResult(event: ResultContextEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.result);
  }

  private getContentHTML() {
    return Array.from(this.content.children)
      .map((child) => child.outerHTML)
      .join('');
  }

  public render() {
    return (
      // deepcode ignore ReactSetInnerHtml: This is not React code
      <div innerHTML={this.getContentHTML()}></div>
    );
  }
}
