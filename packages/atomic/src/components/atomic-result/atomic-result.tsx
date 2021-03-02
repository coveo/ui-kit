import {Component, h, Prop, Element} from '@stencil/core';
import {Result, Engine} from '@coveo/headless';
import {bindLogDocumentOpenOnResult} from '../../utils/result-utils';

@Component({
  tag: 'atomic-result',
  shadow: true,
})
export class AtomicResult {
  @Element() host!: HTMLElement;
  @Prop() result!: Result;
  @Prop() engine!: Engine;
  @Prop() content!: string;

  private unbindLogDocumentOpen = () => {};

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
    return <div innerHTML={this.content}></div>;
  }
}
