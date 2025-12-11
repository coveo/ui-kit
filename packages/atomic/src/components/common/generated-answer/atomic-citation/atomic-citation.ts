import type {
  GeneratedAnswerCitation,
  InteractiveCitation,
} from '@coveo/headless';
import {
  createPopper,
  type Instance as PopperInstance,
  preventOverflow,
} from '@popperjs/core';
import {type CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {createRef, type Ref, ref} from 'lit/directives/ref.js';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {renderHeading} from '../../heading';
import {renderLinkWithItemAnalytics} from '../../item-link/item-link';
import styles from './atomic-citation.tw.css';
import {
  generatePdfPageUrl,
  generateTextFragmentUrl,
} from './citation-anchoring-utils';

/**
 * The `atomic-citation` component displays a citation with hover popover functionality.
 * Internal component, only to use through `atomic-generated-answer` or `atomic-insight-generated-answer`.
 *
 * @internal
 *
 * @part citation - The citation link element.
 * @part citation-popover - The popover container that appears on hover.
 */
@customElement('atomic-citation')
@withTailwindStyles
export class AtomicCitation extends LitElement {
  static styles: CSSResultGroup = styles;

  /**
   * The citation item information.
   */
  @property({type: Object}) citation!: GeneratedAnswerCitation;

  /**
   * The citation index.
   */
  @property({type: Number}) index!: number;

  /**
   * Callback function invoked when the user stops hovering over a citation. `citationHoverTimeMs` is the amount of time over which the citation has been hovered.
   */
  @property({type: Object}) sendHoverEndEvent!: (
    citationHoverTimeMs: number
  ) => void;

  /**
   * An `InteractiveCitation` controller instance. It is used when the user interacts with the citation by selecting or hovering over it.
   */
  @property({type: Object}) interactiveCitation!: InteractiveCitation;

  /**
   * Option to disable citation anchoring.
   * @default false
   */
  @property({type: Boolean, attribute: 'disable-citation-anchoring'})
  disableCitationAnchoring = false;

  @state() public isOpen = false;

  private citationRef: Ref<HTMLAnchorElement> = createRef();
  private popupRef: Ref<HTMLDivElement> = createRef();
  private popperInstance?: PopperInstance;
  private stopPropagation?: boolean;

  private hoverStart?: number;
  private hoverAnalyticsTimeout = 1000;

  private hoverTimeout?: ReturnType<typeof setTimeout>;
  private hoverDebounceTimeoutMs = 200;
  private closePopoverTimeout?: ReturnType<typeof setTimeout>;
  private closePopoverDebounceMs = 100;

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupPopper();
    this.clearTimers();
  }

  @watch('isOpen')
  sendHoverAnalytics() {
    if (this.isOpen) {
      this.hoverStart = Date.now();
      return;
    }
    if (!this.hoverStart) {
      return;
    }
    const difference = Date.now() - this.hoverStart;
    if (difference > this.hoverAnalyticsTimeout) {
      this.sendHoverEndEvent(difference);
    }
    this.hoverStart = undefined;
  }

  updated() {
    this.updatePopper();
  }

  private updatePopper() {
    if (this.popperInstance) {
      this.popperInstance.forceUpdate();
      return;
    }

    const citationEl = this.citationRef.value;
    const popupEl = this.popupRef.value;

    if (!citationEl || !popupEl) {
      return;
    }

    this.popperInstance = createPopper(citationEl, popupEl, {
      placement: 'top-start',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 6],
          },
        },
        preventOverflow,
      ],
    });
  }

  private cleanupPopper() {
    if (this.popperInstance) {
      this.popperInstance.destroy();
      this.popperInstance = undefined;
    }
  }

  private clearTimers() {
    clearTimeout(this.hoverTimeout);
    clearTimeout(this.closePopoverTimeout);
  }

  private getTruncatedText() {
    return (
      this.citation.text &&
      `${this.citation.text?.trim().slice(0, 200)}${
        this.citation.text.length > 200 ? '...' : ''
      }`
    );
  }

  private anchorUrl(
    uri: string,
    text?: string,
    filetype?: string,
    pageNumber?: number
  ) {
    if (this.disableCitationAnchoring) {
      return uri;
    }

    switch (filetype) {
      case 'html':
        return generateTextFragmentUrl(uri, text, filetype);
      case 'pdf':
        return generatePdfPageUrl(uri, pageNumber);
      default:
        return uri;
    }
  }

  private openPopover = () => {
    this.isOpen = true;
  };

  private closePopover = () => {
    this.clearTimers();
    this.isOpen = false;
  };

  private delayedClosePopover = () => {
    this.clearTimers();
    this.closePopoverTimeout = setTimeout(() => {
      this.isOpen = false;
    }, this.closePopoverDebounceMs);
  };

  private cancelClosePopover = () => {
    clearTimeout(this.closePopoverTimeout);
  };

  private delayedPopoverOpen = () => {
    this.clearTimers();
    this.hoverTimeout = setTimeout(
      this.openPopover,
      this.hoverDebounceTimeoutMs
    );
  };

  private renderPopover() {
    return html`
      <div
        ${ref(this.popupRef)}
        part="citation-popover"
        class="${classMap({
          'border-neutral bg-background mobile-only:hidden z-10 rounded-md border p-4 shadow flex-col gap-3': true,
          'desktop-only:flex': this.isOpen,
          hidden: !this.isOpen,
        })}"
        role="dialog"
        @mouseenter=${this.cancelClosePopover}
        @mouseleave=${this.delayedClosePopover}
      >
        <div class="text-neutral-dark truncate text-sm">
          ${this.citation.uri}
        </div>
        ${renderHeading({
          props: {
            level: 0,
            class: 'text-md font-bold',
          },
        })(html`${this.citation.title}`)}
        <p class="text-on-background text-sm">${this.getTruncatedText()}</p>
      </div>
    `;
  }

  render() {
    const ariaHaspopupAttr = document.createAttribute('aria-haspopup');
    ariaHaspopupAttr.value = 'dialog';

    return html`
      <div class="relative">
        ${renderLinkWithItemAnalytics({
          props: {
            href: this.anchorUrl(
              this.citation.clickUri ?? this.citation.uri,
              this.citation.text,
              this.citation.fields?.filetype
            ),
            ref: (el) => {
              if (el) {
                this.citationRef.value = el;
              }
            },
            part: 'citation',
            target: '_blank',
            rel: 'noopener',
            attributes: [ariaHaspopupAttr],
            className:
              'bg-background btn-outline-primary border-neutral text-on-background flex items-center rounded-full border p-1',
            onSelect: () => this.interactiveCitation.select(),
            onBeginDelayedSelect: () =>
              this.interactiveCitation.beginDelayedSelect(),
            onCancelPendingSelect: () =>
              this.interactiveCitation.cancelPendingSelect(),
            stopPropagation: this.stopPropagation,
            onMouseLeave: this.delayedClosePopover,
            onMouseOver: this.delayedPopoverOpen,
            onFocus: this.openPopover,
            onBlur: this.closePopover,
          },
        })(html`
          <span class="citation-title mx-1 truncate">
            ${this.citation.title}
          </span>
        `)}
        ${this.renderPopover()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-citation': AtomicCitation;
  }
}
