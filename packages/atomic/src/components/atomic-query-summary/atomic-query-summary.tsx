import {Component, h, Prop, State} from '@stencil/core';
import {
  QuerySummary,
  QuerySummaryState,
  buildQuerySummary,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  BindStateToI18n,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {sanitize} from '../../utils/utils';

interface Summary {
  count: number;
  first: string;
  last: string;
  total: string;
  query: string;
}

/**
 * The QuerySummary displays information about the current range of results and the request duration (e.g., "Results
 * 1-10 of 123 in 0.47 seconds").
 *
 * @part container - The container of the whole summary
 * @part results - The results container
 * @part no-results - The container when there are no results
 * @part duration - The duration container
 * @part highlight - The summary highlights
 */
@Component({
  tag: 'atomic-query-summary',
  styleUrl: 'atomic-query-summary.pcss',
  shadow: true,
})
export class AtomicQuerySummary implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public querySummary!: QuerySummary;
  private unescapeStringOption = {interpolation: {escapeValue: false}};

  @BindStateToController('querySummary')
  @State()
  private querySummaryState!: QuerySummaryState;
  @BindStateToI18n()
  @State()
  private strings = {
    noResults: () => this.bindings.i18n.t('noResults'),
    noResultsFor: (query: string) =>
      this.bindings.i18n.t('noResultsFor', {
        ...this.unescapeStringOption,
        query,
      }),
    showingResultsOf: (resultOfOptions: Summary) =>
      this.bindings.i18n.t('showingResultsOf', {
        ...this.unescapeStringOption,
        ...resultOfOptions,
      }),
    showingResultsOfWithQuery: (resultOfOptions: Summary) =>
      this.bindings.i18n.t('showingResultsOfWithQuery', {
        ...this.unescapeStringOption,
        ...resultOfOptions,
      }),
    inSeconds: (count: number) => this.bindings.i18n.t('inSeconds', {count}),
  };
  @State() public error!: Error;

  /**
   * Whether to display the duration of the last query execution.
   */
  @Prop() enableDuration = true;

  public initialize() {
    this.querySummary = buildQuerySummary(this.bindings.engine);
  }

  private renderDuration() {
    if (this.enableDuration && this.querySummaryState.hasDuration) {
      return (
        <span part="duration">
          &nbsp;{' '}
          {this.strings.inSeconds(this.querySummaryState.durationInSeconds)}
        </span>
      );
    }
  }

  private wrapHighlight(content: string) {
    return `<b part="highlight">${content}</b>`;
  }

  private renderNoResults() {
    const content = this.querySummaryState.hasQuery
      ? this.strings.noResultsFor(
          this.wrapHighlight(sanitize(this.querySummaryState.query))
        )
      : this.strings.noResults();
    return <span part="no-results" innerHTML={content}></span>;
  }

  private get resultOfOptions(): Summary {
    const locale = this.bindings.i18n.language;
    return {
      count: this.querySummaryState.lastResult,
      first: this.wrapHighlight(
        this.querySummaryState.firstResult.toLocaleString(locale)
      ),
      last: this.wrapHighlight(
        this.querySummaryState.lastResult.toLocaleString(locale)
      ),
      total: this.wrapHighlight(
        this.querySummaryState.total.toLocaleString(locale)
      ),
      query: this.wrapHighlight(sanitize(this.querySummaryState.query)),
    };
  }

  private renderHasResults() {
    const content = this.querySummaryState.hasQuery
      ? this.strings.showingResultsOfWithQuery(this.resultOfOptions)
      : this.strings.showingResultsOf(this.resultOfOptions);

    return <span part="results" innerHTML={content}></span>;
  }

  public render() {
    return (
      <div class="text-on-background" part="container">
        {this.querySummaryState.hasResults
          ? [this.renderHasResults(), this.renderDuration()]
          : this.renderNoResults()}
      </div>
    );
  }
}
