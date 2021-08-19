import {
  QuerySummary,
  QuerySummaryState,
  buildQuerySummary,
  ResultList,
  ResultListState,
  buildResultList,
} from '@coveo/headless';
import {Component, h, State} from '@stencil/core';
import {
  Bindings,
  BindStateToController,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {Button} from '../common/button';

/**
 * The `atomic-load-more-results` component allows the user to load additional results if more are available.
 *
 * @part container - The container of the component.
 * @part showing-results - The summary displaying which results are shown and how many are available.
 * @part highlight - The highlighted number of results displayed and number of results available.
 * @part progress-bar - The progress bar displaying a percentage of results shown over the total number of results available.
 * @part load-more-results-button - The "Load more results" button.
 *
 * @part ripple - The ripple effect of the component's interactive elements.
 */
@Component({
  tag: 'atomic-load-more-results',
  styleUrl: 'atomic-load-more-results.pcss',
  shadow: true,
})
export class AtomicLoadMoreResults {
  @InitializeBindings() public bindings!: Bindings;
  public querySummary!: QuerySummary;
  public resultList!: ResultList;

  @BindStateToController('querySummary')
  @State()
  private querySummaryState!: QuerySummaryState;
  @BindStateToController('resultList')
  @State()
  private resultListState!: ResultListState;
  @State() public error!: Error;

  public initialize() {
    this.querySummary = buildQuerySummary(this.bindings.engine);
    this.resultList = buildResultList(this.bindings.engine, {
      options: {
        fieldsToInclude: [],
      },
    });
  }

  private wrapHighlight(content: string) {
    return `<span class="font-bold text-on-background" part="highlight">${content}</span>`;
  }

  private renderShowingResults() {
    const locale = this.bindings.i18n.language;
    const content = this.bindings.i18n.t('showing-results-of-load-more', {
      interpolation: {escapeValue: false},
      last: this.wrapHighlight(
        this.querySummaryState.lastResult.toLocaleString(locale)
      ),
      total: this.wrapHighlight(
        this.querySummaryState.total.toLocaleString(locale)
      ),
    });

    return (
      <div
        class="my-2 text-lg text-neutral-dark"
        part="showing-results"
        innerHTML={content}
      ></div>
    );
  }

  private renderProgressBar() {
    const percentage =
      (this.querySummaryState.lastResult / this.querySummaryState.total) * 100;
    const width = `${Math.ceil(percentage)}%`;
    return (
      <div
        part="progress-bar"
        class="relative w-72 h-1 my-2 rounded bg-neutral"
      >
        <div
          class="progress-bar absolute h-full left-0 top-0 z-10 overflow-hidden rounded bg-gradient-to-r"
          style={{width}}
        ></div>
      </div>
    );
  }

  private renderLoadMoreResults() {
    return (
      <Button
        style="primary"
        text={this.bindings.i18n.t('load-more-results')}
        part="load-more-results-button"
        class="font-bold my-2 p-3"
        onClick={() => this.resultList.fetchMoreResults()}
      ></Button>
    );
  }

  public render() {
    if (!this.querySummaryState.hasResults) {
      return;
    }

    return (
      <div class="flex flex-col items-center" part="container">
        {this.renderShowingResults()}
        {this.renderProgressBar()}
        {this.resultListState.moreResultsAvailable &&
          this.renderLoadMoreResults()}
      </div>
    );
  }
}
