import {Result} from '@coveo/headless';
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
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {AnyBindings} from '../interface/bindings';
import {LinkWithItemAnalytics} from '../item-link/stencil-item-link';
import {ResultContextEvent} from '@/src/components/search/result-template-component-utils/context/stencil-result-template-decorators';

/**
 * @part source-url
 * @part source-title
 * @internal
 */
@Component({
  tag: 'atomic-smart-snippet-source',
  shadow: false,
})
export class AtomicSmartSnippetSource
  implements InitializableComponent<AnyBindings>
{
  @InitializeBindings() public bindings!: AnyBindings;
  @Prop({reflect: true, mutable: true}) source!: Result;
  @Prop() anchorAttributes?: Attr[];

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
        <LinkWithItemAnalytics
          title={this.source.clickUri}
          href={this.source.clickUri}
          className="block truncate"
          part="source-url"
          attributes={this.anchorAttributes}
          onSelect={() => this.selectSource.emit()}
          onBeginDelayedSelect={() => this.beginDelayedSelectSource.emit()}
          onCancelPendingSelect={() => this.cancelPendingSelectSource.emit()}
        >
          {this.source.clickUri}
        </LinkWithItemAnalytics>
        <LinkWithItemAnalytics
          title={this.source.title}
          href={this.source.clickUri}
          attributes={this.anchorAttributes}
          className="block"
          part="source-title"
          onSelect={() => this.selectSource.emit()}
          onBeginDelayedSelect={() => this.beginDelayedSelectSource.emit()}
          onCancelPendingSelect={() => this.cancelPendingSelectSource.emit()}
        >
          <atomic-result-text
            field="title"
            default="no-title"
            key={this.source.uniqueId}
          ></atomic-result-text>
        </LinkWithItemAnalytics>
      </Host>
    );
  }
}
