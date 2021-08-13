import {
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
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
import {createRipple} from '../../utils/ripple';

/**
 * The `atomic-load-more-results` component allows the user to load more results if more results are available.
 *
 * @part container - The container for the component.
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
  public searchStatus!: SearchStatus;
  public querySummary!: QuerySummary;
  public resultList!: ResultList;

  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  @BindStateToController('querySummary')
  @State()
  private querySummaryState!: QuerySummaryState;
  @BindStateToController('resultList')
  @State()
  private resultListState!: ResultListState;
  @State() public error!: Error;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
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

  private get showingResultsOptions() {
    const locales = this.bindings.i18n.languages;
    return {
      interpolation: {escapeValue: false},
      last: this.wrapHighlight(
        this.querySummaryState.lastResult.toLocaleString(locales)
      ),
      total: this.wrapHighlight(
        this.querySummaryState.total.toLocaleString(locales)
      ),
    };
  }

  private renderShowingResults() {
    const content = this.querySummaryState.hasResults
      ? this.bindings.i18n.t(
          'showing-results-of-load-more',
          this.showingResultsOptions
        )
      : '';

    return (
      <div
        class="my-2 text-lg text-neutral-dark"
        part="showing-results"
        innerHTML={content}
      ></div>
    );
  }

  private renderProgressBar() {
    const width = `${
      (this.querySummaryState.lastResult / this.querySummaryState.total) * 100
    }%`;
    return (
      <div class="relative left-0 top-0 w-72 h-1.5 my-2" part="progress-bar">
        <div class="relative left-0 top-0 z-0 flex py-0.5 bg-neutral rounded"></div>
        <div
          class="absolute left-0 top-0 z-10 flex py-0.5 overflow-hidden rounded bg-gradient-to-r more-results-progress-bar-primary more-results-progress-bar-secondary"
          style={{width}}
        ></div>
      </div>
    );
  }

  private renderLoadMoreResults() {
    return (
      <button
        part="load-more-results-button"
        class="btn-primary text-neutral-light font-bold px-2.5 py-3 my-2 focus:ring-4"
        onClick={() => this.resultList.fetchMoreResults()}
        onMouseDown={(e) => createRipple(e, {color: 'neutral'})}
      >
        {this.bindings.i18n.t('load-more-results')}
      </button>
    );
  }

  public render() {
    if (!this.searchStatusState.hasResults) {
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
