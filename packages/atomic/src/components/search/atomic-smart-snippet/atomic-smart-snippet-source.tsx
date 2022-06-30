import {
  Component,
  Prop,
  h,
  Listen,
  State,
  EventEmitter,
  Event,
  Host,
} from '@stencil/core';
import {Result} from '@coveo/headless';
import {LinkWithResultAnalytics} from '../result-link/result-link';
import {
  InitializableComponent,
  InitializeBindings,
} from '@utils/initialization-utils';
import {ResultContextEvent} from '../result-template-components/result-template-decorators';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * @part source-url
 * @part source-title
 * @internal
 */
@Component({
  tag: 'atomic-smart-snippet-source',
  shadow: false,
})
export class AtomicSmartSnippetSource implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @Prop({reflect: true, mutable: true}) source!: Result;

  @Event() selectSource!: EventEmitter;
  @Event() beginDelayedSelectSource!: EventEmitter;
  @Event() cancelPendingSelectSource!: EventEmitter;

  @State() public error!: Error;

  @Listen('atomic/resolveResult')
  public resolveResult(event: ResultContextEvent<Result>) {
    event.preventDefault();
    event.stopPropagation();
    if (this.source) {
      event.detail(this.source);
    }
  }

  render() {
    return (
      <Host>
        <LinkWithResultAnalytics
          title={this.source.clickUri}
          href={this.source.clickUri}
          target="_self"
          className="block"
          part="source-url"
          onSelect={() => this.selectSource.emit()}
          onBeginDelayedSelect={() => this.beginDelayedSelectSource.emit()}
          onCancelPendingSelect={() => this.cancelPendingSelectSource.emit()}
        >
          {this.source.clickUri}
        </LinkWithResultAnalytics>
        <LinkWithResultAnalytics
          title={this.source.title}
          href={this.source.clickUri}
          target="_self"
          className="block"
          part="source-title"
          onSelect={() => this.selectSource.emit()}
          onBeginDelayedSelect={() => this.beginDelayedSelectSource.emit()}
          onCancelPendingSelect={() => this.cancelPendingSelectSource.emit()}
        >
          <atomic-result-text
            field="title"
            default="no-title"
          ></atomic-result-text>
        </LinkWithResultAnalytics>
      </Host>
    );
  }
}
