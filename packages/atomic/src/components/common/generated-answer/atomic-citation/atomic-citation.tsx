import { GeneratedAnswerCitation, InteractiveCitation } from '@coveo/headless';
import {
  createPopper,
  preventOverflow,
  Instance as PopperInstance,
} from '@popperjs/core';
import { Component, h, State, Prop, Element, Watch } from '@stencil/core';
import { LinkWithItemAnalytics } from '../../item-link/stencil-item-link';
import { Heading } from '../../stencil-heading';
import {
  generateTextFragmentUrl,
  generatePdfPageUrl,
} from './citation-anchoring-utils';

/**
 * Internal component, only to use through `atomic-generated-answer` or `atomic-insight-generated-answer`
 */
@Component({
  tag: 'atomic-citation',
  styleUrl: 'atomic-citation.pcss',
})
export class AtomicCitation {
  @Element() public host!: HTMLElement;

  /**
   * The citation item information.
   */
  @Prop() citation!: GeneratedAnswerCitation;
  /**
   * The citation index.
   */
  @Prop() index!: number;
  /**
   * Callback function invoked when the user stops hovering over a citation. `citationHoverTimeMs` is the amount of time over which the citation has been hovered.
   */
  @Prop() sendHoverEndEvent!: (citationHoverTimeMs: number) => void;
  /**
   * An `InteractiveCitation` controller instance. It is used when the user interacts with the citation by selecting or hovering over it.
   */
  @Prop() interactiveCitation!: InteractiveCitation;
  /**
   * Option to disable citation anchoring.
   * @default false
   */
  @Prop() disableCitationAnchoring: boolean = false;

  @State() public isOpen = false;

  private citationRef!: HTMLElement;
  private popupRef!: HTMLElement;
  private popperInstance?: PopperInstance;
  private stopPropagation?: boolean;

  private hoverStart?: number;
  private hoverAnalyticsTimeout = 1000;

  private hoverTimeout?: ReturnType<typeof setTimeout>;
  private hoverDebounceTimeoutMs = 200;
  private closePopoverTimeout?: ReturnType<typeof setTimeout>;
  private closePopoverDebounceMs = 100;

  @Watch('isOpen')
  sendHoverAnalytics() {
    if (this.isOpen) {
      this.hoverStart = new Date().getTime();
      return;
    }
    if (!this.hoverStart) {
      return;
    }
    const difference = new Date().getTime() - this.hoverStart;
    if (difference > this.hoverAnalyticsTimeout) {
      this.sendHoverEndEvent(difference);
    }
    this.hoverStart = undefined;
  }

  public componentDidRender() {
    if (this.popperInstance || !this.citationRef || !this.popupRef) {
      return;
    }

    this.popperInstance = createPopper(this.citationRef, this.popupRef, {
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

  public componentDidUpdate() {
    this.popperInstance?.forceUpdate();
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
    clearTimeout(this.hoverTimeout);
    clearTimeout(this.closePopoverTimeout);
    this.isOpen = false;
  };

  private delayedClosePopover = () => {
    clearTimeout(this.hoverTimeout);
    clearTimeout(this.closePopoverTimeout);
    this.closePopoverTimeout = setTimeout(() => {
      this.isOpen = false;
    }, this.closePopoverDebounceMs);
  };

  private cancelClosePopover = () => {
    clearTimeout(this.closePopoverTimeout);
  };

  private delayedPopoverOpen = () => {
    clearTimeout(this.hoverTimeout);
    clearTimeout(this.closePopoverTimeout);
    this.hoverTimeout = setTimeout(
      this.openPopover,
      this.hoverDebounceTimeoutMs
    );
  };

  private renderPopover() {
    return (
      <div
        part="citation-popover"
        class={`border-neutral bg-background z-10 rounded-md border p-4 shadow ${
          this.isOpen ? 'desktop-only:flex' : 'hidden'
        } mobile-only:hidden flex-col gap-3`}
        ref={(el) => (this.popupRef = el!)}
        role="dialog"
        onMouseEnter={this.cancelClosePopover}
        onMouseLeave={this.delayedClosePopover}
      >
        <div class="text-neutral-dark truncate text-sm">
          {this.citation.uri}
        </div>
        <Heading level={0} class="text-md font-bold">
          {this.citation.title}
        </Heading>
        <p class="text-on-background text-sm">{this.getTruncatedText()}</p>
      </div>
    );
  }

  public render() {
    return (
      <div class="relative">
        <LinkWithItemAnalytics
          href={this.anchorUrl(
            this.citation.clickUri ?? this.citation.uri,
            this.citation.text,
            this.citation.fields?.filetype
          )}
          ref={(el) => (this.citationRef = el!)}
          part="citation"
          target="_blank"
          rel="noopener"
          aria-haspopup="dialog"
          className="bg-background btn-outline-primary border-neutral text-on-background flex items-center rounded-full border p-1"
          onSelect={() => this.interactiveCitation.select()}
          onBeginDelayedSelect={() =>
            this.interactiveCitation.beginDelayedSelect()
          }
          onCancelPendingSelect={() =>
            this.interactiveCitation.cancelPendingSelect()
          }
          stopPropagation={this.stopPropagation}
          onMouseLeave={this.delayedClosePopover}
          onMouseOver={this.delayedPopoverOpen}
          onFocus={this.openPopover}
          onBlur={this.closePopover}
        >
          <span class="citation-title mx-1 truncate">
            {this.citation.title}
          </span>
        </LinkWithItemAnalytics>
        {this.renderPopover()}
      </div>
    );
  }
}
