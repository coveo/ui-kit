import '@/src/components/common/atomic-modal/atomic-modal';
import {
  buildInteractiveResult,
  type InteractiveResult,
  type Result,
  type TermsToHighlight,
} from '@coveo/headless';
import {type CSSResultGroup, css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ATOMIC_MODAL_EXPORT_PARTS} from '@/src/components/common/atomic-modal/export-parts';
import {renderButton} from '@/src/components/common/button';
import {renderIconButton} from '@/src/components/common/icon-button';
import {renderLinkWithItemAnalytics} from '@/src/components/common/item-link/item-link';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {renderQuickviewSidebar} from '@/src/components/search/result-template-components/atomic-quickview-sidebar/atomic-quickview-sidebar';
import {renderQuickviewIframe} from '@/src/components/search/result-template-components/quickview-iframe/quickview-iframe';
import {buildQuickviewPreviewBar} from '@/src/components/search/result-template-components/quickview-preview-bar/quickview-preview-bar';
import {
  getWordsHighlights,
  HIGHLIGHT_PREFIX,
  type QuickviewWordHighlight,
} from '@/src/components/search/result-template-components/quickview-word-highlight/quickview-word-highlight';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import CloseIcon from '../../../images/close.svg';
import type {HighlightKeywords} from './highlight-keywords';

/**
 * The `atomic-quickview-modal` component is the modal opened when clicking a quickview button.
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
 *
 * @event atomic/quickview/next - Dispatched when the next button is clicked.
 * @event atomic/quickview/previous - Dispatched when the previous button is clicked.
 */
