import {GeneratedAnswerCitation, InteractiveCitation} from '@coveo/headless';
import {
  createPopper,
  preventOverflow,
  Instance as PopperInstance,
} from '@popperjs/core';
import {Component, h, State, Prop, Element, Watch} from '@stencil/core';
import {Heading} from '../../heading';
import {LinkWithItemAnalytics} from '../../item-link/item-link';

/**
 * @internal
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

  @State() public isOpen = false;

  private citationRef!: HTMLElement;
  private popupRef!: HTMLElement;
  private popperInstance?: PopperInstance;
  private stopPropagation?: boolean;

  private hoverStart?: number;
  private hoverAnalyticsTimeout = 1000;

  private hoverTimeout?: ReturnType<typeof setTimeout>;
  private hoverDebounceTimeoutMs = 200;

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

  private openPopover = () => {
    this.isOpen = true;
  };

  private closePopover = () => {
    clearTimeout(this.hoverTimeout);
    this.isOpen = false;
  };

  private delayedPopoverOpen = () => {
    clearTimeout(this.hoverTimeout);
    this.hoverTimeout = setTimeout(
      this.openPopover,
      this.hoverDebounceTimeoutMs
    );
  };

  private renderPopover() {
    return (
      <div
        part="citation-popover"
        class={`rounded-md border border-neutral p-4 shadow z-10 bg-background ${
          this.isOpen ? 'desktop-only:flex' : 'hidden'
        } flex-col gap-3 mobile-only:hidden`}
        ref={(el) => (this.popupRef = el!)}
        role="dialog"
      >
        <div class="truncate text-neutral-dark text-sm">
          {this.citation.uri}
        </div>
        <Heading level={0} class="font-bold text-md">
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
          href={this.citation.clickUri ?? this.citation.uri}
          ref={(el) => (this.citationRef = el!)}
          part="citation"
          target="_blank"
          rel="noopener"
          aria-haspopup="dialog"
          className="flex items-center p-1 bg-background btn-outline-primary border rounded-full border-neutral text-on-background"
          onSelect={() => this.interactiveCitation.select()}
          onBeginDelayedSelect={() =>
            this.interactiveCitation.beginDelayedSelect()
          }
          onCancelPendingSelect={() =>
            this.interactiveCitation.cancelPendingSelect()
          }
          stopPropagation={this.stopPropagation}
          onMouseLeave={this.closePopover}
          onMouseOver={this.delayedPopoverOpen}
          onFocus={this.openPopover}
          onBlur={this.closePopover}
        >
          <div
            part="citation-index"
            class="rounded-full font-medium flex items-center text-bg-primary shrink-0"
          >
            <div class="mx-auto">{this.index + 1}</div>
          </div>
          <span class="citation-title truncate mx-1">
            {this.citation.title}
          </span>
        </LinkWithItemAnalytics>
        {this.renderPopover()}
      </div>
    );
  }
}
