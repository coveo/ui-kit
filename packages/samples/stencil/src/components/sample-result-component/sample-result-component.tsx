import {Result} from '@coveo/atomic/headless';
import {Component, h, Element, State} from '@stencil/core';
import {resultContext} from '@coveo/atomic';

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
      this.result = (await resultContext(this.host)) as Result;
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
