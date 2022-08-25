import {
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
  QuerySummary,
  QuerySummaryState,
  buildQuerySummary,
} from '@coveo/headless/insight';
import {Component, State, h} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';
import {NoResultsCommon} from '../../common/no-results/no-results-common';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-no-results',
  styleUrl: 'atomic-insight-no-results.pcss',
  shadow: true,
})
export class AtomicInsightNoResults
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public searchStatus!: SearchStatus;
  public querySummary!: QuerySummary;

  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  @State()
  @BindStateToController('querySummary')
  @State()
  private querySummaryState!: QuerySummaryState;
  @State() public error!: Error;

  @AriaLiveRegion('no-results')
  protected ariaMessage!: string;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.querySummary = buildQuerySummary(this.bindings.engine);
  }

  public render() {
    return (
      <div class="p-3 text-center">
        {
          <NoResultsCommon
            bindings={this.bindings}
            searchStatusState={this.searchStatusState}
            querySummaryState={this.querySummaryState}
            setAriaLive={(msg) => (this.ariaMessage = msg)}
          />
        }
      </div>
    );
  }
}
