import {Component, h, State} from '@stencil/core';
import {
  QuerySummary,
  QuerySummaryState,
  Unsubscribe,
  buildQuerySummary,
  Engine,
} from '@coveo/headless';
import {Initialization} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-query-summary',
  styleUrl: 'atomic-query-summary.css',
  shadow: true,
})
export class AtomicQuerySummary {
  @State() state!: QuerySummaryState;

  private engine!: Engine;
  private querySummary!: QuerySummary;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    this.querySummary = buildQuerySummary(this.engine);
    this.unsubscribe = this.querySummary.subscribe(() => this.updateState());
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  public render() {
    // TODO: This whole render loop will not work with localization
    if (!this.state.hasResults) {
      return this.renderNoResults();
    }
    return this.renderHasResults();
  }

  private updateState() {
    this.state = this.querySummary.state;
  }

  private renderNoResults() {
    return <span>No results{this.renderQuery()}</span>;
  }

  private renderHasResults() {
    return (
      <span>
        Results{this.renderRange()}
        {this.renderTotal()}
        {this.renderQuery()}
        {this.renderDuration()}
      </span>
    );
  }

  private renderRange() {
    return this.renderBold(
      ` ${this.state.firstResult} - ${this.state.lastResult}`
    );
  }

  private renderQuery() {
    if (this.state.hasQuery) {
      return <span> for {this.renderBold(this.state.query)}</span>;
    }

    return '';
  }

  private renderDuration() {
    if (this.state.hasDuration) {
      return ` in ${this.state.durationInSeconds} seconds`;
    }

    return '';
  }

  private renderTotal() {
    return <span> of {this.renderBold(this.state.total.toString())}</span>;
  }

  private renderBold(input: string) {
    return <span class="bold">{input}</span>;
  }
}
