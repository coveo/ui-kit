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
import {QuickviewIframe} from '../quickview-iframe/quickview-iframe';
import {HIGHLIGHT_PREFIX} from '../quickview-word-highlight/quickview-word-highlight';

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
    if (this.highlightKeywords) {
      this.enableHighlights();
    } else {
      this.disableHighlights();
    }
  }

  @State() private minimizeSidebar = false;
  @State() private iframeRef?: HTMLIFrameElement;

  @Prop({mutable: true, reflect: false}) content?: string;
  @Prop({mutable: true, reflect: false}) result?: Result;

  private observer?: ResizeObserver;

  private renderSidebar() {
    if (!this.content || !this.result || !this.iframeRef) {
      return;
    }
    return (
      <QuickviewSidebar
        iframe={this.iframeRef}
        termsToHighlight={
          this.bindings.engine.state.search.response.termsToHighlight
        }
        i18n={this.bindings.i18n}
        highlightKeywords={this.highlightKeywords}
        onHighlightKeywords={(highlight) =>
          (this.highlightKeywords = highlight)
        }
        result={this.result}
        minimized={this.minimizeSidebar}
        onMinimize={(minimize) => (this.minimizeSidebar = minimize)}
      />
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
      <div
        slot="body"
        class="grid grid-cols-[min-content_auto]"
        style={{height: '90vh'}}
      >
        <div class="h-full">{this.renderSidebar()}</div>
        <div class="overflow-auto">
          <QuickviewIframe
            content={this.content}
            onSetIframeRef={(ref) => (this.iframeRef = ref)}
          />
        </div>
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

  private get highlightScriptId() {
    return 'CoveoDisableHighlightStyle';
  }

  private enableHighlights() {
    const doc = this.iframeRef?.contentWindow?.document;
    if (!doc) {
      return;
    }
    doc.getElementById(this.highlightScriptId)?.remove();
  }

  private disableHighlights() {
    const doc = this.iframeRef?.contentWindow?.document;
    if (!doc) {
      return;
    }

    const head = doc.head;
    const style = doc.createElement('style');
    style.setAttribute('id', this.highlightScriptId);
    head.appendChild(style);
    style.appendChild(
      doc.createTextNode(`[id^=${HIGHLIGHT_PREFIX}] {
      background-color: inherit !important;
      color: inherit !important;
    }`)
    );
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect();
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
