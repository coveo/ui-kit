import {
  buildQuerySummary,
  QuerySummary,
  QuerySummaryState,
} from '@coveo/headless/insight';
import {Component, State, h} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {LocalizedString} from '../../../utils/jsx-utils';
import {AriaLiveRegion} from '../../../utils/stencil-accessibility-utils';
import {QuerySummaryContainer} from '../../common/query-summary/stencil-container';
import {QuerySummaryGuard} from '../../common/query-summary/stencil-guard';
import {getQuerySummaryI18nParameters} from '../../common/query-summary/stencil-utils';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-query-summary',
  styleUrl: 'atomic-insight-query-summary.pcss',
  shadow: true,
})
export class AtomicQuerySummary
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
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
      hasError,
      hasQuery,
      hasResults,
      firstSearchExecuted,
      firstResult,
      lastResult,
      isLoading,
      query,
      total,
    } = this.querySummaryState;
    const {ariaLiveMessage, highlights, i18nKey} =
      getQuerySummaryI18nParameters({
        first: firstResult,
        i18n: this.bindings.i18n,
        isLoading,
        last: lastResult,
        query,
        total,
      });

    if (hasQuery) {
      this.ariaMessage = ariaLiveMessage;
      return (
        <QuerySummaryGuard
          firstSearchExecuted={firstSearchExecuted}
          hasResults={hasResults}
          hasError={hasError}
        >
          <QuerySummaryContainer additionalClasses="px-6 py-4">
            <LocalizedString
              key={i18nKey}
              i18n={this.bindings.i18n}
              params={highlights}
              count={total}
            ></LocalizedString>
          </QuerySummaryContainer>
        </QuerySummaryGuard>
      );
    }

    if (this.querySummaryState.hasError) {
      return;
    }

    return (
      <div class="bg-[#F1F2FF] px-6 py-4 text-[#54698D] italic">
        {this.bindings.i18n.t('insight-related-cases')}
      </div>
    );
  }
}
