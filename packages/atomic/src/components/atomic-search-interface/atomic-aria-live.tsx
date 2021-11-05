import {
  buildQuerySummary,
  buildSearchStatus,
  QuerySummary,
  QuerySummaryState,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Component, h, Host, State} from '@stencil/core';
import {
  Bindings,
  BindStateToController,
  InitializeBindings,
} from '../../utils/initialization-utils';

/**
 * The `atomic-aria-live` component notifies screen readers of changes in the search interface.
 * @internal
 */
@Component({
  tag: 'atomic-aria-live',
  shadow: false,
})
export class AtomicAriaLive {
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  protected searchStatus!: SearchStatus;
  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  protected querySummary!: QuerySummary;
  @BindStateToController('querySummary')
  @State()
  private querySummaryState!: QuerySummaryState;

  private get searchSummary() {
    if (!this.searchStatusState.firstSearchExecuted) {
      return '';
    }
    if (this.searchStatusState.isLoading) {
      return this.bindings.i18n.t('loading-results');
    }
    if (!this.searchStatusState.hasResults) {
      return this.bindings.i18n.t('no-results');
    }
    return this.bindings.i18n.t('showing-results-of', {
      count: this.querySummaryState.lastResult,
      first: this.querySummaryState.firstResult.toLocaleString(),
      last: this.querySummaryState.lastResult.toLocaleString(),
      total: this.querySummaryState.total.toLocaleString(),
    });
  }

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.querySummary = buildQuerySummary(this.bindings.engine);
  }

  public render() {
    return (
      <Host
        role="status"
        aria-live="polite" // redundant, but recommended in Mozilla's doc
        style={{position: 'absolute', right: '10000px'}}
      >
        {this.searchSummary}
      </Host>
    );
  }
}
