import {
  buildHistoryManager,
  HistoryManager,
  HistoryManagerState,
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
  QuerySummary,
  QuerySummaryState,
  buildQuerySummary,
} from '@coveo/headless';
import {Component, h, Prop, State} from '@stencil/core';
import {
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {AriaLiveRegion} from '../../../utils/stencil-accessibility-utils';
import {Cancel} from '../../common/no-items/cancel';
import {NoItemsContainer} from '../../common/no-items/container';
import {NoItemsGuard} from '../../common/no-items/guard';
import {MagnifyingGlass} from '../../common/no-items/magnifying-glass';
import {NoItems} from '../../common/no-items/no-items';
import {SearchTips} from '../../common/no-items/tips';
import {getSummary} from '../../common/no-items/utils';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-no-results` component displays search tips and a "Cancel last action" button when there are no results. Any additional content slotted inside of its element will be displayed as well.
 *
 * @part cancel-button - The "Cancel last action" button.
 * @part no-results - The text indicating that no results were found for the search.
 * @part search-tips - The search tips to help the user correct the query.
 * @part highlight - The highlighted query.
 * @part icon - The magnifying glass icon.
 */
@Component({
  tag: 'atomic-no-results',
  styleUrl: 'atomic-no-results.pcss',
  shadow: true,
})
export class AtomicNoResults {
  @InitializeBindings() public bindings!: Bindings;
  public searchStatus!: SearchStatus;
  public history!: HistoryManager;
  public querySummary!: QuerySummary;

  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  @BindStateToController('history')
  @State()
  private historyState!: HistoryManagerState;
  @BindStateToController('querySummary')
  @State()
  private querySummaryState!: QuerySummaryState;
  @State() public error!: Error;

  @AriaLiveRegion('no-results')
  protected ariaMessage!: string;

  /**
   * Whether to display a button which cancels the last available action.
   */
  @Prop({reflect: true}) enableCancelLastAction = true;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.history = buildHistoryManager(this.bindings.engine);
    this.querySummary = buildQuerySummary(this.bindings.engine);
  }

  public render() {
    const {
      bindings: {i18n},
    } = this;
    this.ariaMessage = getSummary(
      i18n,
      this.querySummaryState.query,
      this.searchStatusState.hasResults,
      'no-results'
    );

    return (
      <NoItemsGuard {...this.searchStatusState}>
        <NoItemsContainer>
          <MagnifyingGlass />
          <NoItems
            query={this.querySummaryState.query}
            i18n={i18n}
            i18nKey="no-results"
          />
          <SearchTips i18n={i18n} />
          {this.enableCancelLastAction && this.historyState.past.length ? (
            <Cancel
              i18n={i18n}
              onClick={() => this.history.backOnNoResults()}
            />
          ) : null}
        </NoItemsContainer>
      </NoItemsGuard>
    );
  }
}
