import {
  GeneratedAnswerCitation,
  InteractiveCitation,
  buildInteractiveCitation,
} from '@coveo/headless';
import {
  createPopper,
  preventOverflow,
  Instance as PopperInstance,
} from '@popperjs/core';
import {Component, h, State, Prop, Element} from '@stencil/core';
import {buildCustomEvent} from '../../../../utils/event-utils';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {Heading} from '../../../common/heading';
import {LinkWithResultAnalytics} from '../../../common/result-link/result-link';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-citation',
  styleUrl: 'atomic-citation.pcss',
})
export class AtomicCitation implements InitializableComponent {
  @Element() public host!: HTMLElement;
  @InitializeBindings()
  public bindings!: Bindings;

  @Prop() citation!: GeneratedAnswerCitation;
  @Prop() index!: number;

  @State()
  public error!: Error;
  @State()
  public isOpen = false;

  private citationRef!: HTMLElement;
  private popupRef!: HTMLElement;
  private popperInstance?: PopperInstance;
  private stopPropagation?: boolean;

  private interactiveCitation!: InteractiveCitation;

  public initialize() {
    this.interactiveCitation = buildInteractiveCitation(this.bindings.engine, {
      options: {
        citation: this.citation,
      },
    });
    this.host.dispatchEvent(
      buildCustomEvent(
        'atomic/resolveStopPropagation',
        (stopPropagation: boolean) => {
          this.stopPropagation = stopPropagation;
        }
      )
    );
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

  private renderPopover() {
    return (
      <div
        part="citation-popover"
        class={`rounded-md border border-neutral p-4 shadow z-10 bg-background ${
          this.isOpen ? 'flex' : 'hidden'
        } flex-col gap-3`}
        ref={(el) => (this.popupRef = el!)}
        role="dialog"
      >
        <div class="truncate text-neutral-dark text-sm">
          {this.citation.clickUri}
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
        <LinkWithResultAnalytics
          href={this.citation.clickUri ?? this.citation.uri}
          ref={(el) => (this.citationRef = el!)}
          title={this.citation.title}
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
          onMouseLeave={() => (this.isOpen = false)}
          onMouseOver={() => (this.isOpen = true)}
          onFocus={() => (this.isOpen = true)}
          onBlur={() => (this.isOpen = false)}
        >
          <div class="citation-index rounded-full font-medium flex items-center text-bg-primary shrink-0">
            <div class="mx-auto">{this.index + 1}</div>
          </div>
          <span class="citation-title truncate mx-1">
            {this.citation.title}
          </span>
        </LinkWithResultAnalytics>
        {this.renderPopover()}
      </div>
    );
  }
}
