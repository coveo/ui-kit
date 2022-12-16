import {
  buildQuerySummary,
  QuerySummary,
  QuerySummaryState,
} from '@coveo/headless/insight';
import {Component, State, h} from '@stencil/core';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {QuerySummaryCommon} from '../../common/query-summary/query-summary-common';
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
    if (this.querySummaryState.hasQuery) {
      return (
        <div class="px-6 pt-4 pb-1">
          <QuerySummaryCommon
            setAriaLive={(msg) => (this.ariaMessage = msg)}
            bindings={this.bindings}
            querySummaryState={this.querySummaryState}
          />
        </div>
      );
    }

    if (this.querySummaryState.hasError) {
      return;
    }

    return (
      <div class="bg-[#F1F2FF] text-[#54698D] px-6 py-4 italic">
        {this.bindings.i18n.t('insight-related-cases')}
      </div>
    );
  }
}
