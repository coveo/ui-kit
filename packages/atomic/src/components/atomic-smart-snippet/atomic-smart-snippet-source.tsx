import {Component, Prop, h, Listen} from '@stencil/core';
import {buildInteractiveResult, Result, SmartSnippet} from '@coveo/headless';
import {LinkWithResultAnalytics} from '../result-link/result-link';
import {
  Bindings,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {ResultContextEvent} from '../result-template-components/result-template-decorators';

@Component({
  tag: 'atomic-smart-snippet-source',
  shadow: false,
})
export class AtomicSmartSnippetSource implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @Prop() source!: Result;
  @Prop() smartSnippet: SmartSnippet | undefined;
  @Prop() isSuggestion!: boolean;
  public error!: Error;

  @Listen('atomic/resolveResult')
  public resolveResult(event: ResultContextEvent<Result>) {
    event.preventDefault();
    event.stopPropagation();
    if (this.source) event.detail(this.source);
  }

  render() {
    const interactiveResult = buildInteractiveResult(this.bindings.engine!, {
      options: {result: this.source},
    });

    if (this.smartSnippet && !this.isSuggestion) {
      return (
        <section aria-label={this.bindings.i18n.t('smart-snippet-source')}>
          <div part="source-url">
            <LinkWithResultAnalytics
              title={this.source.clickUri}
              href={this.source.clickUri}
              target="_self"
              onSelect={() => this.smartSnippet!.selectSource()}
              onBeginDelayedSelect={() =>
                this.smartSnippet!.beginDelayedSelectSource()
              }
              onCancelPendingSelect={() =>
                this.smartSnippet!.cancelPendingSelectSource()
              }
            >
              {this.source.clickUri}
            </LinkWithResultAnalytics>
          </div>
          <div part="source-title" class="mb-6">
            <LinkWithResultAnalytics
              title={this.source.title}
              href={this.source.clickUri}
              target="_self"
              onSelect={() => this.smartSnippet!.selectSource()}
              onBeginDelayedSelect={() =>
                this.smartSnippet!.beginDelayedSelectSource()
              }
              onCancelPendingSelect={() =>
                this.smartSnippet!.cancelPendingSelectSource()
              }
            >
              <atomic-result-text
                field="title"
                default="no-title"
              ></atomic-result-text>
            </LinkWithResultAnalytics>
          </div>
        </section>
      );
    }

    return [
      <LinkWithResultAnalytics
        title={this.source.clickUri}
        href={this.source.clickUri}
        target="_self"
        part="source-url"
        onSelect={() => interactiveResult.select()}
        onBeginDelayedSelect={() => interactiveResult.beginDelayedSelect()}
        onCancelPendingSelect={() => interactiveResult.cancelPendingSelect()}
      >
        {this.source.clickUri}
      </LinkWithResultAnalytics>,
      <LinkWithResultAnalytics
        title={this.source.title}
        href={this.source.clickUri}
        target="_self"
        part="source-title"
        onSelect={() => interactiveResult.select()}
        onBeginDelayedSelect={() => interactiveResult.beginDelayedSelect()}
        onCancelPendingSelect={() => interactiveResult.cancelPendingSelect()}
      >
        <atomic-result-text
          field="title"
          default="no-title"
        ></atomic-result-text>
      </LinkWithResultAnalytics>,
    ];
  }
}
