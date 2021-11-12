import {Component, h, Prop, State} from '@stencil/core';
import {
  QuerySummary,
  QuerySummaryState,
  buildQuerySummary,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import escape from 'escape-html';
import {AriaLiveRegion} from '../../utils/accessibility-utils';

/**
 * The `atomic-query-summary` component displays information about the current range of results and the request duration (e.g., "Results 1-10 of 123 in 0.47 seconds").
 *
 * @part container - The container for the whole summary.
 * @part results - The container for the results.
 * @part duration - The container for the duration.
 * @part highlight - The summary highlights.
 * @part placeholder - The query summary placeholder used while the search interface is initializing.
 */
@Component({
  tag: 'atomic-query-summary',
  styleUrl: 'atomic-query-summary.pcss',
  shadow: true,
})
export class AtomicQuerySummary implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public querySummary!: QuerySummary;

  @BindStateToController('querySummary')
  @State()
  private querySummaryState!: QuerySummaryState;
  private strings = {
    inSeconds: (count: number) => this.bindings.i18n.t('in-seconds', {count}),
  };
  @State() public error!: Error;

  /**
   * Whether to display the duration of the last query execution.
   */
  @Prop() enableDuration = false;

  @AriaLiveRegion('query-summary')
  protected ariaMessage!: string;

  public initialize() {
    this.querySummary = buildQuerySummary(this.bindings.engine);
  }

  private renderDuration() {
    if (this.enableDuration && this.querySummaryState.hasDuration) {
      return (
        <span part="duration">
          {' '}
          {this.strings.inSeconds(this.querySummaryState.durationInSeconds)}
        </span>
      );
    }
  }

  private wrapHighlight(content: string) {
    return `<span class="font-bold" part="highlight">${content}</span>`;
  }

  private get resultOfOptions() {
    const locales = this.bindings.i18n.languages;
    return {
      count: this.querySummaryState.lastResult,
      first: this.querySummaryState.firstResult.toLocaleString(locales),
      last: this.querySummaryState.lastResult.toLocaleString(locales),
      total: this.querySummaryState.total.toLocaleString(locales),
      query: this.querySummaryState.query,
    };
  }

  private get highlightedResultOfOptions() {
    const {first, last, total, query, ...options} = this.resultOfOptions;
    return {
      ...options,
      interpolation: {escapeValue: false},
      first: this.wrapHighlight(first),
      last: this.wrapHighlight(last),
      total: this.wrapHighlight(total),
      query: this.wrapHighlight(escape(query)),
    };
  }

  private get summary() {
    if (this.querySummaryState.isLoading) {
      return this.bindings.i18n.t('loading-results');
    }
    return this.bindings.i18n.t(
      this.querySummaryState.hasQuery
        ? 'showing-results-of-with-query'
        : 'showing-results-of',
      this.resultOfOptions
    );
  }

  private renderHasResults() {
    const content = this.bindings.i18n.t(
      this.querySummaryState.hasQuery
        ? 'showing-results-of-with-query'
        : 'showing-results-of',
      this.highlightedResultOfOptions
    );

    return <span part="results" innerHTML={content}></span>;
  }

  public render() {
    if (this.querySummaryState.hasError) {
      return;
    }

    if (!this.querySummaryState.firstSearchExecuted) {
      return (
        <div
          part="placeholder"
          aria-hidden="true"
          class="h-6 my-2 w-60 bg-neutral rounded animate-pulse"
        ></div>
      );
    }

    if (this.querySummaryState.hasResults) {
      this.ariaMessage = this.summary;
    }

    return (
      <div class="text-on-background" part="container">
        {this.querySummaryState.hasResults && [
          this.renderHasResults(),
          this.renderDuration(),
        ]}
      </div>
    );
  }
}
