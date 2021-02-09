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

/**
 * TODO: document and edit parts
 * @part container - The container of the whole summary
 * @part results - The results container
 * @part no-results - The container when there are no results
 * @part duration - The duration container
 *
 * TODO: remove
 * @part query - The query container
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

  @BindStateToController('querySummary')
  @State()
  private querySummaryState!: QuerySummaryState;
  @BindStateToI18n()
  @State()
  private strings = {
    noResults: () => this.bindings.i18n.t('noResults'),
    noResultsFor: (query: string) =>
      this.bindings.i18n.t('noResultsFor', {query}),
    showingResultsOf: (first: number, last: number, total: number) =>
      this.bindings.i18n.t('showingResultsOf', {first, count: last, total}),
    showingResultsOfWithQuery: (
      first: number,
      last: number,
      total: number,
      query: string
    ) =>
      this.bindings.i18n.t('showingResultsOfWithQuery', {
        first,
        count: last,
        total,
        query,
      }),
    inSeconds: (count: number) => this.bindings.i18n.t('inSeconds', {count}),
  };
  @State() public error!: Error;

  @Prop() enableNoResult = true; // TODO: should be true only if atomic-no-result exists
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

  private renderNoResults() {
    if (!this.enableNoResult) {
      return;
    }

    const content = this.querySummaryState.hasQuery
      ? this.strings.noResultsFor(this.querySummaryState.query)
      : this.strings.noResults();
    return <span part="no-results">{content}</span>;
  }

  private renderHasResults() {
    const content = this.querySummaryState.hasQuery
      ? this.strings.showingResultsOfWithQuery(
          this.querySummaryState.firstResult,
          this.querySummaryState.lastResult,
          this.querySummaryState.total,
          this.querySummaryState.query
        )
      : this.strings.showingResultsOf(
          this.querySummaryState.firstResult,
          this.querySummaryState.lastResult,
          this.querySummaryState.total
        );
    return [<span part="results">{content}</span>, this.renderDuration()];
  }

  public render() {
    return (
      <div part="container">
        {this.querySummaryState.hasResults
          ? this.renderHasResults()
          : this.renderNoResults()}
      </div>
    );
  }
}
