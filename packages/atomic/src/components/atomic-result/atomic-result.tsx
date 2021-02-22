import {Component, h, Prop, Element} from '@stencil/core';
import {Result, Engine} from '@coveo/headless';
import {bindLogDocumentOpenOnResult} from '../../utils/result-utils';

@Component({
  tag: 'atomic-result',
  styleUrl: 'atomic-result.pcss',
  shadow: true,
})
export class AtomicResult {
  @Element() host!: HTMLDivElement;
  @Prop() result!: Result;
  @Prop() engine!: Engine;

  private unbindLogDocumentOpen = () => {};

  public componentDidRender() {
    this.unbindLogDocumentOpen = bindLogDocumentOpenOnResult(
      this.engine,
      this.result,
      this.host
    );
  }

  public disconnectedCallback() {
    this.unbindLogDocumentOpen();
  }

  public render() {
    return <slot></slot>;
  }
}
