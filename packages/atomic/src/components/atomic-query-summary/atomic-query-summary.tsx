import {Component, h, State} from '@stencil/core';
import {
  QuerySummary,
  QuerySummaryState,
  buildQuerySummary,
} from '@coveo/headless';
import {
  Initialization,
  Bindings,
  AtomicComponentInterface,
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
  styleUrl: 'atomic-query-summary.css',
  shadow: true,
})
export class AtomicQuerySummary implements AtomicComponentInterface {
  @State() controllerState!: QuerySummaryState;

  public bindings!: Bindings;
  public controller!: QuerySummary;

  @Initialization()
  public initialize() {
    this.controller = buildQuerySummary(this.bindings.engine);
  }

  public render() {
    return (
      <div part="container">
        {this.controllerState.hasResults
          ? this.renderHasResults()
          : this.renderNoResults()}
      </div>
    );
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
    return `${this.controllerState.firstResult.toLocaleString()}-${this.controllerState.lastResult.toLocaleString()}`;
  }

  private get total() {
    return this.controllerState.total.toLocaleString();
  }

  private renderQuery() {
    if (this.controllerState.hasQuery) {
      return (
        <span part="query">
          {' '}
          for {this.renderHighlight(this.controllerState.query)}
        </span>
      );
    }

    return '';
  }

  private renderDuration() {
    if (this.controllerState.hasDuration) {
      return (
        <span part="duration">
          {' '}
          in {this.controllerState.durationInSeconds.toLocaleString()} seconds
        </span>
      );
    }

    return '';
  }

  private renderHighlight(input: string) {
    return <strong part="highlight">{input}</strong>;
  }
}
