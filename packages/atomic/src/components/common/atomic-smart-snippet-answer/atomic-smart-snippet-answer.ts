import type {InlineLink} from '@coveo/headless';
import DOMPurify from 'dompurify';
import {type CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {createRef, type Ref, ref} from 'lit/directives/ref.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {when} from 'lit/directives/when.js';
import {bindAnalyticsToLink} from '@/src/components/common/item-link/bind-analytics-to-link';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {sanitizeStyle} from '@/src/utils/utils';
import styles from './atomic-smart-snippet-answer.tw.css';

/**
 * The `atomic-smart-snippet-answer` component displays a relevant snippet from the document.
 *
 * @part answer - The container displaying the snippet from the document.
 *
 * @event answerSizeUpdated - Dispatched when the content of the snippet size changes.
 * @event selectInlineLink - Dispatched when an inline link is selected.
 * @event beginDelayedSelectInlineLink - Dispatched when a delayed selection begins for an inline link.
 * @event cancelPendingSelectInlineLink - Dispatched when a pending selection is canceled for an inline link.
 *
 * @internal
 */
@customElement('atomic-smart-snippet-answer')
@withTailwindStyles
export class AtomicSmartSnippetAnswer extends LitElement {
  static styles: CSSResultGroup = styles;

  /**
   * The HTML content to display in the answer.
   */
  @property({type: String, attribute: 'html-content'}) htmlContent!: string;

  /**
   * The inline style to apply to the content (sanitized before use).
   */
  @property({type: String, attribute: 'inner-style'}) innerStyle?: string;

  private wrapperRef: Ref<HTMLDivElement> = createRef();
  private contentRef: Ref<HTMLDivElement> = createRef();
  private isRendering = true;
  private resizeObserver: ResizeObserver | undefined;
  private cleanupAnalyticsFunctions: (() => void)[] = [];

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.cleanupAnalyticsFunctions.forEach((cleanup) => cleanup());
    this.cleanupAnalyticsFunctions = [];
  }

  willUpdate() {
    this.isRendering = true;
  }

  updated() {
    this.isRendering = false;
    this.emitCurrentHeight();
    this.bindAnalyticsToLinks();
  }

  firstUpdated() {
    // Prevents initial transition
    requestAnimationFrame(() => {
      this.classList.add('loaded');
    });

    this.setupResizeObserver();
  }

  render() {
    return html`${this.renderStyle()} ${this.renderContent()}`;
  }

  private setupResizeObserver() {
    if (this.wrapperRef.value) {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      this.resizeObserver = new ResizeObserver(() => this.emitCurrentHeight());
      this.resizeObserver.observe(this.wrapperRef.value);
    }
  }

  private get sanitizedStyle() {
    if (!this.innerStyle) {
      return undefined;
    }
    return sanitizeStyle(this.innerStyle);
  }

  private emitCurrentHeight() {
    if (this.isRendering || !this.wrapperRef.value) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent('answerSizeUpdated', {
        detail: {height: this.wrapperRef.value.scrollHeight},
        bubbles: false,
      })
    );
  }

  private bindAnalyticsToLink(element: HTMLAnchorElement) {
    const link: InlineLink = {
      linkText: element.innerText,
      linkURL: element.href,
    };
    const cleanup = bindAnalyticsToLink(element, {
      stopPropagation: false,
      onSelect: () =>
        this.dispatchEvent(
          new CustomEvent('selectInlineLink', {
            detail: link,
            bubbles: false,
          })
        ),
      onBeginDelayedSelect: () =>
        this.dispatchEvent(
          new CustomEvent('beginDelayedSelectInlineLink', {
            detail: link,
            bubbles: false,
          })
        ),
      onCancelPendingSelect: () =>
        this.dispatchEvent(
          new CustomEvent('cancelPendingSelectInlineLink', {
            detail: link,
            bubbles: false,
          })
        ),
    });
    this.cleanupAnalyticsFunctions.push(cleanup);
  }

  private bindAnalyticsToLinks() {
    if (!this.contentRef.value) {
      return;
    }

    // Clean up previous bindings
    this.cleanupAnalyticsFunctions.forEach((cleanup) => cleanup());
    this.cleanupAnalyticsFunctions = [];

    // Bind analytics to all links in the content
    Array.from(this.contentRef.value.querySelectorAll('a')).forEach((link) =>
      this.bindAnalyticsToLink(link)
    );
  }

  private renderStyle() {
    const style = this.sanitizedStyle;
    return when(
      style,
      () =>
        html`<style>
          ${unsafeHTML(style)}
        </style>`
    );
  }

  private renderContent() {
    return html`
      <div class="wrapper" ${ref(this.wrapperRef)}>
        <div part="answer" class="margin" ${ref(this.contentRef)}>
          ${unsafeHTML(
            DOMPurify.sanitize(this.htmlContent, {
              USE_PROFILES: {html: true},
            })
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-smart-snippet-answer': AtomicSmartSnippetAnswer;
  }
}
