import {Result} from '@coveo/headless';
import {
  Component,
  Event,
  EventEmitter,
  h,
  Prop,
  State,
  Watch,
} from '@stencil/core';
import dayjs from 'dayjs';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {Button} from '../../../common/button';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {QuickviewSidebar} from '../atomic-quickview-sidebar/atomic-quickview-sidebar';
import {QuickviewIframe} from '../quickview-iframe/quickview-iframe';
import {buildQuickviewPreviewBar} from '../quickview-preview-bar/quickview-preview-bar';
import {
  getWordsHighlights,
  HIGHLIGHT_PREFIX,
  QuickviewWordHighlight,
} from '../quickview-word-highlight/quickview-word-highlight';

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

  @Event({eventName: 'atomic/quickview/next'}) nextQuickview?: EventEmitter;
  @Event({eventName: 'atomic/quickview/previous'})
  previousQuickview?: EventEmitter;

  @State() private minimizeSidebar = false;
  @State() private words: Record<string, QuickviewWordHighlight> = {};
  private iframeRef?: HTMLIFrameElement;

  @Prop({mutable: true, reflect: false}) content?: string;
  @Prop({mutable: true, reflect: false}) result?: Result;
  @Prop() current?: number;
  @Prop() total?: number;
  @Prop() sandbox?: string;

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
      <div slot="body" class="grid grid-cols-[min-content_auto] h-full">
        <div class="h-full">
          <QuickviewSidebar
            words={this.words}
            i18n={this.bindings.i18n}
            highlightKeywords={this.highlightKeywords}
            onHighlightKeywords={(highlight) =>
              (this.highlightKeywords = highlight)
            }
            minimized={this.minimizeSidebar}
            onMinimize={(minimize) => (this.minimizeSidebar = minimize)}
          />
        </div>
        <div class="overflow-auto relative">
          <QuickviewIframe
            sandbox={this.sandbox}
            result={this.result}
            content={this.content}
            onSetIframeRef={async (ref) => {
              this.iframeRef = ref;
              this.words = getWordsHighlights(
                this.termsToHighlight,
                this.iframeRef
              );
            }}
          />
          {buildQuickviewPreviewBar(this.words, this.iframeRef)}
        </div>
      </div>
    );
  }

  private renderFooter() {
    return (
      <div slot="footer" class="flex items-center gap-2">
        <Button
          class="p-2"
          style="square-neutral"
          onClick={() => this.previousQuickview?.emit()}
          text={this.bindings.i18n.t('previous')}
        ></Button>
        <p>
          {this.bindings.i18n.t('showing-results-of', {
            first: this.current,
            total: this.total,
          })}
        </p>
        <Button
          class="p-2"
          style="square-neutral"
          onClick={() => this.nextQuickview?.emit()}
          text={this.bindings.i18n.t('next')}
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

  private get termsToHighlight() {
    return this.bindings.engine.state.search.response.termsToHighlight;
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
