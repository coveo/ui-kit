import {Component, h, State} from '@stencil/core';
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

/**
 * @part container - The container of the whole summary
 * @part results - The results container
 * @part no-result - The container when there are no result
 * @part query - The query container
 * @part duration - The duration container
 * @part highlight - The summary highlights
 */
@Component({
  tag: 'atomic-query-summary',
  styleUrl: 'atomic-query-summary.pcss',
  shadow: false,
})
export class AtomicQuerySummary implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public querySummary!: QuerySummary;

  @BindStateToController('querySummary')
  @State()
  private querySummaryState!: QuerySummaryState;
  @State() public error!: Error;

  public initialize() {
    this.querySummary = buildQuerySummary(this.bindings.engine);
  }

  private renderNoResults() {
    return <span part="no-result">No results{this.renderQuery()}</span>;
  }

  private renderHasResults() {
    // TODO: This whole render loop will not work with localization
    return [this.renderResults(), this.renderQuery(), this.renderDuration()];
  }

  private renderResults() {
    return (
      <span part="results">
        Results {this.renderHighlight(this.range)} of{' '}
        {this.renderHighlight(this.total)}
      </span>
    );
  }

  private get range() {
    return `${this.querySummaryState.firstResult.toLocaleString()}-${this.querySummaryState.lastResult.toLocaleString()}`;
  }

  private get total() {
    return this.querySummaryState.total.toLocaleString();
  }

  private renderQuery() {
    if (this.querySummaryState.hasQuery) {
      return (
        <span part="query">
          {' '}
          for {this.renderHighlight(this.querySummaryState.query)}
        </span>
      );
    }

    return '';
  }

  private renderDuration() {
    if (this.querySummaryState.hasDuration) {
      return (
        <span part="duration">
          {' '}
          in {this.querySummaryState.durationInSeconds.toLocaleString()} seconds
        </span>
      );
    }

    return '';
  }

  private renderHighlight(input: string) {
    return <strong part="highlight">{input}</strong>;
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
