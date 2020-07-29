import {Component, h, Prop, Element} from '@stencil/core';
import {Result} from '@coveo/headless';
import {headlessEngine} from '../../engine';
import {bindLogDocumentOpenOnResult} from '../../utils/result-utils';

@Component({
  tag: 'atomic-result',
  shadow: true,
})
export class AtomicResult {
  @Element() host!: HTMLDivElement;
  @Prop() result!: Result;
  private unbindLogDocumentOpen = () => {};

  public componentDidRender() {
    this.unbindLogDocumentOpen = bindLogDocumentOpenOnResult(
      headlessEngine,
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
