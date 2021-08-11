import {
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
  QuerySummary,
  QuerySummaryState,
  buildQuerySummary,
} from '@coveo/headless';
import {Component, h, State} from '@stencil/core';
import {
  Bindings,
  BindStateToController,
  InitializeBindings,
} from '../../utils/initialization-utils';

/**
 * The `atomic-load-more-results` component allows the user to load more results if more results are available.
 *
 * @part container - The container for the component.
 * @part showing-results - The summary displaying which results are shown and how many are available.
 * @part highlight - The highlighted number of results displayed and number of results available.
 * @part progress-bar - The progress bar displaying a percentage of results shown over the total number of results available.
 * @part load-more-results-button - The "Load more results" button.
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

  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  @BindStateToController('querySummary')
  @State()
  private querySummaryState!: QuerySummaryState;
  @State() public error!: Error;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.querySummary = buildQuerySummary(this.bindings.engine);
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
    return <div part="progress-bar"></div>;
  }

  private renderLoadMoreResults() {
    return (
      <button
        part="load-more-results-button"
        class="text-neutral-light font-bold bg-primary px-2.5 py-3 rounded-md my-3 hover:bg-primary-light focus:ring-4 focus:outline-none"
        onClick={() => console.log('load results')}
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
      <div class="flex flex-col" part="container">
        {this.renderShowingResults()}
        {this.renderProgressBar()}
        {this.renderLoadMoreResults()}
      </div>
    );
  }
}
