import {Result} from '@coveo/headless';
import {Component, h, Prop, State, Watch} from '@stencil/core';
import dayjs from 'dayjs';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {Button} from '../../../common/button';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {QuickviewSidebar} from '../atomic-quickview-sidebar/atomic-quickview-sidebar';

/**
 * @internal
 */
@Component({
  tag: 'atomic-quickview-modal',
  styleUrl: 'atomic-quickview-modal.pcss',
  shadow: true,
})
export class AtomicQuickviewModal implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  @State() private highlightKeywords = true;
  @Watch('highlightKeywords')
  watchHighlightKeywords() {
    this.handleKeywordHighlight();
  }

  @State() private minimizeSidebar = false;

  @Prop({mutable: true, reflect: false}) content?: string;
  @Watch('content')
  watchContent() {
    if (this.content && this.iframeRef) {
      const documentWriter = this.iframeRef.contentDocument;
      if (!documentWriter) {
        return;
      }

      documentWriter.open();
      documentWriter.write(this.content);
      documentWriter.close();
      this.resizeIframe(documentWriter);
    }
    this.handleKeywordHighlight();
  }

  @Prop({mutable: true, reflect: false}) result?: Result;

  private iframeRef?: HTMLIFrameElement;

  private renderSidebar() {
    if (!this.content || !this.result) {
      return;
    }
    return (
      <QuickviewSidebar
        iframe={this.iframeRef!}
        termsToHighlight={
          this.bindings.engine.state.search.response.termsToHighlight
        }
        i18n={this.bindings.i18n}
        highlightKeywords={this.highlightKeywords}
        onHighlightKeywords={(highlight) =>
          (this.highlightKeywords = highlight)
        }
        result={this.result}
        minimize={this.minimizeSidebar}
        onMinimize={(minimize) => (this.minimizeSidebar = minimize)}
      />
    );
  }

  private renderIframe() {
    return (
      <iframe
        class="w-full"
        frameBorder={0}
        ref={(el) => (this.iframeRef = el as HTMLIFrameElement)}
      ></iframe>
    );
  }

  private resizeIframe(documentWriter: Document) {
    if (!this.iframeRef) {
      return;
    }
    // This "reset" of the iframe height allows the recalculation of the proper height needed for new content being added to the iframe
    // when the end user navigates through the available quickview
    // Since setting a new height on the iframe will cause the resize observer to essentially "call itself", we also add a flag to stop double resizing
    this.iframeRef.style.height = '0';
    let shouldRecalculateResize = true;
    new ResizeObserver(([documentElementObserved]) => {
      if (this.iframeRef && shouldRecalculateResize) {
        this.iframeRef.style.height = `${
          documentElementObserved.contentRect.height + 20
        }px`;
      }
      shouldRecalculateResize = !shouldRecalculateResize;
    }).observe(documentWriter.documentElement);
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
      <div
        slot="body"
        class="grid grid-cols-[min-content_auto]"
        style={{height: '90vh'}}
      >
        <div class="h-full">{this.renderSidebar()}</div>
        <div class="overflow-auto">{this.renderIframe()}</div>
      </div>
    );
  }

  private renderFooter() {
    const quickviewsInfoFromResultList =
      this.bindings.store.get('resultList')?.quickviews;
    const currentQuickviewPosition = this.bindings.store.get(
      'currentQuickviewPosition'
    );

    const first =
      (quickviewsInfoFromResultList?.position[currentQuickviewPosition] || 0) +
      1;
    const total = quickviewsInfoFromResultList?.total;

    return (
      <div slot="footer" class="flex items-center gap-2">
        <Button
          class="p-2"
          style="square-neutral"
          onClick={() => this.bindings.store.previousQuickview()}
          text="Prev"
        ></Button>
        <p>
          {this.bindings.i18n.t('showing-results-of', {
            first,
            total,
          })}
        </p>
        <Button
          class="p-2"
          style="square-neutral"
          onClick={() => this.bindings.store.nextQuickview()}
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

  private handleKeywordHighlight() {
    const doc = this.iframeRef?.contentWindow?.document;
    if (!doc) {
      return;
    }
    if (this.highlightKeywords) {
      doc.getElementById('CoveoDisableHighlightStyle')?.remove();
    } else {
      const head = doc.head;
      const style = doc.createElement('style');
      style.setAttribute('id', 'CoveoDisableHighlightStyle');
      head.appendChild(style);
      style.appendChild(
        doc.createTextNode(`[id^=CoveoHighlight] {
        background-color: inherit !important;
        color: inherit !important;
      }`)
      );
    }
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
