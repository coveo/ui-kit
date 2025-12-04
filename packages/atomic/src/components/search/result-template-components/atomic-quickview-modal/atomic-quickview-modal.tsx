import {
  buildInteractiveResult,
  Result,
  InteractiveResult,
  TermsToHighlight,
} from '@coveo/headless';
import {
  Component,
  Event,
  EventEmitter,
  h,
  Prop,
  State,
  Watch,
  Method,
  VNode,
  Fragment,
} from '@stencil/core';
import CloseIcon from '../../../../images/close.svg';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {ATOMIC_MODAL_EXPORT_PARTS} from '../../../common/atomic-modal/export-parts';
import {IconButton} from '../../../common/stencil-iconButton';
import {LinkWithItemAnalytics} from '../../../common/item-link/stencil-item-link';
import {Button} from '../../../common/stencil-button';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {QuickviewSidebar} from '../atomic-quickview-sidebar/stencil-atomic-quickview-sidebar';
import {QuickviewIframe} from '../quickview-iframe/stencil-quickview-iframe';
import {buildQuickviewPreviewBar} from '../quickview-preview-bar/quickview-preview-bar';
import {
  getWordsHighlights,
  HIGHLIGHT_PREFIX,
  QuickviewWordHighlight,
} from '../quickview-word-highlight/quickview-word-highlight';

export interface HighlightKeywords {
  highlightNone: boolean;
  keywords: {
    [text: string]: {
      indexIdentifier: string;
      enabled: boolean;
    };
  };
}

/**
 * The modal opened when clicking a quickview button.
 * Do not use this component directly; use `atomic-quickview` instead.
 *
 * @part backdrop - The transparent backdrop hiding the content behind the modal.
 * @part container - The modal's outermost container with the outline and background.
 * @part header-wrapper - The wrapper around the header.
 * @part header - The header at the top of the modal.
 * @part header-ruler - The horizontal ruler underneath the header.
 * @part body-wrapper - The wrapper around the body.
 * @part body - The body of the modal, between the header and the footer.
 * @part footer-wrapper - The wrapper with a shadow or background color around the footer.
 * @part footer - The footer at the bottom of the modal.
 * @part quickview-modal-header-icon - The close icon of the modal.
 * @part quickview-modal-header-title - The title of the modal.
 */
