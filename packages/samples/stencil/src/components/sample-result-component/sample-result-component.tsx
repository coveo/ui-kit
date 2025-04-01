import {resultContext} from '@coveo/atomic';
import {Result} from '@coveo/headless';
import {Component, h, Element, State} from '@stencil/core';

@Component({
  tag: 'sample-result-component',
  styleUrl: 'sample-result-component.css',
  shadow: true,
})
export class SampleResultComponent {
  @State() private result?: Result;
  @Element() private host!: Element;

  public async connectedCallback() {
    try {
      // If your component was used in `atomic-folded-result-list`, you would use `await resultContext<FoldedResult>(this.host)` instead.
      this.result = await resultContext<Result>(this.host);
    } catch (error) {
      console.error(error);
      this.host.remove();
    }
  }

  public render() {
    if (!this.result) {
      return;
    }

    const author = this.result.raw['author'] || 'anonymous';
    return (
      <h4>
        Written by: <b>{author}</b>
      </h4>
    );
  }
}
