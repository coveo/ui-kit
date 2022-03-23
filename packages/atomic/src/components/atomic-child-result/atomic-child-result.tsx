import {Result} from '@coveo/headless';
import {Component, Listen, Prop, h} from '@stencil/core';
import {ResultContextEvent} from '../result-template-components/result-template-decorators';
@Component({
  tag: 'atomic-child-result',
  shadow: true,
})
export class AtomicChildResult {
  @Prop() public template!: DocumentFragment;
  @Prop() public child!: Result;

  @Listen('atomic/resolveResult')
  public resolveResult(event: ResultContextEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.child);
  }

  private getContentHTML() {
    return Array.from(this.template.children)
      .map((child) => child.outerHTML)
      .join('');
  }

  public render() {
    // deepcode ignore ReactSetInnerHtml: This is not React code
    return <div innerHTML={this.getContentHTML()}></div>;
  }
}
