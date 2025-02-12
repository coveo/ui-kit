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
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {createAppLoadedListener} from '../../common/interface/store';
import {LoadMoreContainer} from '../../common/load-more/container';
import {LoadMoreGuard} from '../../common/load-more/guard';
import {LoadMoreProgressBar} from '../../common/load-more/progress-bar';
import {LoadMoreButton} from '../../common/load-more/stencil-button';
import {LoadMoreSummary} from '../../common/load-more/summary';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-load-more-results` component allows the user to load additional results if more are available.
 *
 * @part container - The container of the component.
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
  public querySummary!: QuerySummary;
  public resultList!: ResultList;

  @BindStateToController('querySummary')
  @State()
  private querySummaryState!: QuerySummaryState;
  @BindStateToController('resultList')
  @State()
  private resultListState!: ResultListState;
  @State() public error!: Error;
  @State() private isAppLoaded = false;

  public initialize() {
    this.querySummary = buildQuerySummary(this.bindings.engine);
    this.resultList = buildResultList(this.bindings.engine, {
      options: {
        fieldsToInclude: [],
      },
    });
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  private async onClick() {
    this.bindings.store.state.resultList?.focusOnNextNewResult();
    this.resultList.fetchMoreResults();
  }

  public render() {
    const {lastResult: from, total: to} = this.querySummaryState;
    const {i18n} = this.bindings;

    return (
      <LoadMoreGuard
        hasResults={this.querySummaryState.hasResults}
        isLoaded={this.isAppLoaded}
      >
        <LoadMoreContainer>
          <LoadMoreSummary from={from} to={to} i18n={i18n} />
          <LoadMoreProgressBar from={from} to={to} />
          <LoadMoreButton
            i18n={i18n}
            moreAvailable={this.resultListState.moreResultsAvailable}
            onClick={() => this.onClick()}
          />
        </LoadMoreContainer>
      </LoadMoreGuard>
    );
  }
}
