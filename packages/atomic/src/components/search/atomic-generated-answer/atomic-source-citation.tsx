import {
  GeneratedAnswerCitation,
  InteractiveCitation,
  buildInteractiveCitation,
} from '@coveo/headless';
import {Component, Prop, Element, h} from '@stencil/core';
import {Bindings} from '../../../components';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {buildCustomEvent} from '../../../utils/event-utils';
import {LinkWithResultAnalytics} from '../../common/result-link/result-link';

/**
 * @internal
 */
@Component({
  tag: 'atomic-source-citation',
  shadow: false,
})
export class AtomicSourceCitation implements InitializableComponent<Bindings> {
  @InitializeBindings() public bindings!: Bindings;
  public error!: Error;

  @Prop({reflect: true}) citation!: GeneratedAnswerCitation;
  @Prop() index!: number;
  @Prop() href!: string;

  @Element() private host!: HTMLElement;

  private interactiveCitation!: InteractiveCitation;
  private stopPropagation?: boolean;

  public initialize() {
    this.host.dispatchEvent(
      buildCustomEvent(
        'atomic/resolveStopPropagation',
        (stopPropagation: boolean) => {
          this.stopPropagation = stopPropagation;
        }
      )
    );
    this.interactiveCitation = buildInteractiveCitation(this.bindings.engine, {
      options: {
        citation: this.citation,
      },
    });
  }

  public render() {
    return (
      <LinkWithResultAnalytics
        href={this.href}
        title={this.citation.title}
        part="citation"
        target="_blank"
        rel="noopener"
        className="flex items-center p-1 bg-background btn-text-neutral border rounded-full border-neutral text-on-background"
        onSelect={() => this.interactiveCitation.select()}
        onBeginDelayedSelect={() =>
          this.interactiveCitation.beginDelayedSelect()
        }
        onCancelPendingSelect={() =>
          this.interactiveCitation.cancelPendingSelect()
        }
        stopPropagation={this.stopPropagation}
      >
        <div class="citation-index rounded-full font-medium rounded-full flex items-center text-bg-blue shrink-0">
          <div class="mx-auto">{this.index + 1}</div>
        </div>
        <span class="citation-title truncate mx-1">{this.citation.title}</span>
      </LinkWithResultAnalytics>
    );
  }
}