@customElement('atomic-quickview-modal')
@bindings()
@withTailwindStyles
export class AtomicQuickviewModal
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles: CSSResultGroup = css`
    @reference '../../../../utils/tailwind.global.tw.css';

    :host::part(backdrop) {
      grid-template-columns: 1fr max(80vw, 30rem) 1fr;
      grid-template-rows: 1fr 100% 3fr;
    }

    :host::part(body),
    :host::part(header),
    :host::part(footer) {
      @apply max-w-full;
    }

    :host::part(footer) {
      @apply flex justify-center;
    }

    :host::part(body-wrapper) {
      @apply h-full overflow-hidden p-0;
    }

    :host::part(body) {
      @apply h-full;
    }

    :host::part(header-wrapper) {
      @apply bg-neutral-light;
    }

    a {
      text-decoration: underline;
      @apply text-primary hover:underline;
    }
  `;

  @state()
  public bindings!: Bindings;

  @state()
  public error!: Error;

  @state()
  private highlightKeywords: HighlightKeywords = {
    highlightNone: false,
    keywords: {},
  };

  @state()
  private minimizeSidebar = false;

  @state()
  private words: Record<string, QuickviewWordHighlight> = {};

  private iframeRef?: HTMLIFrameElement;

  /**
   * The HTML content to display in the quickview modal.
   */
  @property({type: String, attribute: false})
  content?: string;

  /**
   * The result object associated with the quickview.
   */
  @property({type: Object, attribute: false})
  result?: Result;

  /**
   * The current position in the result list.
   */
  @property({type: Number})
  current?: number;

  /**
   * The total number of results.
   */
  @property({type: Number})
  total?: number;

  /**
   * The sandbox attribute for the iframe.
   */
  @property({type: String})
  sandbox?: string;

  /**
   * The callback function to invoke when the modal is closed.
   */
  @property({type: Object, attribute: false})
  modalCloseCallback?: () => void;

  private interactiveResult?: InteractiveResult;

  public initialize() {
    this.minimizeSidebar = this.bindings.store.isMobile();
  }

  /**
   * Resets the modal to its initial state.
   */
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

  willUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('highlightKeywords')) {
      this.handleHighlightsScripts();
    }
  }

  private renderHeader() {
    if (!this.result) {
      return nothing;
    }

    this.interactiveResult = buildInteractiveResult(this.bindings.engine, {
      options: {result: this.result},
    });

    return html`
      <div slot="header" class="flex w-full items-center justify-between">
        ${renderLinkWithItemAnalytics({
          props: {
            href: this.result.clickUri,
            onSelect: () => this.interactiveResult?.select(),
            onBeginDelayedSelect: () =>
              this.interactiveResult?.beginDelayedSelect(),
            onCancelPendingSelect: () =>
              this.interactiveResult?.cancelPendingSelect(),
            className: 'truncate',
            part: 'quickview-modal-header-title',
          },
        })(html`${this.result.title}`)}
        ${renderIconButton({
          props: {
            partPrefix: 'quickview-modal-header',
            icon: CloseIcon,
            onClick: () => this.onClose(),
            ariaLabel: this.bindings.i18n.t('close'),
            style: 'text-transparent',
            title: this.bindings.i18n.t('close'),
          },
        })}
      </div>
    `;
  }

  private renderBody() {
    return html`
      <div slot="body" class="grid h-full grid-cols-[min-content_auto]">
        <div
          class="h-full overflow-y-auto"
          style="background-color: var(--atomic-neutral-light)"
        >
          ${renderQuickviewSidebar({
            props: {
              words: this.words,
              i18n: this.bindings.i18n,
              highlightKeywords: this.highlightKeywords,
              onHighlightKeywords: (highlight: HighlightKeywords) => {
                this.highlightKeywords = highlight;
              },
              minimized: this.minimizeSidebar,
              onMinimize: (minimize: boolean) => {
                this.minimizeSidebar = minimize;
              },
            },
          })}
        </div>
        <div class="relative overflow-auto">
          ${renderQuickviewIframe({
            props: {
              title:
                this.result?.title ??
                this.bindings.i18n.t('preview-modal-title'),
              logger: this.logger,
              src: this.quickviewSrc,
              sandbox: this.sandbox,
              uniqueIdentifier: this.quickviewUniqueIdentifier,
              content: this.content,
              onSetIframeRef: async (ref: HTMLIFrameElement) => {
                this.iframeRef = ref;
                this.words = getWordsHighlights(
                  this.termsToHighlight,
                  this.iframeRef
                );
                this.handleHighlightsScripts();
              },
            },
          })}
          ${buildQuickviewPreviewBar(
            this.words,
            this.highlightKeywords,
            this.iframeRef
          )}
        </div>
      </div>
    `;
  }

  private renderFooter() {
    return html`
      <div slot="footer" class="flex items-center gap-2">
        ${renderButton({
          props: {
            class: 'p-2',
            style: 'square-neutral',
            onClick: () => {
              this.dispatchEvent(
                new CustomEvent('atomic/quickview/previous', {bubbles: true})
              );
            },
            disabled: this.current === 1,
            text: this.bindings.i18n.t('quickview-previous'),
          },
        })(nothing)}
        <p class="text-center">
          ${this.bindings.i18n.t('showing-results-of', {
            first: this.current,
            total: this.total,
          })}
        </p>
        ${renderButton({
          props: {
            class: 'p-2',
            style: 'square-neutral',
            onClick: () => {
              this.dispatchEvent(
                new CustomEvent('atomic/quickview/next', {bubbles: true})
              );
            },
            disabled: this.current === this.total,
            text: this.bindings.i18n.t('quickview-next'),
          },
        })(nothing)}
      </div>
    `;
  }

  private onClose() {
    this.content = undefined;
    this.result = undefined;
    this.modalCloseCallback?.();
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

  @bindingGuard()
  @errorGuard()
  render() {
    return html`
      <atomic-modal
        .fullscreen=${this.bindings.store.isMobile()}
        class="atomic-quickview-modal"
        .isOpen=${this.isOpen}
        .close=${() => this.onClose()}
        exportparts=${ATOMIC_MODAL_EXPORT_PARTS}
      >
        ${this.renderHeader()} ${this.renderBody()} ${this.renderFooter()}
      </atomic-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-quickview-modal': AtomicQuickviewModal;
  }
}
