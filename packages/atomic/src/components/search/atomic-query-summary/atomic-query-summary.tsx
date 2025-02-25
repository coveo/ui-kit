import {
  QuerySummary,
  QuerySummaryState,
  buildQuerySummary,
} from '@coveo/headless';
import {Component, h, State} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {LocalizedString} from '../../../utils/jsx-utils';
import {AriaLiveRegion} from '../../../utils/stencil-accessibility-utils';
import {QuerySummaryContainer} from '../../common/query-summary/container';
import {QuerySummaryGuard} from '../../common/query-summary/guard';
import {getQuerySummaryI18nParameters} from '../../common/query-summary/utils';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-query-summary` component displays information about the current range of results and the request duration (e.g., "Results 1-10 of 123 in 0.47 seconds").
 *
 * @part container - The container for the whole summary.
 * @part results - The container for the results.
 * @part duration - The container for the duration.
 * @part highlight - The summary highlights.
 * @part query - The summary highlighted query.
 * @part placeholder - The query summary placeholder used while the search interface is initializing.
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
  @State() public error!: Error;

  @AriaLiveRegion('query-summary')
  protected ariaMessage!: string;

  public initialize() {
    this.querySummary = buildQuerySummary(this.bindings.engine);
  }

  public render() {
    const {
      firstSearchExecuted,
      hasResults,
      hasError,
      total,
      firstResult,
      lastResult,
      query,
      durationInSeconds,
      isLoading,
    } = this.querySummaryState;

    const {i18nKey, highlights, ariaLiveMessage} =
      getQuerySummaryI18nParameters({
        first: firstResult,
        last: lastResult,
        query,
        total,
        i18n: this.bindings.i18n,
        isLoading,
      });

    this.ariaMessage = ariaLiveMessage;

    return (
      <QuerySummaryGuard
        firstSearchExecuted={firstSearchExecuted}
        hasResults={hasResults}
        hasError={hasError}
      >
        <QuerySummaryContainer>
          <LocalizedString
            key={i18nKey}
            i18n={this.bindings.i18n}
            params={highlights}
            count={total}
          />
          <span class="hidden" part="duration">
            &nbsp;
            <LocalizedString
              key="in-seconds"
              i18n={this.bindings.i18n}
              params={{
                count: durationInSeconds.toLocaleString(),
              }}
            />
          </span>
        </QuerySummaryContainer>
      </QuerySummaryGuard>
    );
  }
}
