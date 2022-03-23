import {FoldedResult} from '@coveo/headless';
import {Component, h, Prop, Listen} from '@stencil/core';

import {ResultContextEvent} from '../result-template-components/result-template-decorators';

@Component({
  tag: 'atomic-child-result',
  styleUrl: 'atomic-child-result.pcss',
  shadow: true,
})
export class AtomicChildResult {
  @Prop() result!: FoldedResult;
  @Prop() templateHTML!: string;

  @Listen('atomic/resolveResult')
  public resolveResult(event: ResultContextEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.result.result);
  }

  public render() {
    return (
      // deepcode ignore ReactSetInnerHtml: This is not React code
      <div class="result-root" innerHTML={this.templateHTML}></div>
    );
  }
}
