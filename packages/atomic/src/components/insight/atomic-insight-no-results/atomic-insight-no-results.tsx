import {
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
  QuerySummary,
  QuerySummaryState,
  buildQuerySummary,
} from '@coveo/headless/insight';
import {Component, State, h} from '@stencil/core';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {NoItemsContainer} from '../../common/no-items/container';
import {NoItemsGuard} from '../../common/no-items/guard';
import {MagnifyingGlass} from '../../common/no-items/magnifying-glass';
import {NoItems} from '../../common/no-items/no-items';
import {SearchTips} from '../../common/no-items/tips';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

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
    const {
      bindings: {i18n},
    } = this;
    return (
      <div class="p-3 text-center">
        <NoItemsGuard {...this.searchStatusState}>
          <NoItemsContainer>
            <MagnifyingGlass />
            <NoItems
              query={this.querySummaryState.query}
              i18n={i18n}
              i18nKey="no-results"
            />
            <SearchTips i18n={i18n} />
          </NoItemsContainer>
        </NoItemsGuard>
      </div>
    );
  }
}
