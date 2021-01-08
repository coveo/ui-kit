import {Component, h, State} from '@stencil/core';
import {
  QuerySummary,
  QuerySummaryState,
  Unsubscribe,
  buildQuerySummary,
} from '@coveo/headless';
import {Initialization, AtomicContext} from '../../utils/initialization-utils';

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
  styleUrl: 'atomic-query-summary.css',
  shadow: true,
})
export class AtomicQuerySummary {
  @State() state!: QuerySummaryState;

  private context!: AtomicContext;
  private querySummary!: QuerySummary;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    this.querySummary = buildQuerySummary(this.context.engine);
    this.unsubscribe = this.querySummary.subscribe(() => this.updateState());
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  public render() {
    return (
      <div part="container">
        {this.state.hasResults
          ? this.renderHasResults()
          : this.renderNoResults()}
      </div>
    );
  }

  private updateState() {
    this.state = this.querySummary.state;
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
    return `${this.state.firstResult.toLocaleString()}-${this.state.lastResult.toLocaleString()}`;
  }

  private get total() {
    return this.state.total.toLocaleString();
  }

  private renderQuery() {
    if (this.state.hasQuery) {
      return (
        <span part="query"> for {this.renderHighlight(this.state.query)}</span>
      );
    }

    return '';
  }

  private renderDuration() {
    if (this.state.hasDuration) {
      return (
        <span part="duration">
          {' '}
          in {this.state.durationInSeconds.toLocaleString()} seconds
        </span>
      );
    }

    return '';
  }

  private renderHighlight(input: string) {
    return <strong part="highlight">{input}</strong>;
  }
}
