import {Result} from '@coveo/headless';
import {Component, h, Prop, Watch} from '@stencil/core';
import dayjs from 'dayjs';
import {Button} from '../../../common/button';

/**
 * @internal
 */
@Component({
  tag: 'atomic-quickview-modal',
  styleUrl: 'atomic-quickview-modal.pcss',
  shadow: true,
})
export class AtomicQuickviewModal {
  @Prop({mutable: true, reflect: false}) content?: string;
  @Watch('content')
  watchContent() {
    if (this.content && this.iframeRef) {
      const documentWriter = this.iframeRef.contentWindow?.document;
      documentWriter?.open();
      documentWriter?.write(this.content);
      documentWriter?.close();
      this.iframeRef.style.height = `${documentWriter?.documentElement.scrollHeight}px`;
    }
  }

  @Prop({mutable: true, reflect: false}) result?: Result;

  private iframeRef?: HTMLIFrameElement;

  private renderSidebar() {
    return (
      <div>
        TODO This will be the sidebar component with keywords navigation
      </div>
    );
  }

  private renderIframe() {
    return (
      <iframe
        class="col-span-3 w-full"
        frameBorder={0}
        ref={(el) => (this.iframeRef = el as HTMLIFrameElement)}
      ></iframe>
    );
  }

  private renderHeader() {
    // TODO: Header should be slottable from result template definition
    return (
      <div slot="header" class="w-full flex justify-between">
        <div>{this.result?.title}</div>
        <div>{dayjs(this.result?.raw.date).format('D/M/YYYY')}</div>
      </div>
    );
  }

  private renderBody() {
    return (
      <div slot="body" class="grid grid-cols-4">
        {this.renderSidebar()}
        {this.renderIframe()}
      </div>
    );
  }

  private renderFooter() {
    // TODO: Footer that navigates results
    return (
      <div slot="footer" class="flex items-center gap-2">
        <Button
          class="p-2"
          style="square-neutral"
          onClick={() => {}}
          text="Prev"
        ></Button>
        <p>Results 1/10</p>
        <Button
          class="p-2"
          style="square-neutral"
          onClick={() => {}}
          text="Next"
        ></Button>
      </div>
    );
  }

  private onClose() {
    this.content = undefined;
    this.result = undefined;
  }

  private get isOpen() {
    return !!this.content && !!this.result;
  }

  public render() {
    return (
      <atomic-modal
        class={'atomic-quickview-modal'}
        isOpen={this.isOpen}
        close={() => this.onClose()}
      >
        {this.renderHeader()}
        {this.renderBody()}
        {this.renderFooter()}
      </atomic-modal>
    );
  }
}
