import {Component, Prop, h, Listen, State} from '@stencil/core';
import {Result} from '@coveo/headless';
import {LinkWithResultAnalytics} from '../result-link/result-link';
import {
  Bindings,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {ResultContextEvent} from '../result-template-components/result-template-decorators';

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

  @Prop() selectSource!: () => void;
  @Prop() beginDelayedSelectSource!: () => void;
  @Prop() cancelPendingSelectSource!: () => void;

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
      <section aria-label={this.bindings.i18n.t('smart-snippet-source')}>
        <LinkWithResultAnalytics
          title={this.source.clickUri}
          href={this.source.clickUri}
          target="_self"
          className="block"
          part="source-url"
          onSelect={this.selectSource}
          onBeginDelayedSelect={() => this.beginDelayedSelectSource}
          onCancelPendingSelect={() => this.cancelPendingSelectSource}
        >
          {this.source.clickUri}
        </LinkWithResultAnalytics>
        <LinkWithResultAnalytics
          title={this.source.title}
          href={this.source.clickUri}
          target="_self"
          className="block mb-6"
          part="source-title"
          onSelect={this.selectSource}
          onBeginDelayedSelect={() => this.beginDelayedSelectSource}
          onCancelPendingSelect={() => this.cancelPendingSelectSource}
        >
          <atomic-result-text
            field="title"
            default="no-title"
          ></atomic-result-text>
        </LinkWithResultAnalytics>
      </section>
    );
  }
}