@Component({
  tag: 'atomic-quickview-modal',
  styleUrl: 'atomic-quickview-modal.pcss',
  shadow: true,
})
export class AtomicQuickviewModal implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  @State() private highlightKeywords: HighlightKeywords = {
    highlightNone: false,
    keywords: {},
  };
  @Watch('highlightKeywords')
  watchHighlightKeywords() {
    this.handleHighlightsScripts();
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
  @Prop() modalCloseCallback?: () => void;

  private interactiveResult?: InteractiveResult;

  public componentWillLoad(): void {
    this.minimizeSidebar = this.bindings.store.isMobile();
  }

  @Method()
  public async reset() {
    this.highlightKeywords = {
      highlightNone: false,
      keywords: {},
    };
    this.minimizeSidebar = false;
    this.iframeRef = undefined;
    this.content = undefined;
    this.result = undefined;
    this.interactiveResult = undefined;
  }

  private renderHeader() {
    let headerContent: VNode | null = null;
    if (this.result) {
      this.interactiveResult = buildInteractiveResult(this.bindings.engine, {
        options: {result: this.result},
      });
      headerContent = (
        <Fragment>
          <LinkWithItemAnalytics
            href={this.result?.clickUri}
            onSelect={() => this.interactiveResult?.select()}
            onBeginDelayedSelect={() =>
              this.interactiveResult?.beginDelayedSelect()
            }
            onCancelPendingSelect={() =>
              this.interactiveResult?.cancelPendingSelect()
            }
            className="truncate"
            part="quickview-modal-header-title"
          >
            {this.result.title}
          </LinkWithItemAnalytics>
          <IconButton
            partPrefix="quickview-modal-header"
            icon={CloseIcon}
            onClick={() => this.onClose()}
            ariaLabel={this.bindings.i18n.t('close')}
            style="text-transparent"
            title={this.bindings.i18n.t('close')}
          />
        </Fragment>
      );
    }
    return (
      <div slot="header" class="flex w-full items-center justify-between">
        {headerContent}
      </div>
    );
  }

  private renderBody() {
    return (
      <div slot="body" class="grid h-full grid-cols-[min-content_auto]">
        <div
          class="h-full overflow-y-auto"
          style={{backgroundColor: 'var(--atomic-neutral-light)'}}
        >
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
        <div class="relative overflow-auto">
          <QuickviewIframe
            title={this.result?.title ?? this.bindings.i18n.t('preview-modal-title')} 
            logger={this.logger}
            src={this.quickviewSrc}
            sandbox={this.sandbox}
            uniqueIdentifier={this.quickviewUniqueIdentifier}
            content={this.content}
            onSetIframeRef={async (ref) => {
              this.iframeRef = ref;
              this.words = getWordsHighlights(
                this.termsToHighlight,
                this.iframeRef
              );
              this.handleHighlightsScripts();
            }}
          />
          {buildQuickviewPreviewBar(
            this.words,
            this.highlightKeywords,
            this.iframeRef
          )}
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
          disabled={this.current === 1}
          text={this.bindings.i18n.t('quickview-previous')}
        ></Button>
        <p class="text-center">
          {this.bindings.i18n.t('showing-results-of', {
            first: this.current,
            total: this.total,
          })}
        </p>
        <Button
          class="p-2"
          style="square-neutral"
          onClick={() => this.nextQuickview?.emit()}
          disabled={this.current === this.total}
          text={this.bindings.i18n.t('quickview-next')}
        ></Button>
      </div>
    );
  }

  private onClose() {
    this.content = undefined;
    this.result = undefined;
    this.modalCloseCallback && this.modalCloseCallback();
  }

  private get isOpen() {
    return !!this.content && !!this.result;
  }

  private get highlightScriptId() {
    return 'CoveoDisableHighlightStyle';
  }

  private get logger() {
    return this.bindings.engine.logger;
  }

  private get quickviewSrc() {
    return this.bindings.engine.state.resultPreview?.contentURL;
  }

  private enableHighlights() {
    this.removeDisableHighlightScript();
  }

  private enableHighlightsSpecificKeyword(identifier: string) {
    this.removeDisableHighlightScript(identifier);
  }

  private disableHighlights() {
    this.createDisableHighlightScript();
  }

  private disableHighlightsSpecificKeyword(identifier: string) {
    this.createDisableHighlightScript(identifier);
  }

  private removeDisableHighlightScript(identifier?: string) {
    const doc = this.iframeRef?.contentWindow?.document;
    if (!doc) {
      return;
    }
    doc
      .getElementById(
        `${this.highlightScriptId}${identifier ? `:${identifier}` : ''}`
      )
      ?.remove();
  }

  private createDisableHighlightScript(identifier?: string) {
    const doc = this.iframeRef?.contentWindow?.document;
    if (!doc) {
      return;
    }

    const head = doc.head;
    const scriptId = `${this.highlightScriptId}${
      identifier ? `:${identifier}` : ''
    }`;
    const style =
      doc.getElementById(scriptId) || this.bindings.createStyleElement();
    style.setAttribute('id', scriptId);
    head.appendChild(style);
    style.appendChild(
      doc.createTextNode(`[id^="${HIGHLIGHT_PREFIX}${
        identifier ? `:${identifier}` : ''
      }"] {
      background-color: inherit !important;
      color: inherit !important;
    }`)
    );
  }

  private get termsToHighlight() {
    const flatPhrasesToHighlight: TermsToHighlight = {};

    const phrasesToHighlight =
      this.bindings.engine.state.search.response.phrasesToHighlight;

    Object.entries(phrasesToHighlight).forEach(([phrase, keywords]) => {
      flatPhrasesToHighlight[phrase] = Object.entries(keywords).flatMap(
        ([keywordEntry, keywordStemming]) => {
          return [keywordEntry, ...keywordStemming];
        }
      );
    });

    return {
      ...this.bindings.engine.state.search.response.termsToHighlight,
      ...flatPhrasesToHighlight,
    };
  }

  private get requestId() {
    return this.bindings.engine.state.search.requestId;
  }

  private get quickviewUniqueIdentifier() {
    return this.result?.uniqueId + this.requestId;
  }

  private handleHighlightsScripts() {
    if (!this.highlightKeywords.highlightNone) {
      this.enableHighlights();
    } else {
      this.disableHighlights();
    }
    Object.values(this.highlightKeywords.keywords).forEach((word) => {
      if (word.enabled) {
        this.enableHighlightsSpecificKeyword(word.indexIdentifier);
      } else {
        this.disableHighlightsSpecificKeyword(word.indexIdentifier);
      }
    });
  }

  public render() {
    return (
      <atomic-modal
        fullscreen={this.bindings.store.isMobile()}
        class={'atomic-quickview-modal'}
        isOpen={this.isOpen}
        close={() => this.onClose()}
        exportparts={ATOMIC_MODAL_EXPORT_PARTS}
      >
        {this.renderHeader()}
        {this.renderBody()}
        {this.renderFooter()}
      </atomic-modal>
    );
  }
}
