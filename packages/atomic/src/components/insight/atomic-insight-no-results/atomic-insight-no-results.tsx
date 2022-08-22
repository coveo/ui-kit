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

  private noResultsCommon!: NoResultsCommon;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.querySummary = buildQuerySummary(this.bindings.engine);
    this.noResultsCommon = new NoResultsCommon({
      querySummaryState: () => this.querySummaryState,
      searchStatusState: () => this.searchStatusState,
      bindings: this.bindings,
      setAriaLive: (message) => (this.ariaMessage = message),
    });
  }

  public render() {
    if (!this.noResultsCommon) {
      return;
    }
    return <div class="p-3 text-center">{this.noResultsCommon.render()}</div>;
  }
}
